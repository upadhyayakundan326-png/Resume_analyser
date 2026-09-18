const OTP = require("../models/otp")
const user = require("../models/user")
const jwt = require("jsonwebtoken");

const verify = async(req,res)=>{

    const {email,otp}=req.body
    try{

    const otpData = await OTP.findOne({email,otp})

    if(!otpData){
       return res.status(400).json({
            message:"invalid otp" 
        })
    }
         //IF OTP IS VALID UPDATE IS 

    await user.findOneAndUpdate(
    { email },
    { isVerified: true }
);

    //AFTER UPDATE DELETE THE USED OTP

    await OTP.findOneAndDelete({
        _id:otpData._id
    })
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

