// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const crypto = require("crypto");
const fs = require('fs');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
// const { addCsrfToken } = require('./middleware/csrf');

const app = express();

app.use(cookieParser()); // enable parsing cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
    // console.log('🔥 Nonce:', res.locals.nonce);
  next();
});

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://quiz4all-ygm1.onrender.com'] 
  : ['http://localhost:5001', 'https://quiz4all-ygm1.onrender.com']; 

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// CSP
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'strict-dynamic'",
        (req, res) => `'nonce-${res.locals.nonce}'`,
        "https://kit.fontawesome.com",
        "https://unpkg.com" ,
        "https://cdn.jsdelivr.net"

      ],
      connectSrc: [
        "'self'",
        "https://unpkg.com",
        "https://ka-f.fontawesome.com",
        "https://quiz4all-ygm1.onrender.com" 

      ],
      requireTrustedTypesFor: ["'script'"],

      styleSrc: [
        "'self'",
        // (req, res) => `'nonce-${res.locals.nonce}'`,
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://kit.fontawesome.com",
        "https://ka-f.fontawesome.com",
        "https://cdn.jsdelivr.net"

      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://ka-f.fontawesome.com"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  })
);

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
  etag: process.env.NODE_ENV === 'production',
  lastModified: process.env.NODE_ENV === 'production',
  setHeaders: (res) => {
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));


// Serve index.html 
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'views','index.html');
  htmlIndexAdminAdminsigninup(res, filePath);
});
// Route for admin sign-in/signup page
app.get('/office/signin', (req, res) => {
  const filePath = path.join(__dirname, 'views/admin.html');
  htmlIndexAdminAdminsigninup(res, filePath);
});

// Route for admin dashboard after login
app.get('/adminAccount', (req, res) => {
  const filePath = path.join(__dirname, 'views/adminAccount.html');
  htmlIndexAdminAdminsigninup(res, filePath);
});
//route for forgot password to reset
app.get('/forgot-password', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'forgot-password.html');
  htmlIndexAdminAdminsigninup(res, filePath);
});
app.get('/reset-password/:token', (req, res) => {
  // res.sendFile(path.join(__dirname, 'views', 'reset-password.html'));
  const filePath = path.join(__dirname, 'views', 'reset-password.html');
  htmlIndexAdminAdminsigninup(res, filePath);
});

// Helper function
function htmlIndexAdminAdminsigninup(res, filePath) {
  const nonce = res.locals?.nonce;
  // console.log(nonce, 'checking for nonce');

  if (!nonce) {
    console.error('[helper] No nonce found in res.locals!');
  }

  fs.readFile(filePath, 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send('Error loading HTML');
    }

    const modifiedHtml = html.replace(
      /<script\b(?![^>]*\bnonce=)([^>]*)>/gi,
      `<script nonce="${nonce}"$1>`
    );
    // console.log(modifiedHtml);
    res.send(modifiedHtml);
  });
}

// app.use(addCsrfToken);

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);

module.exports = app;
