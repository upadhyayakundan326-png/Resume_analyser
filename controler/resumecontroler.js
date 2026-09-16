const Resume = require("../models/resume");
const cloudinary = require("../config/cloudinary");


const uploadResume = async (req, res) => {
    try {

        // 1. Check PDF
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

      
        

        // 3. Upload PDF to Cloudinary
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

        // 4. Save resume in MongoDB
        const newResume = await Resume.create({

           user: req.user.userId,

            resumeName: req.file.originalname,

            fileUrl: result.secure_url,

            score: 0,

            skills: [],

            analysis: ""

        });

        // 5. Response
        res.status(201).json({

            message: "Resume uploaded successfully",

            resume: newResume

        });

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    uploadResume
};