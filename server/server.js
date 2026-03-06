require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect to DB immediately on server spin up
connectDB().catch(err => {
  console.error('Failed to connect to database on startup', err);
});

// Render provides a PORT environment variable, otherwise fallback to 5000
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Exiting so nodemon can retry.`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Export is still available if you ever want to run tests against the app
module.exports = server;
