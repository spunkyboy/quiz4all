const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const rateLimit = require('express-rate-limit'); // Use for rate-limiting 
const crypto = require('crypto');
const router = express.Router();
const inputValidator = require('validator');
// const sendVerificationEmail = require('../utils/sendVerificationEmail');
const sendEmailReq = require('../utils/sendEmail');
const jwtSecret = process.env.JWT_SECRET;


// Sign in limiter
const siginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 3,
  skipSuccessfulRequests: true, // only count failed login attempts
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many failed login attempts. Please try again later.' });
  },
  keyGenerator: (req) => {
    //Prioritize email if present, else fallback safely to IP
    const email = req.body?.email;
    if (typeof email === 'string' && email.includes('@')) {
      return email.toLowerCase(); // per-user limiting
    }
    return rateLimit.ipKeyGenerator(req); // safe fallback
  }
});

// Only apply the rate limiter if you’re NOT running tests.
const signinMiddleWares = [];
if (process.env.NODE_ENV !== 'test') {
  signinMiddleWares.push(siginLimiter);
}

// Admin Signup
router.post('/office/signup', async (req, res) => {
  const emailRegexAdmin = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordRegexAdmin = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
// Email check 
  if (!email || !emailRegexAdmin.test(email)) {
      return res.status(400).json({
         message: 'Invalid email format'
      });
  }
// Password strength
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
router.post('/office/signin', async (req, res) => { 
  const { email, password } = req.body;

  try {
    // Email admin check
    const adminSign = await Admin.findOne({ email: email.toLowerCase()});
    if (!adminSign) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
   // Paswword match
    const passwordMatch = await bcrypt.compare(password, adminSign.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

if (!jwtSecret) {
  console.error('❌ JWT_SECRET is missing');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }
    const token = jwt.sign(
              { userId: adminSign._id, 
                email: adminSign.email, 
                role: adminSign.role 
              }, 
              jwtSecret,
              { expiresIn: '8h' });
        // Send token as an HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
          maxAge: 8 * 60 * 60 * 1000, 
          path: '/'
        });
      res.json({ token, email: adminSign.email, role:adminSign.role});
  } catch (err) {
    console.error('Server error:', err);
   return res.status(500).json({ message: 'Server error' });
  }
});

//admin logout
router.post('/office/logout', (req, res) => {
  console.log('🚪 Logout Admin called');

  res.clearCookie('token', {
    httpOnly: true,
    secure: true,     // Must match the cookie options set during signin
    sameSite: 'None',
    path: '/', 
  });

  res.status(200).json({ message: 'Logged out' });
});

// Users Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase();

  //  Required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  //  Email format
  if (!inputValidator.isEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  //  Strong password
  if (!inputValidator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })) {
    return res.status(400).json({
      success: false,
      message: 'Password must include uppercase, lowercase, number, and symbol'
    });
  }

  try {
    //  Check existing user
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    //  Create user
    const token = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: normalizedEmail,
      passwordHash,
      username: normalizedEmail.split('@')[0],
      verificationToken: token,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
      isVerified: false
    });

    await newUser.save();

    //  Send verification email (enable later)
    await sendVerificationEmail(newUser.email, token);

    // Sign up sucessful
    return res.status(201).json({
      success: true,
      message: 'Signup successful. Please verify your email.',
      user: {
        email: newUser.email,
        isVerified: newUser.isVerified
      }
    });

  } catch (err) {
    console.error('SIGNUP ERROR 👉', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// User Signin
router.post('/signin', ...signinMiddleWares, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!inputValidator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
     
    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in'
      });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is missing');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 60 * 60 * 1000,
      path: '/'
    });

    return res.status(200).json({ token, email: user.email, role: user.role });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Users logout out (clear the cookies)
router.post('/logout', (req, res) => {
  console.log('🚪 Logout Users called');

  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send("Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Always send the same response for security
      return res.send("If the email exists, a reset link was sent");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min

    await user.save();

    const resetUrl = `/reset-password?token=${resetToken}`;

    // Send email safely
    try {
      sendEmailReq(
        user.email,
        "Password Reset",
        `Click to reset password: ${resetUrl}`
      );
    } catch (err) {
      console.error("Email sending failed:", err);
      // Optionally, you can still respond to avoid leaking info
    }

    res.send("Reset link sent to email");
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).send("Something went wrong");
  }
});


// Reset password
router.post("/reset-password", async (req, res) => {
  const { password, confirmPassword, token } = req.body;
  // Convert values strings
  const pwds = password?.toString();
  const confirmPwds = confirmPassword?.toString();
  // Required fields
  if (!password || !confirmPassword || !token) {
    return res.status(400).send("Password, confirm password, and token are required");
  }

  // Password length
  if (!inputValidator.isLength(password, { min: 8 })) {
    return res.status(400).send("Password must be at least 8 characters long");
  }

  // Optional: password strength
  if (
    !inputValidator.matches(password, /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
  ) {
    return res.status(400).send(
      "Password must include at least one uppercase letter, one number, and one special character"
    );
  }

if (!pwds || !confirmPwds || !token) {
  return res.status(400).send("Password, confirm password, and token are required");
}
  // Passwords match
if (pwds.trim() !== confirmPwds.trim()) {
  return res.status(400).send("Passwords do not match");
}
  // Verify token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).send("Invalid or expired token");
  }

  // Hash and save new password
  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.send("Password reset successful");
});

// Sign up email verification
router.get('/verify/:token', async (req, res) => {
  // console.log('Verify route hit:', req.params.token);
  const { token } = req.params;
  console.log('Verify route hit with token:', token);

try {
  const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() } // check if token expired
  });

  if (!user) return res.status(400).send('Invalid or expired verification link');

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;

  await user.save();

} catch(err) {
  console.error('VERIFY ERROR', err);
  res.send('Email verified! You can now log in.');
}
});


module.exports = router;
