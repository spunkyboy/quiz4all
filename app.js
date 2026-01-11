// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const crypto = require("crypto");
const fs = require('fs');

// Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
const app = express();

app.use(cookieParser()); // enable parsing cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
    // console.log('🔥 Nonce:', res.locals.nonce);
  next();
});

//Applied Helmet with CSP
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'strict-dynamic'",
        (req, res) => `'nonce-${res.locals.nonce}'`,
        // Optional fallback for old browsers:
        "'unsafe-inline'",
        "https://kit.fontawesome.com",
        "https://unpkg.com" ,
        "https://cdn.jsdelivr.net"

      ],
      connectSrc: [
        "'self'",
        "https://unpkg.com",
        "https://ka-f.fontawesome.com"
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

// //  STATIC ASSETS (CSS, JS) 
// const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Serve static assets (CSS, JS)
// app.use(express.static(path.join(__dirname, 'public'), {
//   // Production: long cache, dev: no cache
//   maxAge: process.env.NODE_ENV === 'production' ? thirtyDays : 0,
//   etag: true,
//   lastModified: true,
//   setHeaders: (res, filePath) => {
//     // Force CSS & JS files to always bypass cache if query string changes
//     if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
//       res.setHeader('Cache-Control', 'public, max-age=0');
//     }
//   }
// }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,           // disable browser caching
  etag: false,         // disable etag
  lastModified: false, // disable lastModified
  setHeaders: (res) => {
    // Optional: make absolutely sure browser does not cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
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
app.get('/reset-password', (req, res) => {
  // res.sendFile(path.join(__dirname, 'views', 'reset-password.html'));
  const filePath = path.join(__dirname, 'views', 'reset-password.html');
  htmlIndexAdminAdminsigninup(res, filePath);
});


// Helper function
function htmlIndexAdminAdminsigninup(res, filePath) {
  const nonce = res.locals?.nonce;

  if (!nonce) {
    console.error("[helper] No nonce found in res.locals!");
  }

  // console.log("[helper] Serving HTML file:", filePath);
  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) {
      res.status(500).send("Error loading HTML");
      return;
    }

    const modifiedHtml = html
      // add nonce to ALL script tags (inline + src)
      .replace(/<script\b([^>]*)>/gi, `<script nonce="${nonce}"$1>`)
      // add nonce to all style tags
      // .replace(/<style\b([^>]*)>/gi, `<style nonce="${nonce}"$1>`);

    res.send(modifiedHtml);
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);

module.exports = app;
