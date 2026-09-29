// Run once with: node seed.js
// Inserts the sample events from the case study so the app has data to demo with.

const mongoose = require("mongoose");
const Event = require("./models/Event");

mongoose.connect("mongodb://127.0.0.1:27017/collegeEventDB").then(async () => {
  await Event.deleteMany({});
  await Event.insertMany([
    { eventName: "Web Design Contest", eventType: "Technical", eventDate: "2026-10-15", venue: "Seminar Hall", maxParticipants: 50 },
    { eventName: "Quiz Competition", eventType: "Technical", eventDate: "2026-10-18", venue: "Lab 2", maxParticipants: 40 },
    { eventName: "Dance Competition", eventType: "Cultural", eventDate: "2026-10-20", venue: "Auditorium", maxParticipants: 60 }
  ]);
  console.log("Sample events inserted.");
  mongoose.disconnect();
});
