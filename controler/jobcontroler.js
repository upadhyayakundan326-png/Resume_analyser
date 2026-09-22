const Job = require("../models/job");

const createJob = async (req, res) => {
  try {
    const { title, company, description, requiredSkills } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        message: "Title, company and description are required"
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      requiredSkills: requiredSkills || []
    });

    res.status(201).json({
      message: "Job created successfully",
      job
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create job",
      error: error.message
    });
  }
};

module.exports = {
  createJob
};