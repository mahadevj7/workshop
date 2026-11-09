const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/classroom_db');
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`
ℹ️  How to resolve MongoDB connection:
1. If using local MongoDB: Ensure MongoDB Service is running (run 'net start MongoDB' or start mongod).
2. If using MongoDB Atlas (Cloud): Update MONGO_URI in 'backend/.env' with your connection string:
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/classroom_db?retryWrites=true&w=majority
    `);
    return false;
  }
};

module.exports = connectDB;

