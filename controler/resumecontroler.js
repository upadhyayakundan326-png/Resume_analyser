const Resume = require("../models/resume");
const cloudinary = require("../config/cloudinary");

const uploadResume = async (req, res) => {
    try {

        // PDF check
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

        // Frontend se userId aayegi
        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        // Cloudinary upload
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


        // MongoDB me resume save
        const newResume = await Resume.create({

            user: userId,

            resumeName: req.file.originalname,

            fileUrl: result.secure_url

        });


        res.status(201).json({
            message: "Resume uploaded successfully",
            resume: newResume
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    uploadResume
};