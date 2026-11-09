const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database readiness check middleware for API requests
app.use('/api', async (req, res, next) => {
  // Always permit health checks to pass through
  if (req.path === '/health') return next();

  // If connected, pass immediately
  if (mongoose.connection.readyState === 1) return next();

  // If connecting, wait briefly (up to 3.5s) for it to finalize
  if (mongoose.connection.readyState === 2) {
    let waited = 0;
    while (waited < 3500 && mongoose.connection.readyState === 2) {
      await new Promise(r => setTimeout(r, 350));
      waited += 350;
    }
    if (mongoose.connection.readyState === 1) return next();
  } else {
    // If disconnected, trigger reconnection and wait briefly
    connectDB();
    let waited = 0;
    while (waited < 3000 && mongoose.connection.readyState !== 1) {
      await new Promise(r => setTimeout(r, 350));
      waited += 350;
    }
    if (mongoose.connection.readyState === 1) return next();
  }

  // If still not ready, return fast 503 instead of 10-second Mongoose buffer timeout
  return res.status(503).json({
    success: false,
    message: 'Database connection to MongoDB Atlas is establishing. Please wait a few seconds and try again.'
  });
});

// Routes Mount
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/pta', require('./routes/ptaRoutes'));
app.use('/api/remarks', require('./routes/remarkRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Health check endpoint with live database status
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const stateLabels = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  res.json({
    status: 'OK',
    database: stateLabels[dbState] || 'Unknown',
    readyState: dbState,
    message: dbState === 1 ? 'Classroom Management API & Database are operational' : 'Database connection pending or disconnected',
    timestamp: new Date().toISOString()
  });
});

const path = require('path');
const fs = require('fs');

// Serve static frontend build if dist folder exists (Production / OpenShift mode)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Root welcome endpoint for development
  app.get('/', (req, res) => {
    res.send('Classroom Management Backend API is running. Access endpoints via /api/ ...');
  });
}

// Global 404 Handler for API
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

