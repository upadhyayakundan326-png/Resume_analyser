
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { redisClient } = require("../config/redis");

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // 1. Check fields
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and new password are required"
            });
        }

        // 2. Get OTP data from Redis
        const forgot_key = `forgot:${email}`;

        const data = await redisClient.get(forgot_key);

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found"
            });
        }

        // 3. Convert JSON string into object
        const forgotData = JSON.parse(data);

        // 4. Compare OTP
        if (forgotData.otp !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // 5. Check password length
        /*if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }*/

        // 6. Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 7. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 8. Update password in MongoDB
        user.password = hashedPassword;
        await user.save();

        // 9. Delete OTP from Redis
        await redisClient.del(forgot_key);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { resetPassword };
