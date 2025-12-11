// backend/src/db/index.js
import mongoose from 'mongoose';
import config from '../config/index.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.databaseUrl);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
