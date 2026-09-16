const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ================= SIGNUP =================

const signup = async (req, res) => {
    try {

        const { userName, email, password } = req.body;

        // check fields
        if (!userName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // password hash
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("hashed password is ",hashedPassword)

        // create user
        const user = await User.create({
            userName,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Signup successful",
            userId: user._id
        });

    } catch (error) {

        res.status(500).json({
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
            message: "Login successful"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
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
    profile
};