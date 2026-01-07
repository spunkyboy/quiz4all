const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true }, 
  email: { type: String, required: true, unique: true, lowercase: true, },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

module.exports = mongoose.model('User', UserSchema);
