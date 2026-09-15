const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resumeName: {
            type: String,
            required: true,
            trim: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        score: {
            type: Number,
            default: 0
        },

        skills: {
            type: [String],
            default: []
        },

        analysis: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;