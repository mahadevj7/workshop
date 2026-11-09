const Timetable = require('../models/Timetable');

// Get weekly timetable (all or by day/grade)
exports.getTimetable = async (req, res) => {
  try {
    const { day, gradeClass } = req.query;
    let query = {};
    if (day) query.day = day;
    if (gradeClass) query.gradeClass = gradeClass;

    const timetable = await Timetable.find(query)
      .populate('subjectRef', 'name code')
      .populate('teacherRef', 'name email department')
      .sort({ day: 1, timeSlot: 1 });

    res.json({ success: true, count: timetable.length, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add or update timetable slot (Teacher action)
exports.addTimetableSlot = async (req, res) => {
  try {
    const { day, timeSlot, subjectRef, teacherRef, room, gradeClass } = req.body;

    const slot = await Timetable.create({
      day,
      timeSlot,
      subjectRef,
      teacherRef: teacherRef || req.user._id,
      room: room || 'Room 101',
      gradeClass: gradeClass || 'Class 10-A'
    });

    const populated = await Timetable.findById(slot._id)
      .populate('subjectRef', 'name code')
      .populate('teacherRef', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete timetable slot
exports.deleteTimetableSlot = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }
    res.json({ success: true, message: 'Timetable slot removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

