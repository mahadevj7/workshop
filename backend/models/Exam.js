const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  examType: {
    type: String,
    enum: ['Internal 1', 'Internal 2', 'Mid Term', 'Final Semester', 'Class Test'],
    default: 'Internal 1'
  },
  subjectRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    default: '10:00 AM'
  },
  endTime: {
    type: String,
    required: true,
    default: '01:00 PM'
  },
  roomNumber: {
    type: String,
    default: 'Hall A'
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);

