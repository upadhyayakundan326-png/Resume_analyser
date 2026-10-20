const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sendMail = require("../utilits/sendmail");
const {redisClient}= require("../config/redis");


const forgot_pass = async(req,res)=>{
    try{
    const {email}=req.body
    const forgot_key = `forgot:${email}`
      if (!email) {
            return res.status(400).json({
                message: "Enter your Email first"
            });
        }

        console.log("STEP 1: forgoting started");
        
      
 const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

         const otp = Math.floor(100000 + Math.random() * 900000);
        
                // OTP expiry - 5 minutes
               const forgotData = {
           
            email,
           
            otp: otp.toString()
        
               }
        await redisClient.setEx(
            forgot_key,
            300,
            JSON.stringify(forgotData)
        );
        
        console.log("STEP 4: OTP and signup data saved in Redis");
        
                await sendMail(
                    email,
                    "Password Reset OTP",
      `Your password reset OTP is ${otp}. It expires in 5 minutes.`
                );
        
                return res.status(200).json({
                    success: true,
                    message: "OTP sent successfully."
                });

}
 catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = forgot_pass

