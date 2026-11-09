const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  subjectRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  grade: {
    type: String,
    default: 'A'
  },
  remarks: {
    type: String,
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mark', markSchema);

