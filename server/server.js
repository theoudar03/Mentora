require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
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

}).catch(err => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});
