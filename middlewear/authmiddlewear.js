//is the user is login or not 

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {

        // Cookie se token nikalo
        const token = req.cookies.token;

        // Token nahi hai
        if (!token) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        // Token verify karo
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // User ki information request mein store
        req.user = decoded;

        // Next controller par jao
        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }
};

module.exports = authMiddleware;