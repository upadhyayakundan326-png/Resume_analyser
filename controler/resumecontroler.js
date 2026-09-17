const Resume = require("../models/resume");
const cloudinary = require("../config/cloudinary");
const {PDFParse} = require("pdf-parse")


const uploadResume = async (req, res) => {
    try {

        // 1. Check PDF
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

      // PDF PARSING 

      console.log(req.file.mimetype)
         console.log(req.file.size)
            console.log(req.file.buffer.length)

    // AFTER USING PDF PARSER WE NEED TO UPLOAD RESUME IN PDF FORMAT
    //OTHERWISE IT CANNOT READ THE TEXT FROM THE IMAGE 

     const parser = new PDFParse({
        data:req.file.buffer
     });
     const resultText = await parser.getText();
     const extractedText = resultText.text
      console.log(`extracted text is ${extractedText}`)
      console.log("full result is ",resultText)
    

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

            resume: newResume,
            extractedText:extractedText

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