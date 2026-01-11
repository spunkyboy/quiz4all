// utils/sendVerificationEmail.js
const sendEmailReq = require('./sendEmail');

const sendVerificationEmail = async (email, token) => {
  try{
    if (!process.env.CLIENT_URL){
          throw new Error ('CLIENTS_URL not defined');
    }
    const linkVerification = `${process.env.CLIENT_URL}/api/auth/verify/:${token}`;
     console.log('verifying', linkVerification);
     const subject = 'Verify Your Quiz App Email';
     const text = `Welcome to Quiz App! Verify your email: ${linkVerification}`;
     const html = `
       <h2>Welcome to Quiz App!</h2>
       <p>Click the link below to verify your email:</p>
       <a href="${linkVerification}">Verify Email</a>
       <p>This link will expire in 24 hours.</p>
     `;
   
     await sendEmailReq(email, subject, text, html);

  } catch(error) {
    console.error("Verification email error", error.message);
   throw error;
  }

};

module.exports = sendVerificationEmail;
// Export to auth.js