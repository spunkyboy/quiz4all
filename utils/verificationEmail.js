// utils/sendVerificationEmail.js
const sendEmailReq = require('./sendEmail');

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `/verify/${token}`;

  const subject = 'Verify Your Quiz App Email';
  const text = `Welcome to Quiz App! Verify your email: ${verificationLink}`;
  const html = `
    <h2>Welcome to Quiz App!</h2>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
  `;

  await sendEmailReq(email, subject, text, html);
};

module.exports = sendVerificationEmail;
