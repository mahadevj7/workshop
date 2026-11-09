const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  reply: {
    type: String,
    default: ''
  },
  repliedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Replied'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);

