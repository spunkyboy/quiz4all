const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const optionalAuth = require('../middleware/guestAuth');
const authenToken = require('../middleware/authenToken');
const Question = require('../models/Question');
const User = require('../models/User');


function validationsResutl({username, score, total}){
 if(!username || score == null || total == null){
   return 'Missing required fields: username, score, or total';
 }
  return null;
}

router.post('/', async (req, res) => {
  
  const { username, score, total, timeSpent, isPassed } = req.body;

  const validateError = validationsResutl({
    username, 
    score, 
    total, 
    isPassed
  });
    if(validateError){
      return res.status(400).json({ 
        message: validateError 
      })
    }

  try {
    const isPassed = ( score /  total) >= 0.6;
    const newResult = new Result({ username, score, total, timeSpent, isPassed });
    await newResult.save();
    res.status(201).json({ message: 'Result saved' });
  } catch {
    console.error('Error saving results');
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Admin fetch all results
router.get('/', async (req, res) => {
  try {
    const results = await Result.find().sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch {
    console.error('[GET /api/results] Error:');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
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


router.get('/guest', optionalAuth, async (req, res) => {
  try {
    const questions = await Question.find({}, '-correctAnswer'); // hide answers
    res.json({ success: true, data: questions, user: req.user });
  } catch (err) {
    console.error('Failed to fetch quizzes:', err);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});


module.exports = router;
