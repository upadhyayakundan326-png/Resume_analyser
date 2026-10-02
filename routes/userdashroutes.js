const express = require("express");

const router = express.Router();

const userdash = require("../controler/totalanalyse")
const authMiddlewear = require("../middlewear/authmiddlewear")

router.get("/dash",authMiddlewear,userdash)
module.exports = router