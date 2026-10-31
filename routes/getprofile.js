
const express = require("express");
const router = express.Router();
const {getProfile}  = require("../controler/getprofile");
const authMiddleware = require("../middlewear/authmiddlewear");

router.get("/profile", authMiddleware, getProfile);
  

module.exports=router

