
const mongoose = require("mongoose");
const Resume = require("../models/resume");
const { redisClient } = require("../config/redis");

const analyseresume = async (req, res) => {
    try {
        const currentUser = new mongoose.Types.ObjectId(
            req.user.userId
        );

        const cachkey = `resume-analysis:${req.user.userId}`;

        // STEP 1: Check Redis cache
        const cachedData = await redisClient.get(cachkey);

        if (cachedData) {
            console.log("Data Redis se aaya");

            return res.status(200).json({
                success: true,
                source: "redis",
                result: JSON.parse(cachedData)
            });
        }

        console.log("Data Redis mein nahi mila");

        // STEP 2: MongoDB aggregation
        const allResume = await Resume.aggregate([
            {
                $match: {
                    user: currentUser
                }
            },
            {
                $group: {
                    _id: null,
                    totalresume: { $sum: 1 },
                    maximunscore: { $max: "$score" },
                    minimumscore: { $min: "$score" },
                    averagescore: { $avg: "$score" }
                }
            }
        ]);

        // STEP 3: Handle empty result
        const result = allResume[0] || {
            totalresume: 0,
            maximunscore: 0,
            minimumscore: 0,
            averagescore: 0
        };

        // STEP 4: Save result in Redis
        await redisClient.setEx(
            cachkey,
            300,
            JSON.stringify(result)
        );

        // STEP 5: Send response
        return res.status(200).json({
            success: true,
            source: "mongo",
            result: result
        });

    } catch (error) {
        console.error("DASHBOARD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = analyseresume;
