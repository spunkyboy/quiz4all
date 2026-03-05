// question.test.js
const request = require('supertest');
const app = require('./app');
const Question = require('./models/Question'); 
let adminToken;

beforeAll(async () => {
  const email = `admin${Date.now()}@example.com`;
  const password = 'AdminPass123!';

  // Signup admin
  await request(app).post('/api/auth/office/signup').send({
    email,
    password,
    role: 'admin'
  });

  // Signin admin to get token
  const responSignin = await request(app).post('/api/auth/office/signin').send({ email, password });
  // console.log('SIGNIN RESPONSE:', res.body); //
  adminToken =  responSignin.body.token;

  await Question.create({
    question: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Rome'],
    answer: 'Paris'
  });
  // console.log('ADMIN TOKEN:', adminToken); 
});

beforeEach(async () => {
  await Question.deleteMany({});
});

describe('Question API', () => {
  it('should create a new question', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        question: 'What is the capital of Spain?',
        options: ['Madrid', 'Barcelona', 'Valencia'],
        answer: 'Madrid'
      });

    expect(res.status).toBe(201);
    expect(res.body.question.question).toBe('What is the capital of Spain?');
    expect(res.body.question.options.length).toBe(3);
  });

  it('should fail if answer is not in options', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        question: 'What is 2 + 2?',
        options: ['3', '5'],
        answer: '4'
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Answer must be one of the options/);
  });

  it('should return 400 if question is missing', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        options: ['Paris', 'Berlin', 'Madrid'],
        answer: 'Paris'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please provide question, options, and answer.');
  });

  it('should fetch all questions', async () => {
    // First create a question
    await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        question: 'What is the capital of France?',
        options: ['Paris', 'Berlin', 'Madrid'],
        answer: 'Paris'
      });

      const res = await request(app)
      .get('/api/questions') 
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].question).toBe('What is the capital of France?');
  });
});