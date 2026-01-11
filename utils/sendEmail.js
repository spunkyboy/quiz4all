// utils/sendEmail.js
const nodemailer = require('nodemailer');

/**
 * Send email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} text - plain text content
 * @param {string} [html] - optional HTML content
 */
const sendEmailReq = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Quiz App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html, // optional, if provided will render as HTML
  });
};

module.exports = sendEmailReq;
// Export to auth.js and sendVerificationEmail.js
