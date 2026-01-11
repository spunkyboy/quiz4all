require('dotenv').config({ path: '../.env' }); // Load env
const mongoose = require('mongoose');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const User = require('../models/User');

async function sendOldVerificationTo() {
  const users = await User.find({ isVerified: false });

  for (const user of users) {
    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();
    await sendVerificationEmail(user.email, token);
    console.log("Verification email sent to:", user.email);
  }
}

// Connect to MongoDB and run
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await sendOldVerificationTo();
    console.log("All old users processed");
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

  /* This send all old email for verification*/ 