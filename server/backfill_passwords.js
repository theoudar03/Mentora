require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updatePasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Backfilling.");

    const result1 = await User.updateMany(
      { password_last_changed_at: { $exists: false } },
      { $set: { password_last_changed_at: new Date() } }
    );
    console.log(`Updated documents lacking the field: ${result1.modifiedCount}`);

    const result2 = await User.updateMany(
      { password_last_changed_at: null },
      { $set: { password_last_changed_at: new Date() } }
    );
    console.log(`Updated documents where field was null: ${result2.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Backfill Failed:", error);
    process.exit(1);
  }
};

updatePasswords();
