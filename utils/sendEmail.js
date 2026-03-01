// utils/sendEmail.js
const nodemailer = require('nodemailer');

async function sendEmailReq({ to, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html
    });

    console.log("EMAIL SENT:", info.response);

  } catch (error) {
    console.error("EMAIL ERROR:", error);
  }
}

module.exports = sendEmailReq;