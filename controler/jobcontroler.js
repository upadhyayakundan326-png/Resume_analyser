
const Job = require("../models/job");

// Create a new job
const createJob = async (req, res) => {
    try {
        const { title, company, description, requiredSkills } = req.body;

        if (!title || !company || !description) {
            return res.status(400).json({
                message: "Title, company and description are required"
            });
        }

        const skills = Array.isArray(requiredSkills)
            ? requiredSkills
            : [];

        const job = await Job.create({
            title,
            company,
            description,
            requiredSkills: skills
        });

        return res.status(201).json({
            success: true,
            message: "Job created successfully",
            job
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Fetch saved jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            jobs
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createJob,
    getJobs
};
