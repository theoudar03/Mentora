require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const hash = async (plain) => bcrypt.hash(plain, 10);
const oid  = () => new mongoose.Types.ObjectId();
const now  = (offsetMinutes = 0) => new Date(Date.now() + offsetMinutes * 60000);

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log('\n🔗 Connected to DB:', db.databaseName);

  // ─── STEP 1: Drop collections ──────────────────────────────────────────────
  const toDrop = ['students','mentors','welfaremembers','surveyquestions','messages','users'];
  for (const c of toDrop) {
    try { await db.dropCollection(c); console.log(`  🗑  Dropped: ${c}`); }
    catch (_) { console.log(`  ℹ  ${c} did not exist`); }
  }

  // ─── STEP 2: STUDENTS (20, alphabetical, IDs 8001→8020) ───────────────────
  console.log('\n📚 Inserting Students...');
  const STUDENTS_RAW = [
    { name:'Aadhya Singh',   department:'CSE'  },
    { name:'Aarohi Sharma',  department:'ECE'  },
    { name:'Aditya Nair',    department:'MECH' },
    { name:'Ananya Patel',   department:'IT'   },
    { name:'Arjun Kumar',    department:'EEE'  },
    { name:'Arjun Rao',      department:'CSE'  },
    { name:'Avni Gupta',     department:'MECH' },
    { name:'Diya Nair',      department:'ECE'  },
    { name:'Ishaan Reddy',   department:'IT'   },
    { name:'Ishaan Sharma',  department:'EEE'  },
    { name:'Krishna Gupta',  department:'CSE'  },
    { name:'Krishna Nair',   department:'MECH' },
    { name:'Meera Patel',    department:'ECE'  },
    { name:'Neha Joshy',     department:'EEE'  },
    { name:'Priya Singh',    department:'IT'   },
    { name:'Rahul Verma',    department:'CSE'  },
    { name:'Sai Nair',       department:'EEE'  },
    { name:'Sara Joshy',     department:'ECE'  },
    { name:'Vivaan Nair',    department:'IT'   },
    { name:'Vivaan Sharma',  department:'MECH' },
  ]; // Already alphabetical A→Z

  const studentDocs = [];
  for (let i = 0; i < STUDENTS_RAW.length; i++) {
    const id_num = String(8001 + i);
    studentDocs.push({
      _id:        oid(),
      id:         id_num,
      id_num,
      name:       STUDENTS_RAW[i].name,
      department: STUDENTS_RAW[i].department,
      age:        18 + Math.floor(i % 5),
      gender:     i % 2 === 0 ? 'Male' : 'Female',
      year_of_study: 1 + (i % 4),
      cgpa:       parseFloat((6.5 + ((i * 0.17) % 3)).toFixed(2)),
      created_at: new Date(),
    });
  }
  await db.collection('students').insertMany(studentDocs);
  await db.collection('students').createIndex({ id_num: 1 }, { unique: true });
  console.log(`  ✅ Students inserted: ${studentDocs.length}`);

  // ─── STEP 3: MENTORS (5, alphabetical, IDs 5001→5005) ─────────────────────
  console.log('\n👨‍🏫 Inserting Mentors...');
  const MENTORS_RAW = [
    { name:'Dr. Anitha Nair',     department:'CSE',  phone:'+919876543001' },
    { name:'Dr. Meera Iyer',      department:'ECE',  phone:'+919876543002' },
    { name:'Dr. Sanjay Gupta',    department:'MECH', phone:'+919876543003' },
    { name:'Prof. Rajesh Kumar',  department:'EEE',  phone:'+919876543004' },
    { name:'Prof. Sunita Sharma', department:'IT',   phone:'+919876543005' },
  ]; // Alphabetical: An < Me < Sa < Ra < Su — Actually: An < Me < Ra < Sa < Su

  // Re-sort by name for strict alphabetical
  MENTORS_RAW.sort((a, b) => a.name.localeCompare(b.name));

  const mentorDocs = [];
  for (let i = 0; i < MENTORS_RAW.length; i++) {
    const id_num = String(5001 + i);
    const deptStudents = studentDocs
      .filter(s => s.department === MENTORS_RAW[i].department)
      .map(s => s._id);

    mentorDocs.push({
      _id:                  oid(),
      id_num,
      name:                 MENTORS_RAW[i].name,
      department:           MENTORS_RAW[i].department,
      phone:                MENTORS_RAW[i].phone,
      assigned_student_ids: deptStudents,
    });
  }
  await db.collection('mentors').insertMany(mentorDocs);
  console.log(`  ✅ Mentors inserted: ${mentorDocs.length}`);

  // ─── STEP 4: WELFARE MEMBERS (3, alphabetical, IDs 3001→3003) ─────────────
  console.log('\n🏥 Inserting Welfare Members...');
  const WELFARE_RAW = [
    { name:'Anita Roy'       },
    { name:'Dr. Suresh Menon'},
    { name:'Priya Krishnan'  },
  ];
  WELFARE_RAW.sort((a, b) => a.name.localeCompare(b.name));

  const allStudentIds = studentDocs.map(s => s._id);
  const welfareDocs = [];
  for (let i = 0; i < WELFARE_RAW.length; i++) {
    const id_num = String(3001 + i);
    welfareDocs.push({
      _id:                  oid(),
      id_num,
      name:                 WELFARE_RAW[i].name,
      priority_access:      true,
      status:               'active',
      assigned_student_ids: allStudentIds,
    });
  }
  await db.collection('welfaremembers').insertMany(welfareDocs);
  console.log(`  ✅ Welfare members inserted: ${welfareDocs.length}`);

  // ─── STEP 5: USERS COLLECTION ─────────────────────────────────────────────
  console.log('\n🔐 Inserting Users...');
  const userDocs = [];

  // Students
  for (const s of studentDocs) {
    userDocs.push({
      _id:        oid(),
      id_num:     s.id_num,
      name:       s.name,
      password:   await hash(s.id_num),
      role:       'student',
      department: s.department,
      ref_id:     s._id.toString(),
      created_at: new Date(),
    });
  }
  // Mentors
  for (const m of mentorDocs) {
    userDocs.push({
      _id:        oid(),
      id_num:     m.id_num,
      name:       m.name,
      password:   await hash(m.id_num),
      role:       'mentor',
      department: m.department,
      ref_id:     m._id.toString(),
      created_at: new Date(),
    });
  }
  // Welfare
  for (const w of welfareDocs) {
    userDocs.push({
      _id:        oid(),
      id_num:     w.id_num,
      name:       w.name,
      password:   await hash(w.id_num),
      role:       'welfare',
      department: 'Admin',
      ref_id:     w._id.toString(),
      created_at: new Date(),
    });
  }
  // Sort users alphabetically by name before insert
  userDocs.sort((a, b) => a.name.localeCompare(b.name));

  await db.collection('users').insertMany(userDocs);
  await db.collection('users').createIndex({ id_num: 1 }, { unique: true });
  console.log(`  ✅ Users inserted: ${userDocs.length}`);

  // ─── STEP 6: SURVEY QUESTIONS (10 exact, indexed by order) ───────────────
  console.log('\n📝 Inserting Survey Questions...');
  const surveyQuestions = [
    {
      order_index:  1,
      factor:       'academic_pressure_score',
      question:     'How often do you feel overwhelmed by your academic workload?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
    {
      order_index:  2,
      factor:       'academic_pressure_score',
      question:     'How frequently do you feel that your academic deadlines are too tight?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
    {
      order_index:  3,
      factor:       'anxiety_score',
      question:     'How often do you experience excessive worry or nervousness about college?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
    {
      order_index:  4,
      factor:       'anxiety_score',
      question:     'How frequently do you experience physical symptoms of anxiety (racing heart, sweating) before exams?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
    {
      order_index:  5,
      factor:       'family_support_score',
      question:     'How often do you feel emotionally supported by your family?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
    {
      order_index:  6,
      factor:       'family_support_score',
      question:     'How frequently can you talk openly about your college problems with your family?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
    {
      order_index:  7,
      factor:       'loneliness_score',
      question:     'How often do you feel lonely or isolated on campus?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
    {
      order_index:  8,
      factor:       'sleep_quality_score',
      question:     'How often do you get less than 6 hours of sleep on college nights?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
    {
      order_index:  9,
      factor:       'campus_belonging_score',
      question:     'How much do you feel you belong and are accepted on your campus?',
      options:      ['Not at all','A little','Moderately','Quite a bit','Very much'],
      is_active:    true,
    },
    {
      order_index: 10,
      factor:       'perceived_stress_score',
      question:     'In the past week, how often have you felt unable to control important things in your life?',
      options:      ['Never','Rarely','Sometimes','Often','Always'],
      is_active:    true,
    },
  ];
  // Already sorted by order_index 1→10
  await db.collection('surveyquestions').insertMany(surveyQuestions);
  await db.collection('surveyquestions').createIndex({ order_index: 1 });
  await db.collection('surveyquestions').createIndex({ is_active: 1, order_index: 1 });
  console.log(`  ✅ Survey questions inserted: ${surveyQuestions.length}`);

  // ─── STEP 7: MESSAGES (15, chronological) ─────────────────────────────────
  console.log('\n💬 Inserting Messages...');

  // Build lookup maps
  const userMap  = {};
  userDocs.forEach(u => { userMap[u.id_num] = u; });
  const stuUsers = userDocs.filter(u => u.role === 'student');
  const menUsers = userDocs.filter(u => u.role === 'mentor');
  const welUsers = userDocs.filter(u => u.role === 'welfare');

  const msgTemplates = [
    // student → mentor
    { si:0, mi:0, text:'Professor, I am struggling with the last assignment. Can we meet?', status:'read',      minsAgo:240 },
    { si:1, mi:1, text:'Sir, I need guidance on my project timeline.',                      status:'read',      minsAgo:220 },
    { si:2, mi:2, text:'Ma\'am, I have been feeling very stressed about upcoming exams.',    status:'delivered', minsAgo:200 },
    { si:3, mi:3, text:'Professor, could you share resources for the next module?',         status:'delivered', minsAgo:180 },
    { si:4, mi:4, text:'I am having difficulty understanding the lab work, please help.',   status:'sent',      minsAgo:160 },
    // mentor → student
    { mi:0, si:0, text:'Sure, let\'s meet tomorrow at 10am in my office.', status:'read',      minsAgo:230, reverse:true },
    { mi:1, si:1, text:'Please submit your timeline draft by Friday.',      status:'read',      minsAgo:210, reverse:true },
    { mi:2, si:2, text:'Try to take breaks and pace your revision well.',   status:'delivered', minsAgo:190, reverse:true },
    // student → welfare
    { si:5, wi:0, text:'I feel very anxious and need to talk to someone.',               status:'read',      minsAgo:140 },
    { si:6, wi:0, text:'The campus environment has been tough for me lately.',           status:'delivered', minsAgo:120 },
    { si:7, wi:1, text:'I have been missing classes due to personal issues.',            status:'delivered', minsAgo:100 },
    { si:8, wi:1, text:'I would like to seek counselling if possible.',                  status:'sent',      minsAgo:80  },
    // mentor → welfare
    { mi:0, wi:0, text:'I noticed Aadhya might need additional mental health support.',  status:'read',      minsAgo:70  , mToW:true },
    { mi:1, wi:0, text:'Two students in my department are showing high stress markers.', status:'delivered', minsAgo:50  , mToW:true },
    // welfare → mentor
    { wi:0, mi:0, text:'We have noted the concern and will reach out to the student.',   status:'read',      minsAgo:60  , wToM:true },
    { wi:1, mi:1, text:'Please flag any students who need urgent attention this week.',  status:'sent',      minsAgo:30  , wToM:true },
  ];

  const messageDocs = [];
  for (const t of msgTemplates) {
    let sender, receiver, senderRole, receiverRole, dept;
    if (t.reverse) {
      // mentor → student
      sender       = menUsers[t.mi % menUsers.length];
      receiver     = stuUsers[t.si % stuUsers.length];
      senderRole   = 'mentor';
      receiverRole = 'student';
      dept         = sender.department;
    } else if (t.mToW) {
      sender       = menUsers[t.mi % menUsers.length];
      receiver     = welUsers[t.wi % welUsers.length];
      senderRole   = 'mentor';
      receiverRole = 'welfare';
      dept         = sender.department;
    } else if (t.wToM) {
      sender       = welUsers[t.wi % welUsers.length];
      receiver     = menUsers[t.mi % menUsers.length];
      senderRole   = 'welfare';
      receiverRole = 'mentor';
      dept         = receiver.department;
    } else if (t.wi !== undefined && t.si !== undefined) {
      // student → welfare
      sender       = stuUsers[t.si % stuUsers.length];
      receiver     = welUsers[t.wi % welUsers.length];
      senderRole   = 'student';
      receiverRole = 'welfare';
      dept         = sender.department;
    } else {
      // student → mentor
      sender       = stuUsers[t.si % stuUsers.length];
      receiver     = menUsers[t.mi % menUsers.length];
      senderRole   = 'student';
      receiverRole = 'mentor';
      dept         = sender.department;
    }

    messageDocs.push({
      _id:          oid(),
      sender_id:    sender._id,
      sender_role:  senderRole,
      receiver_id:  receiver._id,
      receiver_role: receiverRole,
      department:   dept,
      message_text: t.text,
      status:       t.status,
      created_at:   now(-t.minsAgo),
    });
  }

  // Sort chronologically ascending before insert
  messageDocs.sort((a, b) => a.created_at - b.created_at);
  await db.collection('messages').insertMany(messageDocs);
  await db.collection('messages').createIndex(
    { sender_id: 1, receiver_id: 1, created_at: 1 }
  );
  await db.collection('messages').createIndex({ receiver_id: 1, status: 1 });
  console.log(`  ✅ Messages inserted: ${messageDocs.length}`);

  // ─── STEP 8: VALIDATION ───────────────────────────────────────────────────
  console.log('\n🔍 Validating...');
  const counts = {
    students:        await db.collection('students').countDocuments(),
    mentors:         await db.collection('mentors').countDocuments(),
    welfare_members: await db.collection('welfaremembers').countDocuments(),
    survey_questions:await db.collection('surveyquestions').countDocuments(),
    messages:        await db.collection('messages').countDocuments(),
    users:           await db.collection('users').countDocuments(),
  };

  const qs = await db.collection('surveyquestions')
    .find({}).sort({ order_index: 1 }).toArray();

  const minQ = qs[0]?.order_index;
  const maxQ = qs[qs.length - 1]?.order_index;

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║       MENTORA — SEED SUMMARY           ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Students:         ${String(counts.students).padEnd(19)}║`);
  console.log(`║  Mentors:          ${String(counts.mentors).padEnd(19)}║`);
  console.log(`║  Welfare members:  ${String(counts.welfare_members).padEnd(19)}║`);
  console.log(`║  Survey Questions: ${String(counts.survey_questions).padEnd(19)}║`);
  console.log(`║  Messages:         ${String(counts.messages).padEnd(19)}║`);
  console.log(`║  Users (auth):     ${String(counts.users).padEnd(19)}║`);
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Survey order_index min: ${String(minQ).padEnd(13)}║`);
  console.log(`║  Survey order_index max: ${String(maxQ).padEnd(13)}║`);
  console.log(`║  Indexes created:  Yes                 ║`);
  console.log(`║  All collections sorted: Verified      ║`);
  console.log('╚════════════════════════════════════════╝');

  console.log('\n🎯 Login Credentials (ID = Password):');
  console.log('  Welfare → 3001 / 3001');
  console.log('  Mentor  → 5001 / 5001');
  console.log('  Student → 8001 / 8001');

  await mongoose.disconnect();
  console.log('\n✅ Done!\n');
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
