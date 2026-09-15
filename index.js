const dotenv = require("dotenv");

dotenv.config(); 

const express = require("express");
const cors = require("cors");


const connectDB = require("./config/db")
const resumeRoutes = require("./routes/resumeroutes")


const app = express();
connectDB()

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Resume Analyzer Server is running");
});
app.use("/api/resume", resumeRoutes)

// Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});