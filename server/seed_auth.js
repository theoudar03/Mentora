const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Student = require('./models/Student');
const Mentor = require('./models/Mentor');

async function seedAuth() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected DB");

  try {
     await User.collection.dropIndex('email_1');
     console.log('Dropped legacy email index');
  } catch(err) {}

  // Sync Students
  const students = await Student.find();
  for(let i=0; i<students.length; i++) {
     const s = students[i];
     const id_num = `STU${s._id.toString().slice(-4)}`;
     const exists = await User.findOne({ id_num });
     if(!exists) {
        await User.create({
           id_num,
           name: s.name,
           password: 'password123',
           role: 'student',
           department: s.department,
           ref_id: s._id.toString()
        });
        console.log(`Created student user ${id_num} for ${s.name}`);
     }
  }

  // Sync Mentors
  const mentors = await Mentor.find();
  for(let i=0; i<mentors.length; i++) {
     const m = mentors[i];
     const id_num = `MTR${m._id.toString().slice(-4)}`;
     const exists = await User.findOne({ id_num });
     if(!exists) {
        await User.create({
           id_num,
           name: m.name,
           password: 'password123',
           role: 'mentor',
           department: 'IT', // fallback or real
           ref_id: m._id.toString()
        });
        console.log(`Created mentor user ${id_num}`);
     }
  }

  // Create standard Welfare Admin
  const welfareExists = await User.findOne({ role: 'welfare' });
  if(!welfareExists) {
     await User.create({
        id_num: 'ADMIN001',
        name: 'Welfare Director',
        password: 'password123',
        role: 'welfare',
        department: 'Admin'
     });
     console.log('Created Welfare account');
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seedAuth();
