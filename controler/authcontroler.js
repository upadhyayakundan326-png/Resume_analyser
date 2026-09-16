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
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // cookie
        res.cookie("token", token, {
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
    profile
};