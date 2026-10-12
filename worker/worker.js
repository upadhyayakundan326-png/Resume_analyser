
const { Worker } = require("bullmq");

const redisConnection = require("../config/redis");
const Resume = require("../models/resume");
const Job = require("../models/job");
const airesult = require("../service/ai_service");

const worker = new Worker(
    "resume-analysis",

    async (job) => {
        // Controller ke queue.add() se aaya data
        const {
            resumeId,
            userId,
            jobId,
            extractedText
        } = job.data;

        let resume;
        
        try {
            console.log("Resume analysis started:", job.id);

            // 1. MongoDB mein resume find karo
             resume = await Resume.findOne({
                _id: resumeId,
                user: userId
            });

            if (!resume) {
                throw new Error("Resume not found");
            }

            // 2. Status processing karo
            resume.status = "processing";
            await resume.save();

            // 3. Extracted text validate karo
            if (
                typeof extractedText !== "string" ||
                !extractedText.trim()
            ) {
                throw new Error("Resume text is empty");
            }

            // 4. Job details MongoDB se lao
            const jobDetails = await Job.findById(jobId);

            if (!jobDetails) {
                throw new Error("Job not found");
            }

            // 5. Gemini AI se analysis karwao
            const response = await airesult(
                extractedText,
                jobDetails
            );

            const analysis =
                typeof response === "string"
                    ? JSON.parse(response)
                    : response;

            // 6. AI response validate karo
            if (
                typeof analysis.score !== "number" ||
                !Array.isArray(analysis.skills) ||
                typeof analysis.analysis !== "string" ||
                !Array.isArray(analysis.improvements)
            ) {
                throw new Error("Invalid AI response format");
            }

            // 7. MongoDB mein result update karo
            resume.score = analysis.score;
            resume.skills = analysis.skills;
            resume.analysis = analysis.analysis;
       resume.improvement = analysis.improvements;

       // 8. Analysis complete
       resume.status = "completed";
       await resume.save();

     console.log("Resume analysis completed:", resumeId);

            return {
                success: true,
                resumeId,
                status: "completed"
            };

        } catch (error) {
            console.error("Worker error:", error.message);

            if (resume) {
                resume.status = "failed";
                await resume.save();
            }

            // BullMQ ko job failure batana
            throw error;
        }
    },

    {
        connection: redisConnection,
        concurrency: 5
    }
);

// Job successful hua
worker.on("completed", (job, result) => {
    console.log("Job completed:", job.id, result);
});

// Job fail hua
worker.on("failed", (job, error) => {
    console.error(
        "Job failed:",
        job?.id,
        error.message
    );
});

console.log("Resume Analysis Worker is running");

module.exports = worker;