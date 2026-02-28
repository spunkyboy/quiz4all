const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const rateLimit = require('express-rate-limit'); 
const crypto = require('crypto');
const router = express.Router();
const inputValidator = require('validator');
const sendEmailReq = require('../utils/sendEmail');
const jwtSecret = process.env.JWT_SECRET;


// Sign in limiter
const siginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 3,
  skipSuccessfulRequests: true, 
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many failed login attempts. Please try again later.' });
  },
  keyGenerator: (req) => {
    const email = req.body?.email;
    if (typeof email === 'string' && email.includes('@')) {
      return email.trim().toLowerCase(); 
    }
    return rateLimit.ipKeyGenerator(req); 
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

  if (!emailRegexAdmin.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!strongPasswordRegexAdmin.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include uppercase letters, numbers, and symbols'
    });
  }

  try {
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const salt = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({ email: email.toLowerCase(), passwordHash, role: 'admin' });
    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      message: 'User created',
      token,
      email: newAdmin.email,
      role: newAdmin.role
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

//Admin Signin
router.post('/office/signin', async (req, res) => { 
  const { email, password } = req.body;

  try {
    const adminSign = await Admin.findOne({ email: email.toLowerCase()});
    if (!adminSign) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const passwordMatch = await bcrypt.compare(password, adminSign.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

if (!jwtSecret) {
  console.error('JWT_SECRET is missing');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }
    const token = jwt.sign(
              { userId: adminSign._id, 
                email: adminSign.email, 
                role: adminSign.role 
              }, 
              jwtSecret,
              { expiresIn: '8h' });

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

  // Required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Email format
  if (!inputValidator.isEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Strong password
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
    // Email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Generate UNIQUE username
    const baseUsername = normalizedEmail.split('@')[0];
    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: normalizedEmail,
      username,
      passwordHash
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'Signup successful'
    });

  } catch (err) {
    console.error('SIGNUP ERROR 👉', err);

    // Duplicate key fallback
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

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
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    // Always respond the same (security best practice)
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a reset link was sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Absolute URL (IMPORTANT)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email (Gmail / Nodemailer)
    try {
      await sendEmailReq({
        to: user.email,
        subject: "Password Reset",
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link expires in 30 minutes.</p>
        `
        
      });

    } catch (emailErr) {
      console.error("Email sending failed:", emailErr.message);
      console.log("User found for password reset:", user);
      console.log("User email:", user?.email);
    }

    return res.send("If the email exists, a reset link was sent");

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});



// Reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    //  Required fields
    if (!password || !confirmPassword || !token) {
      return res
        .status(400)
        .json({ message: "Password, confirm password, and token are required" });
    }

    const pwds = password.toString();
    const confirmPwds = confirmPassword.toString();

    // Password length
    if (!inputValidator.isLength(pwds, { min: 8 })) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // Password strength
    if (
      !inputValidator.matches(
        pwds,
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/
      )
    ) {
      return res.status(400).json({
        message:
          "Password must include at least one uppercase letter, one number, and one special character"
      });
    }

    //  Passwords match
    if (pwds.trim() !== confirmPwds.trim()) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    //  Hash token from request
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    //  Find valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token" });
    }

    //  Hash and save new password
    user.passwordHash = await bcrypt.hash(pwds, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


// router.post('/guest', async (req, res) => {
//   try {
//     // Generate a temporary guest username
//     const guestId = crypto.randomBytes(4).toString('hex'); // 8-char hex
//     const username = `Guest_${guestId}`;

//     // Create a guest user (no password, marked as guest)
//     const guestUser = new User({
//       username,
//       email: `${guestId}@guest.local`, // dummy email
//       passwordHash: crypto.randomBytes(16).toString('hex'), // random hash
//       role: 'guest',
//       isVerified: true
//     });

//     await guestUser.save();

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: guestUser._id, role: guestUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' } // guest token expires in 1 day
//     );

//     res.json({
//       success: true,
//       message: 'Guest login successful',
//       token,
//       user: {
//         id: guestUser._id,
//         username: guestUser.username,
//         role: guestUser.role
//       }
//     });
//   } catch (err) {
//     console.error('Guest login error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

module.exports = router;
