const dotenv = require("dotenv");

dotenv.config(); 

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const{connectRedis} =require("./config/redis")



const connectDB = require("./config/db")
const resumeRoutes = require("./routes/resumeroutes")
const authroutes =require("./routes/authroutes")
const jobroutes = require("./routes/jobroutes")
const getroute =require("./routes/getroute")
const userdash = require("./routes/userdashroutes")
const states = require("./routes/statesroute")
const resetpassword = require("./routes/resetroutes")
const deleteroute= require("./routes/deleteroute")
const getprofile = require("./routes/getprofile")




//FOR CREATING A JOB TO ANALYSE IN AI .
//WE NEED TO WRITE JOBSCHEMA AND JJKC

const app = express();
connectDB()
connectRedis()
  require("./worker/worker");
  app.use(
    cors({
       origin:"http://localhost:5173" ,
       credentials:true
    })
  )

app.use(cookieParser());

// Middleware

app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Resume Analyzer Server is running");
});
app.use("/api/resume", resumeRoutes)
app.use("/api/auth", authroutes)
app.use("/api/job",jobroutes)
app.use("/api/getresume",getroute)
app.use("/api/dashboard",userdash) 
app.use("/api/states",states)
app.use("/api/changepass",resetpassword)
app.use ("/api/delete", deleteroute)
app.use ("/api/getprofile", getprofile)


// Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});