
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const authenToken = require('../middleware/authenToken')
const isAdminProtected = require('../middleware/usersAdmin');

// CREATE a new question (admin only)
router.post('/', authenToken, isAdminProtected, async (req, res) => {
  try {
      // Only allow admins
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
      }
    let { question, options, answer } = req.body;

    if (!question || !options || !answer) {
      return res.status(400).json({
        message: 'Please provide question, options, and answer.'
      });
    }

    const quizCount = await Question.countDocuments();
    if (quizCount >= 10) {
      return res.status(400).json({
        message: 'Quiz limit reached (10). Delete a quiz to add a new one.'
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: 'Options must be an array with at least 2 items.'
      });
    }

    options = options.map(opt => opt.trim());
    const capitalizedOptions = options.map(opt => opt.charAt(0).toUpperCase() + opt.slice(1));
    answer = answer.trim();

    const index = options.findIndex(opt => opt.toLowerCase() === answer.toLowerCase());
    if (index === -1) {
      return res.status(400).json({ message: 'Answer must be one of the options.' });
    }

    const newQuestion = new Question({
      question: question.trim(),
      options: capitalizedOptions,
      answer: capitalizedOptions[index]
    });

    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    console.error('Error adding question:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a question by ID (admin only)
router.delete('/:id', authenToken, isAdminProtected, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Question not found' });

    const remaining = await Question.countDocuments();
    res.json({ message: 'Question deleted', remainingQuizzes: remaining, limit: 10 });
  } catch (error) {
    console.error('Error deleting question:', error.message);
    res.status(500).json({ message: 'Server error while deleting question' });
  }
});

// GET all questions (admin only)
router.get('/', authenToken, isAdminProtected, async (req, res) => {
  // console.log('ADMIN ACCESS GRANTED:', req.user);

  try {
    const questions = await Question.find(); // includes answers
    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// GET questions count (admin only)
router.get('/count', authenToken, isAdminProtected, async (req, res) => {
  try {
    const countUpDown = await Question.countDocuments();
    res.status(200).json({
      success: true,
      countUpDown,
      limit: 10
    });
  } catch (error) {
    console.error('Error fetching count:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


module.exports = router;
