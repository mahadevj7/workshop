const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testConnection = async () => {
  const uri = process.env.MONGO_URI;
  console.log('Testing connection to MongoDB...');
  console.log(`URI target: ${uri ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'Not defined'}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`\n🎉 SUCCESS! Connected to MongoDB host: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    console.log(`Ready state: ${conn.connection.readyState} (1 = connected)\n`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ FAILED to connect: ${error.message}\n`);
    console.log('Troubleshooting tips:');
    console.log('1. Verify your username and password in the connection string.');
    console.log('2. Check Network Access in MongoDB Atlas -> Ensure IP 0.0.0.0/0 (Allow access from anywhere) is added.');
    console.log('3. If password contains special characters, ensure they are URL-encoded (e.g. @ becomes %40).\n');
    process.exit(1);
  }
};

testConnection();

