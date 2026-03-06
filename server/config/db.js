const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI is missing, skipping DB connect for now.");
      return;
    }
    // Clean the URI just in case it was pasted into Render with literal quotes, spaces, or "MONGO_URI=" prefixes
    let uri = process.env.MONGO_URI.trim();
    if (uri.startsWith('MONGO_URI=')) uri = uri.slice(10);
    if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
      uri = uri.slice(1, -1);
    }
    
    console.log(`Attempting to connect with URI starting with: ${uri.substring(0, 15)}...`);
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Protocol Error: ${error.message}`);
    console.error(`IMPORTANT: Please check the 'MONGO_URI' environment variable value in your Render dashboard.`);
    // Intentionally omitted process.exit(1) to allow Render port binding to complete even if DB fails initially
  }
};

module.exports = connectDB;
