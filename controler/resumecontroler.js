const Resume = require("../models/resume");
const Job = require("../models/job");
const cloudinary = require("../config/cloudinary");
const { PDFParse } = require("pdf-parse");
const { createWorker } = require("tesseract.js");
const airesult = require("../service/ai_service");

const uploadResume = async (req, res) => {
    try {

        console.log(req.file);

        // 1. Check resume file
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

        // 2. Get jobId from request
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

        console.log("Job found:", job.title);

        // 4. File information
        console.log(req.file.mimetype);
        console.log(req.file.size);
        console.log(req.file.buffer.length);

        // 5. Extract text
        let extractedText = "";

        console.log("Request received");

        // PDF PARSING
        if (req.file.mimetype === "application/pdf") {

            const parser = new PDFParse({
                data: req.file.buffer
            });

            const resultText = await parser.getText();
        
            extractedText = resultText.text;

            console.log("PDF text extraction done");

            console.log(
                `Extracted text is: ${extractedText}`
            );

            await parser.destroy();
        }

        // IMAGE OCR
        if (
            req.file.mimetype === "image/jpeg" ||
            req.file.mimetype === "image/png" ||
            req.file.mimetype === "image/webp"
        ) {

            console.log("Starting OCR");

            const worker = await createWorker("eng");

            console.log("Worker is working");

            const answer = await worker.recognize(
                req.file.buffer
            );

            extractedText = answer.data.text;

            await worker.terminate();

            console.log("OCR done");
        }

        // 6. AI Analysis
        const analyz = JSON.parse(
            await airesult(extractedText, job)
        );

        console.log("AI result:", analyz);

        // 7. Upload resume to Cloudinary
        const result = await new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "resume_analyzer",
                    resource_type: "raw"
                },

                (error, result) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }

                }
            );

            stream.end(req.file.buffer);
        });

        // 8. Save resume in MongoDB
        const newResume = await Resume.create({

            user: req.user.userId,

            resumeName: req.file.originalname,

            fileUrl: result.secure_url,

            score: analyz.score,

            skills: analyz.skills,

            analysis: analyz.analysis

        });

        // 9. Send response
        res.status(201).json({

            message: "Resume uploaded successfully",

            resume: newResume,

            extractedText: extractedText,
               

          

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    uploadResume
};