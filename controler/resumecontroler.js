
const Resume = require("../models/resume");
const Job = require("../models/job");
const cloudinary = require("../config/cloudinary");
const { PDFParse } = require("pdf-parse");
const { createWorker } = require("tesseract.js");
const redisQueue = require("../queues/queues");

const uploadResume = async (req, res) => {
    try {
        // 1. Check resume file
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

        // 2. Get jobId
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required"
            });
        }

        // 3. Find job
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // 4. Extract text from resume
        let extractedText = "";

        // PDF parsing
        if (req.file.mimetype === "application/pdf") {
            const parser = new PDFParse({
                data: req.file.buffer
            });

            try {
                const resultText = await parser.getText();
                extractedText = resultText.text;
            } finally {
                await parser.destroy();
            }
        }

        // Image OCR
        else if (
            [
                "image/jpeg",
                "image/png",
                "image/webp"
            ].includes(req.file.mimetype)
        ) {
            const ocrWorker = await createWorker("eng");

            try {
                const answer = await ocrWorker.recognize(
                    req.file.buffer
                );

                extractedText = answer.data.text;
            } finally {
                await ocrWorker.terminate();
            }
        } else {
            return res.status(400).json({
                message: "Unsupported resume file type"
            });
        }

        // 5. Check extracted text
        if (!extractedText || !extractedText.trim()) {
            return res.status(400).json({
                message: "Could not extract text from resume"
            });
        }

        // 6. Upload resume to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "resume_analyzer",
                    resource_type: "raw"
                },
                (error, uploadResult) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(uploadResult);
                    }
                }
            );

            stream.end(req.file.buffer);
        });

        // 7. Save initial resume in MongoDB
        const newResume = await Resume.create({
            user: req.user.userId,
            resumeName: req.file.originalname,
            fileUrl: result.secure_url,

            score: 0,
            skills: [],
            analysis: "",
            improvement: [],

            status: "queued"
        });

        // 8. Add task to BullMQ queue
        let queueJob;

        try {
            queueJob = await redisQueue.add("analyze", {
                userId: req.user.userId,
                resumeId: newResume._id.toString(),
                jobId: job._id.toString(),
                extractedText: extractedText
            });
        } catch (error) {
            // Queue mein task add nahi hua toh status update karo
            newResume.status = "failed";
            await newResume.save();

            throw error;
        }

        // 9. Respond without waiting for Gemini analysis
        return res.status(202).json({
            success: true,
            message: "Resume uploaded. Analysis queued.",
            status: "queued",
           
            resume: newResume
        });

    } catch (error) {
        console.error("Upload error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadResume
};