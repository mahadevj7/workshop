const mongoose = require('mongoose');

const remarkSchema = new mongoose.Schema({
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Behavioral', 'Achievement', 'Attendance', 'General'],
    default: 'General'
  },
  type: {
    type: String,
    enum: ['Positive', 'Needs Improvement', 'Neutral'],
    default: 'Positive'
  },
  remarkText: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Remark', remarkSchema);

