const express = require("express");

const router = express.Router();

const { createJob } = require("../controler/jobcontroler");

router.post("/create", createJob);

module.exports = router;