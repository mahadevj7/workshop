const Message = require('../models/Message');

// Send a message to a teacher (Student or Parent action)
exports.sendMessage = async (req, res) => {
  try {
    const { recipientRef, subject, message } = req.body;

    const newMsg = await Message.create({
      senderRef: req.user._id,
      recipientRef,
      studentRef: req.user.role === 'student' ? req.user._id : (req.user.studentRef || null),
      subject,
      message,
      status: 'Pending'
    });

    const populated = await Message.findById(newMsg._id)
      .populate('senderRef', 'name email role')
      .populate('recipientRef', 'name email');

    res.status(201).json({ success: true, message: 'Message sent to teacher successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for current user
// Teachers see incoming messages addressed to them
// Students and Parents see messages they sent
exports.getMessages = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'teacher') {
      query.recipientRef = req.user._id;
    } else {
      query.senderRef = req.user._id;
    }

    const messages = await Message.find(query)
      .populate('senderRef', 'name email role rollNumber')
      .populate('recipientRef', 'name email department')
      .populate('studentRef', 'name rollNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reply to a message (Teacher action)
exports.replyMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const message = await Message.findByIdAndUpdate(
      id,
      {
        reply,
        repliedAt: new Date(),
        status: 'Replied'
      },
      { new: true }
    ).populate('senderRef', 'name email')
     .populate('recipientRef', 'name');

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: 'Reply sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

