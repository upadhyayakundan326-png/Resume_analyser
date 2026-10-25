
const express = require("express");
const router = express.Router();
const deleteResume = require("../controler/deletecontroler")
const authmiddlewear = require("../middlewear/authmiddlewear")

router.delete("/del/:resumeId",authmiddlewear,deleteResume)

module.exports=router