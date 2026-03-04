const Mailgun = require("mailgun.js");
const formData = require("form-data");

const sendEmailReq = async ({ to, subject, html }) => {

  // ✅ ADD CHECK HERE
  if (process.env.NODE_ENV === 'test' || !process.env.MAILGUN_API_KEY) {
    console.log('🧪 Skipping email (no API key or test mode)');
    return;
  }

  const mailgun = new Mailgun(formData);

  const mailQuiz = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    url: 'https://api.mailgun.net'
  });

  try {
    // console.log('API KEY:', process.env.MAILGUN_API_KEY);
    // console.log('DOMAIN:', process.env.MAILGUN_DOMAIN);

    await mailQuiz.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Quiz App <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      html,
    });

    // console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Mailgun error:", error);
  }
};

module.exports = sendEmailReq;