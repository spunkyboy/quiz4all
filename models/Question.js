const mongoose = require('mongoose');
const QSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String 
});
module.exports = mongoose.model('Question', QSchema);
