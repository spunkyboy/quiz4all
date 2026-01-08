const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true }, 
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },

  // Email verification fields
  isVerified: { type: Boolean, default: false }, // Has the user verified their email?
  verificationToken: String,                     // Random token for verification link
  verificationTokenExpires: Date,                // Expiry time for token

  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

module.exports = mongoose.model('User', UserSchema);
