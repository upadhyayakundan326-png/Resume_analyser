const express = require("express");

const router = express.Router();

const {
    createJob
} = require("../controler/jobcontroler");

// Create Job
router.post("/create", createJob);

module.exports = router;