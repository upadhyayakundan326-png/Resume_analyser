const Resume = require("../models/resume");

const getResumeStatus = async (req, res) => {
    try {
        const { resumeId } = req.params;

        const resume = await Resume.findOne({
            _id: resumeId,
            user: req.user.userId
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        return res.status(200).json({
            success: true,
            status: resume.status,
            score: resume.score,
            skills: resume.skills,
            analysis: resume.analysis,
            improvement: resume.improvement
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = getResumeStatus