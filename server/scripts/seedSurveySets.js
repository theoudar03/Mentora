const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const SurveyQuestion = require('../models/SurveyQuestion');

const options = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Always" }
];

const surveySets = [
  // SET 1
  [
    { order_index: 1, factor: "academic_pressure_score", question: "How often do you feel overwhelmed by your academic workload?" },
    { order_index: 2, factor: "academic_pressure_score", question: "How frequently do you worry about failing your courses?" },
    { order_index: 3, factor: "anxiety_score", question: "How often do you feel nervous, anxious, or on edge?" },
    { order_index: 4, factor: "anxiety_score", question: "How often do you have trouble relaxing or calming down?" },
    { order_index: 5, factor: "family_support_score", question: "How often do you feel your family is supportive of your decisions?" },
    { order_index: 6, factor: "family_support_score", question: "How comfortably can you discuss personal issues with your family?" },
    { order_index: 7, factor: "loneliness_score", question: "How often do you feel completely alone, even when around others?" },
    { order_index: 8, factor: "sleep_quality_score", question: "How often do you get a full, restful night of sleep?" },
    { order_index: 9, factor: "campus_belonging_score", question: "How often do you feel like you truly belong on this campus?" },
    { order_index: 10, factor: "perceived_stress_score", question: "How often do you find that you cannot cope with all the things you have to do?" }
  ],
  // SET 2
  [
    { order_index: 1, factor: "academic_pressure_score", question: "How often do you feel you lack enough time to complete all your assignments?" },
    { order_index: 2, factor: "academic_pressure_score", question: "How relentlessly do you feel pressure to achieve perfect grades?" },
    { order_index: 3, factor: "anxiety_score", question: "How often do you experience sudden feelings of panic for no obvious reason?" },
    { order_index: 4, factor: "anxiety_score", question: "How frequently do you find yourself worrying unnecessarily about various things?" },
    { order_index: 5, factor: "family_support_score", question: "How often do you feel understood by your family members?" },
    { order_index: 6, factor: "family_support_score", question: "How often do you turn to your family when you are in distress?" },
    { order_index: 7, factor: "loneliness_score", question: "How frequently do you lack companionship or feel left out?" },
    { order_index: 8, factor: "sleep_quality_score", question: "How often do you struggle to fall asleep because your mind is racing?" },
    { order_index: 9, factor: "campus_belonging_score", question: "How often do you feel connected with your peers at the university?" },
    { order_index: 10, factor: "perceived_stress_score", question: "How often are you angered because of things that happened that were outside your control?" }
  ],
  // SET 3
  [
    { order_index: 1, factor: "academic_pressure_score", question: "How often do academic expectations cause you physical stress (e.g. headaches, stomach aches)?" },
    { order_index: 2, factor: "academic_pressure_score", question: "How often do you contemplate dropping out or pausing your studies due to stress?" },
    { order_index: 3, factor: "anxiety_score", question: "How frequently do you feel a sense of dread about the future?" },
    { order_index: 4, factor: "anxiety_score", question: "How often do you feel restless or find it hard to sit still?" },
    { order_index: 5, factor: "family_support_score", question: "How consistently does your family encourage your personal goals?" },
    { order_index: 6, factor: "family_support_score", question: "How often do you feel emotionally disconnected from your family?" },
    { order_index: 7, factor: "loneliness_score", question: "How often do you feel that no one really understands you?" },
    { order_index: 8, factor: "sleep_quality_score", question: "How often do you wake up feeling exhausted rather than refreshed?" },
    { order_index: 9, factor: "campus_belonging_score", question: "How frequently do you participate in or feel welcome at campus events?" },
    { order_index: 10, factor: "perceived_stress_score", question: "How often do you feel difficulties are piling up so high that you cannot overcome them?" }
  ],
  // SET 4
  [
    { order_index: 1, factor: "academic_pressure_score", question: "How often does your coursework interfere with your ability to enjoy free time?" },
    { order_index: 2, factor: "academic_pressure_score", question: "How frequently do you feel you are falling behind your classmates academically?" },
    { order_index: 3, factor: "anxiety_score", question: "How often do your worries prevent you from fully concentrating on tasks?" },
    { order_index: 4, factor: "anxiety_score", question: "How often do you avoid social situations out of fear or extreme apprehension?" },
    { order_index: 5, factor: "family_support_score", question: "How often can you rely on your family for financial or emotional stability?" },
    { order_index: 6, factor: "family_support_score", question: "How strongly do you feel your family's expectations conflict with your own?" },
    { order_index: 7, factor: "loneliness_score", question: "How often do you have no one to talk to about a problem?" },
    { order_index: 8, factor: "sleep_quality_score", question: "How often do you experience interrupted sleep throughout the night?" },
    { order_index: 9, factor: "campus_belonging_score", question: "How often do you feel seen and valued by your professors or campus staff?" },
    { order_index: 10, factor: "perceived_stress_score", question: "How often are you upset because of something that happened unexpectedly?" }
  ],
  // SET 5
  [
    { order_index: 1, factor: "academic_pressure_score", question: "How often do you sacrifice basic needs (like eating or socializing) to study?" },
    { order_index: 2, factor: "academic_pressure_score", question: "How often do you feel unprepared for your exams or assignments despite studying?" },
    { order_index: 3, factor: "anxiety_score", question: "How frequently do you experience physical symptoms of anxiety (e.g. rapid heartbeat, sweating)?" },
    { order_index: 4, factor: "anxiety_score", question: "How often do you feel overwhelmed by a sense of impending doom?" },
    { order_index: 5, factor: "family_support_score", question: "How regularly does your family check in on your mental well-being?" },
    { order_index: 6, factor: "family_support_score", question: "How openly can you express your true self around your family?" },
    { order_index: 7, factor: "loneliness_score", question: "How often do you feel isolated from the world around you?" },
    { order_index: 8, factor: "sleep_quality_score", question: "How often do you rely on substances or medication to help you fall asleep?" },
    { order_index: 9, factor: "campus_belonging_score", question: "How often do you feel proud to be a part of this institution's community?" },
    { order_index: 10, factor: "perceived_stress_score", question: "How often do you feel confident about your ability to handle your personal problems?" }
  ]
];

const seedSurveySets = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://theo_admin:Theo0308@mhs.fmrd7gb.mongodb.net/";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing
    await SurveyQuestion.deleteMany({});
    console.log("Cleared existing survey questions");

    // Insert new
    const documents = [];
    surveySets.forEach((set, setIndex) => {
      const survey_set = setIndex + 1;
      set.forEach(q => {
        documents.push({
          question: q.question,
          factor: q.factor,
          order_index: q.order_index,
          options: options,
          survey_set: survey_set,
          is_active: true
        });
      });
    });

    await SurveyQuestion.insertMany(documents);
    console.log(`Successfully seeded ${documents.length} questions across 5 survey sets`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding survey sets:", error);
    process.exit(1);
  }
};

seedSurveySets();
