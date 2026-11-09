const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const viewDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\n==================================================`);
    console.log(` Connected to: ${conn.connection.host}`);
    console.log(` Database:     ${conn.connection.name}`);
    console.log(`==================================================\n`);

    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collection(s) in '${conn.connection.name}':\n`);

    for (const col of collections) {
      const count = await conn.connection.db.collection(col.name).countDocuments();
      console.log(` • ${col.name.padEnd(20)} : ${count} document(s)`);
    }

    console.log(`\n==================================================\n`);
    process.exit(0);
  } catch (error) {
    console.error('Error fetching database collections:', error.message);
    process.exit(1);
  }
};

viewDatabase();

