const nodemailer = require('nodemailer');

async function sendEmailReq({ to, subject, html }) {
  try {
    console.log("📧 sendEmailReq function triggered");
    console.log("Attempting to send email to:", to);

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

    console.log("✅ Email sent:", info.response);

  } catch (err) {
    console.error("❌ Email error FULL:", err);
  }
}

module.exports = sendEmailReq;