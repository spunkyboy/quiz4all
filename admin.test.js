require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const Admin = require('./models/Admin');

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_DB_URI);
  await Admin.deleteMany({});

  // Create initial admin
   await request(app).post('/api/auth/office/signup').send({
    email: 'admin@example.com',
    password: 'Password123!',
     role: 'admin'
  });

  // Signin to get token
  await request(app).post('/api/auth/office/signin').send({
    email: 'admin@example.com',
    password: 'Password123!'
  });
  // console.log('Signin response:', signinResp.statusCode, signinResp.body);

});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase(); 
    await mongoose.connection.close();
  }
});

describe('Admin Signup and Signin', () => {
  it('should signup a new admin', async () => {
    const res = await request(app)
      .post('/api/auth/office/signup')
      .send({
        email: 'newadmin@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User created');
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe('newadmin@example.com');
  });

  it('should fail signup with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/office/signup')
      .send({
        email: 'weakadmin@example.com',
        password: 'pass',
         role: 'admin'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Password must be/);
  });

  it('should fail signin with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/office/signin')
      .send({
        email: 'admin@example.com',
        password: 'WrongPass1!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid username or password');
  });

});