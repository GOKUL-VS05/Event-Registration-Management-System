const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Event = require("./models/Event");
const Registration = require("./models/Registration");

const app = express();
const PORT = 3000;

// ---- Database ----
mongoose.connect("mongodb://127.0.0.1:27017/collegeEventDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ---- Ensure uploads folder exists ----
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// ---- Multer setup: storage, file type validation, size limit ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const regNo = (req.body.registerNo || "unknown").replace(/[^a-zA-Z0-9]/g, "");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${regNo}_idcard${ext}`);
  }
});

const allowedTypes = [".jpg", ".jpeg", ".png", ".pdf"];

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, .png and .pdf files are allowed"));
    }
  }
});

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOAD_DIR));

// ---- Events ----

// List all events, with live registration counts
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    const withCounts = await Promise.all(
      events.map(async (ev) => {
        const count = await Registration.countDocuments({ eventName: ev.eventName });
        return { ...ev.toObject(), registeredCount: count };
      })
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Add a new event
app.post("/api/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.json({ message: "Event added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add event" });
  }
});

// ---- Registration ----

// Register for an event, with ID card upload
app.post("/register", (req, res) => {
  upload.single("idCard")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Student ID card is required" });
    }

    try {
      const { studentName, registerNo, email, department, year, eventName, eventType } = req.body;

      const registration = new Registration({
        studentName,
        registerNo,
        email,
        department,
        year,
        eventName,
        eventType,
        idCard: `uploads/${req.file.filename}`
      });

      await registration.save();
      res.json({ message: "Registration successful" });
    } catch (err) {
      // Duplicate key error = already registered for this event
      if (err.code === 11000) {
        fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
        return res.status(400).json({ error: "You have already registered for this event" });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });
});

// List registrations, with optional search/filter
app.get("/api/registrations", async (req, res) => {
  try {
    const { registerNo, eventName } = req.query;
    const query = {};
    if (registerNo) query.registerNo = registerNo;
    if (eventName) query.eventName = eventName;

    const registrations = await Registration.find(query).sort({ registeredAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Delete a registration (and its uploaded ID card)
app.delete("/api/registrations/:id", async (req, res) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (reg) {
      const filePath = path.join(__dirname, reg.idCard);
      fs.unlink(filePath, () => {}); // ignore error if already missing
    }
    res.json({ message: "Registration deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete registration" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
