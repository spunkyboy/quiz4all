const express = require('express');
const router = express.Router();
const Result = require('../models/Result');


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


module.exports = router;
