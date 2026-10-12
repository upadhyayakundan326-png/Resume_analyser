 const express = require("express")
 const router = express.Router()
const getResumeStatus = require ("../controler/states")
const authMiddlewear = require("../middlewear/authmiddlewear")


router.get("/getStates/:resumeId",authMiddlewear,getResumeStatus)

module.exports = router

