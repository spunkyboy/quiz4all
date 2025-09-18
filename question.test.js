require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require('./app'); // Your Express app
const mongoose = require('mongoose');
const Question = require('./models/Question');

//it get it datababse and process.env.TEST_DB_URI from jest.setup.js
beforeAll(async () => {
});

afterAll(async () => {
});

describe('POST /api/questions', () => {
  it('should create a new question', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'What is the capital of France?',
        options: ['Paris', 'Berlin', 'Madrid'],
        answer: 'Paris'
      });

    expect(response.status).toBe(201);
    expect(response.body.question.question).toBe('What is the capital of France?');
    expect(response.body.question.options.length).toBe(3);
  });

  it('should fail if answer is not in options', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        question: 'What is 2 + 2?',
        options: ['3', '5'],
        answer: '4'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Answer must be one of the options/);
  });
});

describe('POST /api/question', () =>{
    it('should return 400 if question is missing', async () => {
     const response = await request(app)
     .post('/api/questions')
     .send({
        options: ['Paris', 'Berlin', 'Madrid'],
        answer: 'Paris'
     });
     expect(response.statusCode).toBe(400);
     expect(response.body.message).toBe('Please provide question, options, and answer.');

    });
});

//Get endpoint returns a list of questions
describe('POST /api/question', () =>{
    it('should fetch all questions', async () => {
     const response = await request(app)
     .get('/api/questions')
    
     expect(response.statusCode).toBe(200);
     expect(Array.isArray(response.body)).toBe(true);

    });
});
