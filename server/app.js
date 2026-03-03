const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Route imports
const authRoutes = require('./routes/authRoutes');
const surveyQuestionRoutes = require('./routes/surveyQuestionRoutes');
const riskRoutes = require('./routes/riskRoutes');
const messageRoutes = require('./routes/messageRoutes');
// External ML API routes would be under routes/aiRoutes...
const aiRoutes = require('./routes/aiRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const welfareRoutes = require('./routes/welfareRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/survey', surveyQuestionRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
const mongoose = require('mongoose');
app.get('/api/health/db', (req, res) => {
  // Check if Mongoose connection is ready (readyState 1 = connected)
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: "MongoDB Connected" });
  } else {
    res.status(500).json({ status: "MongoDB Disconnected" });
  }
});

// Error Handling Middleware (Placeholder)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

module.exports = app;
