const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const rateLimit = require('express-rate-limit'); // Use for rate-limiting (optional but recommended)
const crypto = require('crypto');
const router = express.Router();


const jwtSecret= process.env.JWT_SECRET;

//sign in limiter
const siginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 3,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many failed login attempts. Please try again later.' });
  },
  keyGenerator: (req) => {
    // ✅ Prioritize email if present, else fallback safely to IP
    if (req.body?.email) {
      return req.body.email.toLowerCase(); // per-user limiting
    }
    return rateLimit.ipKeyGenerator(req); // safe fallback
  }
});

//Only apply the rate limiter if you’re NOT running tests.
const signinMiddleWares = [];
if (process.env.NODE_ENV !== 'test') {
  signinMiddleWares.push(siginLimiter);
}

//Admin Signup
router.post('/admin/signup', async (req, res) => {
  const emailRegexAdmin = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordRegexAdmin = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
//email check 
  if (!email || !emailRegexAdmin.test(email)) {
      return res.status(400).json({
         message: 'Invalid email format'
      });
  }
// password strength
  if (!password || !strongPasswordRegexAdmin.test(password)) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters and include uppercase letters, numbers, and symbols'
        });
  }
   try {
    // Check if user exists
    const existingAdmin =  await Admin.findOne({ email: email.toLowerCase()});
    if (existingAdmin) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save user
    const newAdmin = new Admin({ email, passwordHash });
    await newAdmin.save();

    return res.status(201).json({ message: 'User created' });
   
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

//Admin Signin
router.post('/admin/signin', async (req, res) => { 
  const { email, password } = req.body;

  try {
    //email admin check
    const adminSign = await Admin.findOne({ email: email.toLowerCase()});
    if (!adminSign) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
   // paswword match
    const passwordMatch = await bcrypt.compare(password, adminSign.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: adminSign._id, email: adminSign.email }, jwtSecret, { expiresIn: '1h' });
        // ✅ Send token as an HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: false, // Use HTTPS in production!
          sameSite: 'Lax', // or 'Lax' if your frontend is on a different origin
          maxAge: 60 * 60 * 1000, // 1 hour
          path: '/'
        });
      res.json({ token, email: adminSign.email });
  } catch (err) {
    console.error('Server error:', err);
   return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin Check Auth Route
router.get('/admin/check-auth', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ authenticated: false, message: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.status(200).json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
      },
    });
  } catch (err) {
    console.error('Invalid token:', err);
    res.status(401).json({ authenticated: false, message: 'Invalid or expired token' });
  }
});

//admin logout
router.post('/admin/logout', (req, res) => {
  console.log('🚪 Logout route called');
  console.log('Incoming cookies:', req.cookies); // Debug

  res.clearCookie('token', {
    httpOnly: true,
    secure: false,     // Must match the cookie options set during signin
    sameSite: 'Lax',
    path: '/', 
    domain: 'localhost'       // Must match as well
  });

  res.status(200).json({ message: 'Logged out' });
});




// Users Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const emailRegexValidate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordRegexValidate = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
//email and password check required
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

//email check validation
  if (!email || !emailRegexValidate.test(email)) {
      return res.status(400).json({
         message: 'Invalid email format'
      });
  }
// password strength
  if (!password || !strongPasswordRegexValidate.test(password)) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters and include uppercase letters, numbers, and symbols'
        });
  }
  try {

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() }
      ]
    });
//checks if users already exist
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
//protected password even database is compromised
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email: email.toLowerCase(),
      passwordHash,
    });

    await newUser.save();

   return res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// User Signin
router.post('/signin', ...signinMiddleWares, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
       return res.status(401).json({ message: 'Invalid credential'});
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email }, jwtSecret, { expiresIn: '1h' });

    // ✅ Send token as an HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: false, // Use HTTPS in production!
          sameSite: 'Lax', // or 'Lax' if your frontend is on a different origin
          maxAge: 60 * 60 * 1000, // 1 hour
          path: '/'
        });
    
   return res.status(200).json({ 
      token,
      email: user.email
    });

  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Optional: Logout (clears the cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.sendStatus(200);
});

module.exports = router;
