const express = require('express');
const Question = require('../models/Question');
const Result = require('../models/Result');
const router = express.Router();
const jwt = require('jsonwebtoken');


// JWT Middleware for users
const auth = (req, res, next) => {
  const token = req.cookies?.token; // Assuming cookie is named 'token'
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token not found' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload to request object
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

// Get random questions
router.get('/', auth, async (req, res) => {
  try {
    const questions = await Question.find().limit(10); // Example questions set limit
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Submit answers
router.post('/submit', auth, async (req, res) => {
  const { answers, timeTaken } = req.body;
  let score = 0;
  const questions = await Question.find({ _id: { $in: answers.map(a => a.id) } });
  answers.forEach(a => {
    const q = questions.find(q => q._id.equals(a.id));
    if (q && q.answer === a.answer) score++;
  });
  await new Result({ userId: req.user.userId, score, timeTaken }).save();
  res.json({ score });
});

module.exports = router;
