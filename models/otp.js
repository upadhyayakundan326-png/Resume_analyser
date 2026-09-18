const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
   email:{
    type:String,
    required:true
   },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// OTP expire hone ke baad automatically delete
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);