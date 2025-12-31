// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmailReq = async (to, subject, text) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Gmail address
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  // Send email
  await transporter.sendMail({
    from: `"Quiz App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendEmailReq;


