const express = require("express");
const router = express.Router();
const { getAllResume}=require("../controler/getresumecontroler")
const authmiddlewear = require("../middlewear/authmiddlewear")

router.get("/getresume",authmiddlewear,getAllResume)

module.exports = router 


