const mongoose = require('mongoose');

const DEFAULT_ATLAS_URI = 'mongodb+srv://mahadevjayan4_db_user:8nGOHuXEOfgsuuzT@cluster0.aqatdrz.mongodb.net/classroom_db?retryWrites=true&w=majority';

let isConnecting = false;

const cleanUri = (uri) => {
  if (!uri) return DEFAULT_ATLAS_URI;
  return uri.trim().replace(/^["']|["']$/g, '');
};

const autoSeedIfEmpty = async () => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 [DB] Database is empty! Auto-seeding initial demo accounts...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);

      const teacher = await User.create({
        name: 'Prof. Sarah Jenkins',
        email: 'teacher@school.edu',
        password: passwordHash,
        role: 'teacher',
        phone: '+1-555-0100',
        department: 'Computer Science & Mathematics',
        designation: 'Head Teacher & Class Coordinator'
      });

      const student = await User.create({
        name: 'Alex Johnson',
        email: 'student@school.edu',
        password: passwordHash,
        role: 'student',
        rollNumber: 'CS-101',
        gradeClass: 'Class 10-A',
        phone: '+1-555-0101'
      });

      const parent = await User.create({
        name: 'David Johnson',
        email: 'parent@school.edu',
        password: passwordHash,
        role: 'parent',
        phone: '+1-555-0103',
        studentRef: student._id
      });

      await User.findByIdAndUpdate(student._id, { parentRef: parent._id });
      console.log('✅ [DB] Auto-seed completed successfully!');
    } else {
      console.log(`ℹ️ [DB] Existing user accounts verified: ${userCount} users present.`);
    }
  } catch (err) {
    console.warn('⚠️ [DB] Auto-seed check notice:', err.message);
  }
};

const connectDB = async (retryCount = 0) => {
  if (mongoose.connection.readyState === 1) return true;
  if (isConnecting) return false;

  const mongoUri = cleanUri(process.env.MONGO_URI);
  isConnecting = true;

  try {
    console.log(`[DB] Attempting MongoDB connection (attempt ${retryCount + 1})...`);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4 to prevent IPv6 DNS routing issues on cloud containers
    });

    console.log(`✅ [DB] MongoDB Connected Successfully: ${conn.connection.host}`);
    isConnecting = false;

    // Run auto-seed check in background
    autoSeedIfEmpty();
    return true;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ [DB] Connection Error: ${error.message}`);

    // Auto-retry every 4 seconds in the background so it never stays disconnected
    const nextRetry = retryCount + 1;
    console.log(`[DB] Scheduling reconnection attempt in 4 seconds (attempt ${nextRetry + 1})...`);
    setTimeout(() => {
      connectDB(nextRetry);
    }, 4000);
    return false;
  }
};

// Event listeners for connection lifecycle
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ [DB] MongoDB disconnected! Triggering automatic reconnect...');
  setTimeout(() => connectDB(0), 3000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ [DB] Mongoose connection error event:', err.message);
});

module.exports = connectDB;
