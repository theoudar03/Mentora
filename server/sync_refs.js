require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const students = await Student.find({});
        for(let s of students) {
            await User.updateOne({ id_num: s.id_num }, { $set: { ref_id: s._id.toString() } });
        }
        console.log('Fixed users ref_ids.');
        process.exit(0);
    } catch(err) {
        console.error(err.message);
        process.exit(1);
    }
})();
