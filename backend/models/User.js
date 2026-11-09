const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'parent'],
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  // Specific to students
  rollNumber: {
    type: String,
    default: ''
  },
  gradeClass: {
    type: String,
    default: 'Class 10-A'
  },
  // For student: reference to their parent; for parent: reference to their child(ren)
  parentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Specific to teachers
  department: {
    type: String,
    default: 'General'
  },
  designation: {
    type: String,
    default: 'Teacher'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

