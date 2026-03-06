const mongoose = require('mongoose');

// Vercel Serverless best practice: DO NOT buffer commands. 
// If DB drops, fail instantly so it's caught and debugged, rather than a 10s timeout wrapper.
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI is missing, skipping DB connect for now.");
      return;
    }
    
    // If we're disconnected after a previous failure, clean up before retrying
    if (mongoose.connection.readyState === 0) {
      await mongoose.disconnect();
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB Connection Protocol Error (Is IP Allowlisted?): ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
