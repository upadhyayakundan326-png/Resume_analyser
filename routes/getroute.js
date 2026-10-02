const express = require("express");
const router = express.Router();
const { getAllResume}=require("../controler/getresumecontroler")
const authmiddlewear = require("../middlewear/authmiddlewear")

router.get("/getresumes",authmiddlewear,getAllResume)

module.exports = router 


