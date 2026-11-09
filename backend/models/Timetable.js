const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    trim: true // e.g. "09:00 AM - 10:00 AM"
  },
  subjectRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacherRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  room: {
    type: String,
    default: 'Room 101'
  },
  gradeClass: {
    type: String,
    default: 'Class 10-A'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);

