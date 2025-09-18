const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app'); // Adjust path to your Express app
const Admin = require('./models/Admin'); // Adjust path to your Admin model
const bcrypt = require('bcrypt');

beforeAll(async () => {

});

afterAll(async () => {

});

beforeEach(async () => {

});

describe('Admin Signup and Signin', () => {
  test('Admin signup succeeds with valid email and password', async () => {
    const res = await request(app)
      .post('/api/auth/admin/signup')
      .send({
        email: 'testadmin@example.com',
        password: 'StrongPass1!',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User created');

    const admin = await Admin.findOne({ email: 'testadmin@example.com' });
    expect(admin).not.toBeNull();
    expect(await bcrypt.compare('StrongPass1!', admin.passwordHash)).toBe(true);
  });

  test('Admin signup fails with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/admin/signup')
      .send({
        email: 'testadmin2@example.com',
        password: 'weakpass',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Password must be at least 8 characters/i);
  });

  test('Admin signin succeeds with correct credentials', async () => {
    // First create an admin manually
    const passwordHash = await bcrypt.hash('StrongPass1!', 10);
    const admin = new Admin({ email: 'signinadmin@example.com', passwordHash });
    await admin.save();

    const res = await request(app)
      .post('/api/auth/admin/signin')
      .send({
        email: 'signinadmin@example.com',
        password: 'StrongPass1!',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe('signinadmin@example.com');
  });

  test('Admin signin fails with wrong password', async () => {
    const passwordHash = await bcrypt.hash('StrongPass1!', 10);
    const admin = new Admin({ email: 'wrongpassadmin@example.com', passwordHash });
    await admin.save();

    const res = await request(app)
      .post('/api/auth/admin/signin')
      .send({
        email: 'wrongpassadmin@example.com',
        password: 'WrongPass!',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid username or password');
  });
});
