
const { redisClient } = require("../config/redis");
const User = require("../models/user");

const verify = async (req, res) => {
    const { email, otp } = req.body;
    const otpKey = `otp:${email}`;

    try {
        // Check required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        // Get OTP data from Redis
        const storedData = await redisClient.get(otpKey);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found"
            });
        }

        // Convert Redis JSON string into object
        const otpData = JSON.parse(storedData);

        // Compare OTP
        if (String(otpData.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check whether email already exists
        const user = await User.findOne({
            email: otpData.email
        });

        if (user) {
            await redisClient.del(otpKey);

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Create user after successful OTP verification
        const newUser = await User.create({
            userName: otpData.userName,
            email: otpData.email,
            password: otpData.password,
            isVerified: true
        });

        // Delete OTP data from Redis
        await redisClient.del(otpKey);

        return res.status(201).json({
            success: true,
            message: "OTP verified and account created successfully",
            userId: newUser._id
        });

    } catch (error) {
        console.error("Verify error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = verify;
