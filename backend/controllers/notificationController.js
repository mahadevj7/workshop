const Notification = require('../models/Notification');

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    let query = {};
    const role = req.user.role;

    if (role === 'student') {
      query.targetAudience = { $in: ['all', 'students'] };
    } else if (role === 'parent') {
      query.targetAudience = { $in: ['all', 'parents'] };
    }
    // Teachers see all

    const notifications = await Notification.find(query)
      .populate('authorRef', 'name email department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create notification (Teacher action)
exports.createNotification = async (req, res) => {
  try {
    const { title, content, targetAudience, priority } = req.body;

    const notification = await Notification.create({
      title,
      content,
      targetAudience: targetAudience || 'all',
      priority: priority || 'normal',
      authorRef: req.user._id
    });

    const populated = await Notification.findById(notification._id)
      .populate('authorRef', 'name email department');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete notification (Teacher action)
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

