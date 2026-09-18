
const transporter = require("../utilits/transporter")

const sendMail = async (to, sub, text) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: to,
    subject: sub,
    text: text
  });
};
module.exports = sendMail