
const express = require("express");
const router = express.Router();


const forgot_pass  = require("../controler/forgot_pass");
const { resetPassword } = require("../controler/reset_pass");


// ================= FORGOT PASSWORD =================
router.post("/forgot-password", forgot_pass);

// ================= RESET PASSWORD =================
router.post("/reset-password", resetPassword);

module.exports = router;
