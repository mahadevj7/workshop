const mongoose = require('mongoose');

const ptaMeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  meetingDate: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    default: '10:00 AM'
  },
  venue: {
    type: String,
    default: 'School Auditorium / Online Google Meet'
  },
  agenda: {
    type: String,
    required: true
  },
  minutesOfMeeting: {
    type: String,
    default: ''
  },
  gradeClass: {
    type: String,
    default: 'All Classes'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PTAMeeting', ptaMeetingSchema);

