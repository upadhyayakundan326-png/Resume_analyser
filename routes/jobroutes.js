
const express = require("express");
const router = express.Router();
 const  authMiddleware = require("../middlewear/authmiddlewear")

const {
    createJob,
    getJobs,
    deleteSavedJob
} = require("../controler/jobcontroler");

router.post("/create", createJob);
router.get("/", getJobs);
router.delete(
    "/saved/:jobId",
    authMiddleware,
    deleteSavedJob
);

module.exports = router;
