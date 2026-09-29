# College Event Registration System

Node.js/Express + MongoDB + Multer app: students view events, register,
and upload their student ID card as proof of identity. Admin can search,
filter, view uploaded ID cards, and delete registrations.

## Setup

1. Install dependencies:
   npm install

2. Make sure MongoDB is running locally on port 27017
   (or edit the connection string in server.js and seed.js).

3. Load sample events (Web Design Contest, Quiz Competition, Dance Competition):
   npm run seed

4. Start the server:
   npm start

5. Open in browser:
   - Home:           http://localhost:3000/index.html
   - Events list:    http://localhost:3000/events.html
   - Admin register: http://localhost:3000/admin.html

## Notes

- Uploaded ID cards are stored in the uploads/ folder and served at /uploads/<filename>.
- Only .jpg, .jpeg, .png and .pdf files are accepted, up to 2MB.
- A student cannot register twice for the same event (enforced by a unique
  index on registerNo + eventName in MongoDB, and checked on submit).
- Add more events either by inserting into the events collection directly,
  or by POSTing to /api/events with { eventName, eventType, eventDate, venue, maxParticipants }.

## Project structure

CollegeEventApp/
├── server.js
├── seed.js
├── package.json
├── models/
│   ├── Event.js
│   └── Registration.js
├── public/
│   ├── index.html
│   ├── events.html
│   ├── register.html
│   ├── admin.html
│   └── style.css
└── uploads/
