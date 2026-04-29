const express = require('express');
const Question = require('../models/Question');
const Result = require('../models/Result')
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


router.post('/submit', async (req, res) => {
  const { answers, timeTaken, username } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: 'Answers are required' });
  }

  try {
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
      userId: req.user?.userId || null, 
      username: username || 'Guest',    
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





module.exports =  router;
