require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Assessment = require('./models/Assessment');
        const Student = require('./models/Student');
        
        // delete old week assessment for 8001
        const s = await Student.findOne({ id_num: '8001' });
        await Assessment.deleteMany({ student_id: s._id });

        const client = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true });
        
        // 1. Auth
        let res = await client.post('/auth/login', { id_num: '8001', password: '8001' });
        client.defaults.headers.Cookie = res.headers['set-cookie'][0];

        // 3. Fetch questions
        let qRes = await client.get('/survey/questions');
        const questions = qRes.data;

        // 4. Submit
        const answers = questions.map((q, idx) => ({ questionId: q._id, value: 5 })); // all 5s 
        let submitRes = await client.post('/assessments/submit', { answers });
        console.log('Submit Success! Risk Score:', submitRes.data.riskScore);

        // 5. Verify Student DB 
        const updatedStudent = await Student.findOne({ id_num: '8001' }).lean();
        console.log('DB Validated Risk:', updatedStudent.Mental_health_Risk_Status);
        console.log('DB Validated Academic Pressure Factor:', updatedStudent.academic_pressure_score);

        console.log('Test completed safely.');
        process.exit(0);
    } catch(err) {
        console.error('Error:', err.response?.data?.message || err.response?.data || err.message);
        process.exit(1);
    }
})();
