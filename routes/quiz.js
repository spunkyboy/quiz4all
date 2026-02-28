const express = require('express');
const Question = require('../models/Question');
const Result = require('../models/Result')
const User = require('../models/User');
const crypto = require("crypto");
const authenToken = require('../middleware/authenToken');
const router = express.Router();

// Get random questions with nonce
router.get('/', authenToken, async (req, res) => {
  try {
    const questions = await Question
      .find()
      .select('-answer')
      .limit(10); 
    const quizNonce = res.locals.nonce; 

    const questionsEachNonce = questions.map(que => ({
      ...que.toObject(),
      nonce: crypto.createHash('sha256')
                    .update(quizNonce + que._id.toString())
                    .digest('base64')
    }));
    res.json(questionsEachNonce);
  } catch {
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

router.post('/submit', authenToken, async (req, res) => {
  const { answers, timeTaken, username } = req.body;

  if (!req.user?.userId) {
    return res.status(400).json({ message: 'UserId missing' });
  }

  try {
    // Calculate score
    const questionIds = answers.map(a => a.id);
    const questions = await Question.find({ _id: { $in: questionIds } });
    let score = 0;

    answers.forEach(a => {
      const q = questions.find(q => q._id.toString() === a.id);
      if (q && q.answer === a.answer) score++;
    });

    const totalQuestions = answers.length;
    const isPassed = score >= 6;

    const newResult = new Result({
      userId: req.user.userId,           
      username: username || 'Anonymous',
      score,
      total: totalQuestions,
      timeSpent: timeTaken,
      isPassed
    });

    await newResult.save();

    res.json({
      score,
      total: totalQuestions,
      isPassed,
      username: newResult.username
    });

  } catch (err) {
    console.error('Error in /submit:', err);
    res.status(500).json({ message: 'Error submitting quiz', error: err.message });
  }
});

router.get('/users', authenToken, async (req, res) => {
  try {
    
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
      if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: role not allowed' });
      }

    res.json({
       email: user.email,
       role: req.user.role
      });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/results', authenToken, async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username required' });
  }

  if (!req.user?.userId) {
    return res.status(400).json({ message: 'UserId missing' });
  }

  try {
    const updatedResult = await Result.findOneAndUpdate(
      { userId: req.user.userId }, 
      { username },                
      { sort: { date: -1 }, new: true } 
    );

    if (!updatedResult) {
      return res.status(404).json({ message: 'No quiz result found to update' });
    }

    res.json({ success: true, result: updatedResult });
  } catch (err) {
    console.error('Error saving username:', err);
    res.status(500).json({ message: 'Error saving username', error: err.message });
  }
});

module.exports =  router;
