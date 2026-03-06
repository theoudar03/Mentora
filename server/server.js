require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect to DB immediately for serverless warmups
connectDB().catch(err => {
  console.error('Failed to connect to database', err);
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} already in use. Exiting so nodemon can retry.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

// Export for Vercel serverless execution
module.exports = app;
