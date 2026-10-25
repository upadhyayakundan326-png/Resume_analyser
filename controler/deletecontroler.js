const Resume = require("../models/resume");

const deleteResume = async (req, res) => {
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

        await Resume.deleteOne({
            _id: resumeId,
            user: req.user.userId
        });

        return res.status(200).json({
            success: true,
            message: "Resume deleted successfully"
        });

    } catch (error) {
        console.error("DELETE RESUME ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete resume"
        });
    }
};

module.exports = deleteResume;