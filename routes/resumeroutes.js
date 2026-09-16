const express = require("express");

const router = express.Router();
const {uploadResume} = require("../controler/resumecontroler")

const upload = require("../middlewear/upload");
const authMiddlewear = require("../middlewear/authmiddlewear")


router.post(
    "/upload",
    upload.single("resume"),
    authMiddlewear,
    uploadResume
);



module.exports = router;