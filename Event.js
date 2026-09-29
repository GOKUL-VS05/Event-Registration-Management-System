const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventType: { type: String, required: true }, // Technical / Cultural / etc.
  eventDate: { type: String, required: true },
  venue: { type: String, required: true },
  maxParticipants: { type: Number, required: true }
});

module.exports = mongoose.model("Event", eventSchema, "events");
