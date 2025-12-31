const mongoose = require('mongoose');

const RSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true,
    default: 'Anonymous'
  },
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: String,
    required: true
  },
  isPassed: {
    type: Boolean,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', RSchema);
