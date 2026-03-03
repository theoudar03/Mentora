require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Assessment = require('./models/Assessment');
const Mentor = require('./models/Mentor');
const WelfareMember = require('./models/WelfareMember');
const SurveyQuestion = require('./models/SurveyQuestion');
const connectDB = require('./config/db');

// Helpers for random generation
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const maleNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan'];
const femaleNames = ['Diya', 'Ananya', 'Aadhya', 'Saanvi', 'Riya', 'Aarohi', 'Avni', 'Priya', 'Sara', 'Neha'];
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Rao', 'Verma', 'Nair', 'Joshy'];
const departments = ['CSE', 'ECE', 'EEE', 'IT', 'MECH'];
const facultyNames = ['Dr. Meera Iyer', 'Prof. Rajesh Kumar', 'Dr. Sanjay Gupta', 'Prof. Sunita Sharma', 'Dr. Ramesh Rao'];
const volunteerNames = ['Anita Roy', 'Vikram Sen', 'Rahul Menon'];

const seedDB = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    
    // 2. Clear existing records
    await Student.deleteMany();
    await Assessment.deleteMany();
    await Mentor.deleteMany();
    await WelfareMember.deleteMany();
    await SurveyQuestion.deleteMany();

    // 2.5 Generate 5 Survey Questions
    const surveyQuestionsData = [
      {
        question_text: "On a scale of 1 to 5, how would you rate your current stress level ?",
        category: "stress",
        options: [
          { label: "Very high", value: 1 },
          { label: "High", value: 2 },
          { label: "Moderate", value: 3 },
          { label: "Low", value: 4 },
          { label: "Very low", value: 5 }
        ],
        order_index: 1,
        is_active: true
      },
      {
        question_text: "How stressed do you feel before exams or deadlines ?",
        category: "academic_stress",
        options: [
          { label: "Extremely stressed", value: 1 },
          { label: "Very stressed", value: 2 },
          { label: "Moderate stressed", value: 3 },
          { label: "Slightly stressed", value: 4 },
          { label: "Not stressed", value: 5 }
        ],
        order_index: 2,
        is_active: true
      },
      {
        question_text: "How often do you feel sad or low in mood ?",
        category: "mood",
        options: [
          { label: "Always", value: 1 },
          { label: "Often", value: 2 },
          { label: "Sometimes", value: 3 },
          { label: "Rarely", value: 4 },
          { label: "Never", value: 5 }
        ],
        order_index: 3,
        is_active: true
      },
      {
        question_text: "How easily do other's words or actions affect you ?",
        category: "sensitivity",
        options: [
          { label: "Very strongly", value: 1 },
          { label: "Strongly", value: 2 },
          { label: "Moderately", value: 3 },
          { label: "Slightly", value: 4 },
          { label: "Not at all", value: 5 }
        ],
        order_index: 4,
        is_active: true
      },
      {
        question_text: "How supported do you feel by your family emotionally?",
        category: "family_support",
        options: [
          { label: "Fully supported", value: 1 },
          { label: "Strongly supported", value: 2 },
          { label: "Moderately supported", value: 3 },
          { label: "Slightly supported", value: 4 },
          { label: "Not at all supported", value: 5 }
        ],
        order_index: 5,
        is_active: true
      },
      {
        question_text: "How much do financial issues affect your studies ?",
        category: "financial_stress",
        options: [
          { label: "Extremely", value: 1 },
          { label: "Significantly", value: 2 },
          { label: "Moderately", value: 3 },
          { label: "Slightly", value: 4 },
          { label: "Not at all", value: 5 }
        ],
        order_index: 6,
        is_active: true
      },
      {
        question_text: "Do you have friends to talk about your personal problems ?",
        category: "social_support",
        options: [
          { label: "Always", value: 1 },
          { label: "Often", value: 2 },
          { label: "Sometimes", value: 3 },
          { label: "Rarely", value: 4 },
          { label: "Never", value: 5 }
        ],
        order_index: 7,
        is_active: true
      },
      {
        question_text: "How many hours do you sleep on average per night ?",
        category: "sleep",
        options: [
          { label: "More than 8 hours", value: 1 },
          { label: "8 hours", value: 2 },
          { label: "6-7 hours", value: 3 },
          { label: "4-5 hours", value: 4 },
          { label: "Less than 4 hours", value: 5 }
        ],
        order_index: 8,
        is_active: true
      },
      {
        question_text: "Do you have friends to talk about your personal problems ?",
        category: "social_support",
        options: [
          { label: "Always", value: 1 },
          { label: "Often", value: 2 },
          { label: "Sometimes", value: 3 },
          { label: "Rarely", value: 4 },
          { label: "Never", value: 5 }
        ],
        order_index: 9,
        is_active: true
      },
      {
        question_text: "How often have you felt upset because of unexpected events ?",
        category: "stress",
        options: [
          { label: "Always", value: 1 },
          { label: "Often", value: 2 },
          { label: "Sometimes", value: 3 },
          { label: "Rarely", value: 4 },
          { label: "Never", value: 5 }
        ],
        order_index: 10,
        is_active: true
      }
    ];
    await SurveyQuestion.insertMany(surveyQuestionsData);

    // 3. Generate 20 Students
    const studentsData = [];
    for (let i = 1; i <= 20; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = isMale ? randomItem(maleNames) : randomItem(femaleNames);
        const lastName = randomItem(lastNames);
        
        studentsData.push({
            id: `stu_${1000 + i}`,
            name: `${firstName} ${lastName}`,
            age: randomInt(18, 22),
            gender: isMale ? 'Male' : 'Female',
            department: randomItem(departments),
            year_of_study: randomInt(1, 4),
            cgpa: parseFloat(randomFloat(6.0, 9.2))
        });
    }
    const insertedStudents = await Student.insertMany(studentsData);

    // 4. Generate Assessments (1 per student)
    const assessmentsData = [];
    insertedStudents.forEach(student => {
        const perceived_stress_score = randomInt(1, 5);
        const anxiety_score = randomInt(1, 5);
        const loneliness_score = randomInt(1, 5);
        const academic_pressure_score = randomInt(1, 5);
        const sleep_quality_score = randomInt(1, 5);
        const campus_belonging_score = randomInt(1, 5);
        
        let risk = (perceived_stress_score + anxiety_score + loneliness_score + academic_pressure_score - sleep_quality_score - campus_belonging_score) * 10;
        
        // Clamp value between 10-90
        risk = Math.max(10, Math.min(90, risk));

        assessmentsData.push({
            student_id: student._id,
            cgpa_score: randomInt(5, 10),
            attendance_score: randomInt(60, 95),
            family_support_score: randomInt(1, 5),
            fee_payment_score: randomInt(3, 5),
            perceived_stress_score,
            anxiety_score,
            sleep_quality_score,
            loneliness_score,
            academic_pressure_score,
            physical_activity_score: randomInt(1, 5),
            campus_belonging_score,
            time_taken_to_attend_survey: randomInt(30, 180),
            Mental_health_Risk_Status: risk
        });
    });
    await Assessment.insertMany(assessmentsData);

    // 5. Generate 5 Mentors
    const mentorsData = facultyNames.map((name, index) => {
        return {
            name,
            department: departments[index], // Map across 5 departments
            phone: `+9198${randomInt(10000000, 99999999)}`,
            assigned_student_ids: []
        };
    });
    const insertedMentors = await Mentor.insertMany(mentorsData);
    
    // Divide students equally among mentors (20/5 = 4 students per mentor)
    for (let i = 0; i < insertedStudents.length; i++) {
        const mentorIndex = Math.floor(i / 4);
        insertedMentors[mentorIndex].assigned_student_ids.push(insertedStudents[i]._id);
    }
    for (const mentor of insertedMentors) {
        await mentor.save();
    }

    // 6. Generate 3 Welfare Members
    const welfareData = volunteerNames.map(name => {
        return {
            name,
            priority_access: true,
            status: 'active',
            assigned_student_ids: []
        };
    });
    const insertedWelfare = await WelfareMember.insertMany(welfareData);

    // Divide students roughly equally among welfare members (20/3)
    for (let i = 0; i < insertedStudents.length; i++) {
        const welfareIndex = i % 3;
        insertedWelfare[welfareIndex].assigned_student_ids.push(insertedStudents[i]._id);
    }
    for (const member of insertedWelfare) {
        await member.save();
    }

    console.log(`✅ 5 Survey Questions created`);
    console.log(`✅ 20 Students created`);
    console.log(`✅ 20 Assessments created`);
    console.log(`✅ 5 Mentors created`);
    console.log(`✅ 3 Welfare Members created`);
    console.log(`🌱 Database Seeded Successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error with database seeding:', error);
    process.exit(1);
  }
};

seedDB();
