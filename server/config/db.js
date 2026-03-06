const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI is missing, skipping DB connect for now.");
      return;
    }
    // Clean the URI just in case it was pasted into Render with literal quotes or spaces
    let uri = process.env.MONGO_URI.trim();
    if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
      uri = uri.slice(1, -1);
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Protocol Error (Is IP Allowlisted?): ${error.message}`);
    process.exit(1); // On Render, it's correct to crash the server if DB fails, so Render can restart the container
  }
};

module.exports = connectDB;
