const express = require("express");

const router = express.Router();


const {
    signup,
    login,
    logout,
    refresh
} = require("../controler/authcontroler");
const verify = require("../controler/verify")
  




router.post("/signup", signup);

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/verify",verify)

module.exports = router;