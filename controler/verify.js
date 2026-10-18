const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { redisClient } = require("../config/redis");
const User = require("../models/user");

const verify = async (req, res) => {

    const { userName, email, password, otp } = req.body;
    const otpKey = `otp:${email}`;

    try {

        const otpData = await redisClient.get(otpKey);

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "otp expired or not found"
            });
        }

        if (otpData !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: "invalid otp"
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            userName,
            email,
            password: hashedPassword,
            isVerified: true
        });

        // delete the otp
        await redisClient.del(otpKey);

        return res.status(201).json({
            success: true,
            message: "OTP verified and account created successfully",
            userId: newUser._id
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = verify;