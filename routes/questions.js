const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

//Create an API route to add quiz questions
router.post('/', async (req, res) => {
    try {
      const { question, options, answer } = req.body;
  
      // Basic validation
      if (!question || !options || !answer) {
        return res.status(400).json({ message: 'Please provide question, options, and answer.' });
      }
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'Options must be an array with at least 2 items.' });
      }
      if (!options.includes(answer)) {
        return res.status(400).json({ message: 'Answer must be one of the options.' });
      }
  
      const newQuestion = new Question({ question, options, answer });
      await newQuestion.save();
  
      res.status(201).json({ message: 'Question added successfully', question: newQuestion });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // DELETE a question by ID
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deleted = await Question.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Error deleting question:', error.message);
      res.status(500).json({ message: 'Server error while deleting question' });
    }
  });
  
  // GET all quiz questions
  router.get('/', async (req, res) => {
    try {
      const questions = await Question.find();
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error.message);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  });


  module.exports = router;