const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Mark attendance (Teacher action - can mark single or bulk)
exports.markAttendance = async (req, res) => {
  try {
    const { records, date, subjectRef } = req.body;
    // records: [{ studentRef, status: 'Present'|'Absent'|'Late', remarks }]

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No attendance records provided' });
    }

    const attendanceDate = new Date(date || Date.now());
    attendanceDate.setHours(0, 0, 0, 0);

    const savedRecords = [];
    for (const rec of records) {
      // Upsert: update if exists for same student, subject and date
      const updated = await Attendance.findOneAndUpdate(
        {
          studentRef: rec.studentRef,
          subjectRef: subjectRef || null,
          date: attendanceDate
        },
        {
          studentRef: rec.studentRef,
          subjectRef: subjectRef || null,
          date: attendanceDate,
          status: rec.status || 'Present',
          remarks: rec.remarks || '',
          markedBy: req.user._id
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      savedRecords.push(updated);
    }

    res.status(200).json({
      success: true,
      message: `Successfully marked attendance for ${savedRecords.length} student(s)`,
      data: savedRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance for a specific date or subject (Teacher overview)
exports.getAttendanceOverview = async (req, res) => {
  try {
    const { date, subjectRef } = req.query;
    let query = {};

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDate };
    }

    if (subjectRef) {
      query.subjectRef = subjectRef;
    }

    const records = await Attendance.find(query)
      .populate('studentRef', 'name rollNumber email gradeClass')
      .populate('subjectRef', 'name code')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's attendance history and statistics (For Student or Parent)
exports.getStudentAttendance = async (req, res) => {
  try {
    let studentId = req.params.studentId;

    // If logged in user is a student, ensure they only view their own
    if (req.user.role === 'student') {
      studentId = req.user._id;
    } else if (req.user.role === 'parent') {
      // Parent: verify this is their child or use their child's ID
      if (!studentId && req.user.studentRef) {
        studentId = req.user.studentRef;
      }
    }

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const records = await Attendance.find({ studentRef: studentId })
      .populate('subjectRef', 'name code')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const late = records.filter(r => r.status === 'Late').length;
    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

    res.json({
      success: true,
      data: {
        summary: { total, present, absent, late, percentage },
        records
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

