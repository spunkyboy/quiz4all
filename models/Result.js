const mongoose = require('mongoose');

const RSchema = new mongoose.Schema({
  username: { type: String, required: true },   // <-- added
  score: { type: Number, required: true },
  total: { type: Number, required: true },      // <-- added
  timeSpent: { type: String },     
  isPassed: { type: Boolean},             // <-- added
  date: { type: Date, default: Date.now }
 
});

module.exports = mongoose.model('Result', RSchema);
