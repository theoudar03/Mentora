const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI is missing, skipping DB connect for now.");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Instead of exiting the whole process which crashes Vercel's serverless function,
    // we throw an error that can be caught by the caller.
    throw error;
  }
};

module.exports = connectDB;
