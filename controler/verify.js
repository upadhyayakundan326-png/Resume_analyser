
const jwt = require("jsonwebtoken");
const {redisClient}= require("../config/redis")
const User = require("../models/user");

const verify = async(req,res)=>{

    const {email,otp}=req.body
    const otpKey = `otp:${email}`;
    try{

          
    const otpData = await redisClient.get(otpKey)

    if(!otpData){
       return res.status(400).json({
        success:false,
            message:"otp expired or not found " 
        })
    }
    if(otpData!==otp.toString()){
        return res.status(200).json({
           success:false,
           message:"invalid otp"

        })
    }
     const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // User verify karo
        user.isVerified = true;
        await user.save();


         //delete the otp
    await redisClient.del(
        otpKey
    )
     res.status(200).json({
      message: "OTP verified successfully"
    });


       
       
    }

    catch(error){
    res.status(500).json({
        message: error.message
    });
}

}
module.exports = verify

