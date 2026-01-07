require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const bcrypt = require('bcrypt'); // Import bcrypt here
const app = require('./app'); 
const User = require('./models/User'); 

jest.mock('bcrypt');

bcrypt.compare.mockResolvedValue(false);
//get it datababse and process.env.TEST_DB_URI from jest.setup.js
beforeAll(async () => {
});

afterAll(async () => {
});

describe('Auth API', () => {
  let testUser = {
    username: 'frank',
    email: 'frankoseikwabena@hotmail.com',
    password: 'Sammy@5322'
  };

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);
  
      expect(res.statusCode).toBe(201); // Success
      expect(res.body.message).toBe('User created');
    });
  
    it('should not register user with existing email', async () => {
       // First signup attempt
      await request(app).post('/api/auth/signup').send(testUser);
      //second attempt
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser); // same username again
  
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i); //Correct expectation
    });
  
    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'someone@hotmail.com' }); // Missing password
  
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Email and password are required/i);
    });
  });
  
//sign in test
  describe('POST /api/auth/signin', () => {
    it('should sign in with correct credentials', async () => {
      // 👇 Create the user before trying to sign in
      await request(app).post('/api/auth/signup').send(testUser);
  
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password
        });
        console.log('SIGNIN RESPONSE:', res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  
 it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'StrongP@ssw0rd',
        });
    
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid email format');
    });

    
 it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: '12345', // too weak
        });
    
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Password must be at least 8 characters/i);
    });

 it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: 'sammy@5322'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

 it('should return 401 if password does not match', async () => {

   // Mock user found
   jest.spyOn(User, 'findOne').mockResolvedValue({
    email: 'test@example.com',
    passwordHash: 'fakehash'
  });

    bcrypt.compare.mockResolvedValue(false); // simulate password mismatch
  
      const response = await request(app)
        .post('/api/auth/signin')
        .send({ email: 'test@example.com', password: 'wrongpassword' });
  
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Invalid credential' });
    });


    it('should fail for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'notfound@example.com',
          password: 'any'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Invalid credential/i);
    });
  });
});
