const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  teacherRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradeClass: {
    type: String,
    default: 'Class 10-A'
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);

