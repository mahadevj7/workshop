const PTAMeeting = require('../models/PTAMeeting');

// Get PTA meetings
exports.getPTAMeetings = async (req, res) => {
  try {
    const meetings = await PTAMeeting.find()
      .populate('createdBy', 'name email')
      .sort({ meetingDate: 1 });

    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Schedule PTA Meeting (Teacher action)
exports.createPTAMeeting = async (req, res) => {
  try {
    const { title, meetingDate, time, venue, agenda, minutesOfMeeting, gradeClass } = req.body;

    const meeting = await PTAMeeting.create({
      title,
      meetingDate,
      time: time || '10:00 AM',
      venue: venue || 'Auditorium / Online',
      agenda,
      minutesOfMeeting: minutesOfMeeting || '',
      gradeClass: gradeClass || 'All Classes',
      createdBy: req.user._id
    });

    const populated = await PTAMeeting.findById(meeting._id).populate('createdBy', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete PTA Meeting
exports.deletePTAMeeting = async (req, res) => {
  try {
    const meeting = await PTAMeeting.findByIdAndDelete(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'PTA Meeting not found' });
    }
    res.json({ success: true, message: 'PTA Meeting entry removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

