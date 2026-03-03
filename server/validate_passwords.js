require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function validateAndHashPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to DB for password validation');

    const users = await User.find({});
    let hashedCount = 0;
    let validCount = 0;

    for (const user of users) {
      // bcrypt hashes normally start with $2a$, $2b$, or $2y$ and are 60 characters long
      const isHashed = user.password && user.password.startsWith('$2') && user.password.length === 60;
      
      if (!isHashed) {
        console.log(`⚠️ Plain text password detected for user: ${user.id_num}. Hashing now...`);
        // We can just call save, because the pre('save') hook will hash it automatically since it has been modified 
        // wait, we have to actually modify it for isModified to trigger, or explicitly hash it and update
        user.password = await bcrypt.hash(user.password, 10);
        await User.updateOne({ _id: user._id }, { password: user.password });
        hashedCount++;
      } else {
        validCount++;
      }
    }

    console.log(`\n✅ Password Validation Complete`);
    console.log(`- Already secure (hashed): ${validCount}`);
    console.log(`- newly hashed and secured: ${hashedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validateAndHashPasswords();
