const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  registerNo: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  eventName: { type: String, required: true },
  eventType: { type: String, required: true },
  idCard: { type: String, required: true }, // stored file path e.g. uploads/23IT105_idcard.jpg
  registeredAt: { type: Date, default: Date.now }
});

// Prevent the same register number from registering twice for the same event
registrationSchema.index({ registerNo: 1, eventName: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema, "registrations");
