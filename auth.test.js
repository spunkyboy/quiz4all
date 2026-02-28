const request = require('supertest');
const app = require('./app');


describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'user@example.com',
      password: 'Password123!'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Signup successful');
    // optionally check success flag
    expect(res.body.success).toBe(true);
  });

  it('should not register user with existing email', async () => {
    const email = 'duplicate@example.com';
  
    // First signup
    const firstRes = await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'Password123!' });
  
    expect(firstRes.statusCode).toBe(201); // first signup succeeds
  
    // Second signup with same email
    const secondRes = await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'Password123!' });
  
    expect(secondRes.statusCode).toBe(400); // should fail
    expect(secondRes.body.message).toBe('Email already exists'); // exact match
  });

  it('should login a registered user', async () => {
    await request(app).post('/api/auth/signup').send({
      email: 'loginuser@example.com',
      password: 'Password123!'
    });

    const res = await request(app).post('/api/auth/signin').send({
      email: 'loginuser@example.com',
      password: 'Password123!'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe('loginuser@example.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/signup').send({
      email: 'wrongpass@example.com',
      password: 'Password123!'
    });

    const res = await request(app).post('/api/auth/signin').send({
      email: 'wrongpass@example.com',
      password: 'WrongPass1!'
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should reject weak password during signup', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'weakpass@example.com',
      password: 'pass'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/must include uppercase/i);
  });
});