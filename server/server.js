require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// We explicitly delay DB connection until proper Express middleware catches the request 
// to prevent unresolved Promise deadlocks inside the serverless functions container.

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
