const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sendMail = require("../utilits/sendmail");
const {redisClient}= require("../config/redis");



// ================= SIGNUP =================
const signup = async (req, res) => {
    try {

        const { userName, email, password } = req.body;
        const otpkey = `otp:${email}`;

        // check fields
        if (!userName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        console.log("STEP 1: Signup started");

        console.log("email checking");

        // check existing user
        const existingUser = await User.findOne({ email }).maxTimeMS(5000);

        console.log("Email query result:", existingUser);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        console.log("STEP 2: Email checked");

        console.log("try to hasing");

        // password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("hashed password is ", hashedPassword);
        console.log("STEP 3: Password hashed");

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

         const otpData = {
            userName,
            email,
            password: hashedPassword,
            otp: otp.toString()
        };
     

await redisClient.setEx(
    otpkey,
    300,
    JSON.stringify(otpData)
);

console.log("STEP 4: OTP and signup data saved in Redis");

        await sendMail(
            email,
            "email verification for resume analyzer",
            `your otp is ${otp}`
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully. Please verify your email."
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};

// ================= LOGIN =================
//REFRESH TOKEN CREATED IN LOGIN SECTION 

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // create JWT
        const accesstoken = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );
           const refreshtoken = jwt.sign(
             { userId : user._id,
              role: user.role
             },
             process.env.REFRESH_TOKEN_SECRET,
             {
                expiresIn:"7d"
             }
           );

        // cookie
        //access
        res.cookie("token", accesstoken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });
        res.cookie("refresToken", refreshtoken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        res.status(200).json({
            message: "Login successful",
            accesstoken,
            refreshtoken
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};





   // ================= REFRESH TOKEN =================

const refresh = async (req, res) => {
    try {

        // 1. Cookie se refresh token nikalo
        const refreshToken = req.cookies.refreshToken;

        // 2. Refresh token nahi mila
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing"
            });
        }

        // 3. Refresh token verify karo
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // 4. Naya access token banao
        const newAccessToken = jwt.sign(
            {
                userId: decoded.userId,
                role: decoded.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 5. Naya access token cookie mein save karo
        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        // 6. Response
        res.json({
            message: "Access token refreshed"
        });

    } catch (error) {

        res.status(401).json({
            message: "Invalid or expired refresh token"
        });

    }
};


     // ================= LOGOUT =================

const logout = async (req, res) => {

    res.clearCookie("token");
     res.clearCookie("refresToken");

    res.json({
        message: "Logout successful"
        
    });

};


// ================= PROFILE =================

const profile = async (req, res) => {

    res.json({
        message: "This is your profile",
        user: req.user
    });

};


module.exports = {
    signup,
    login,
    logout,
    profile,
    refresh
};