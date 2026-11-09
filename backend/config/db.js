const mongoose = require('mongoose');

const DEFAULT_ATLAS_URI = 'mongodb+srv://mahadevjayan4_db_user:8nGOHuXEOfgsuuzT@cluster0.aqatdrz.mongodb.net/classroom_db?retryWrites=true&w=majority';

const connectDB = async () => {
  const mongoUri = (process.env.MONGO_URI && process.env.MONGO_URI.trim() !== '')
    ? process.env.MONGO_URI.trim()
    : DEFAULT_ATLAS_URI;

  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`
ℹ️  Troubleshooting MongoDB connection:
1. In MongoDB Atlas (cloud.mongodb.com): Go to Security -> Network Access.
   Ensure '0.0.0.0/0' (Allow access from anywhere) is Active.
   If only your home IP was added, OpenShift cloud containers will be blocked!
2. Ensure username and password are valid in MONGO_URI.
    `);
    return false;
  }
};

module.exports = connectDB;
