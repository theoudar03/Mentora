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
    console.error(`MongoDB Connection Protocol Error (Is IP Allowlisted?): ${error.message}`);
    process.exit(1); // On Render, it's correct to crash the server if DB fails, so Render can restart the container
  }
};

module.exports = connectDB;
