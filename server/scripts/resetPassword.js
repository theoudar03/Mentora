require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const TARGET_ID = '8004';

const resetPassword = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://theo_admin:Theo0308@mhs.fmrd7gb.mongodb.net/";
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ id_num: TARGET_ID });
    if (!user) {
      console.error(`User with id_num "${TARGET_ID}" not found.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (role: ${user.role})`);

    // Hash the new password (same as id_num)
    const hashedPassword = await bcrypt.hash(TARGET_ID, 10);
    user.password = hashedPassword;
    user.save = async function() { // bypass pre-save hook to avoid double-hashing
      return User.updateOne({ _id: this._id }, { $set: { password: hashedPassword } });
    };
    await user.save();

    console.log(`✅ Password for user "${TARGET_ID}" has been reset to "${TARGET_ID}"`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetPassword();
