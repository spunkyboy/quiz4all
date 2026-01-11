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
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: process.env.SENDGRID_USER, // usually "apikey"
      pass: process.env.SENDGRID_PASS, // your SendGrid API key
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
