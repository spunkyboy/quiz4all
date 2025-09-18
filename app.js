// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
const app = express();

// 🔥 Log the incoming Origin **before** CORS is applied
app.use((req, res, next) => {
  console.log('🔥 Incoming Origin:', req.headers.origin);
  next();
});
const allowedOrigins = [
                         // ✅ REQUIRED
                        'http://localhost:5502',
                        'http://127.0.0.1:5502'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow REST tools or same-origin requests without origin
  
    if (allowedOrigins.includes(origin)) {
      callback(null, origin); // send back the incoming origin exactly
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(cookieParser()); // ✅ enable parsing cookies
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);



module.exports = app;
