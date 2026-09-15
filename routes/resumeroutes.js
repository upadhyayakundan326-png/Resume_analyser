const express = require("express");

const router = express.Router();
const {uploadResume} = require("../controler/resumecontroler")

const upload = require("../middlewear/upload");


router.post(
    "/upload",
    upload.single("resume"),
    uploadResume
);

module.exports = router;