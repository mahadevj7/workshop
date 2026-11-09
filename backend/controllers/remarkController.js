const Remark = require('../models/Remark');

// Add Remark on a student (Teacher action)
exports.addRemark = async (req, res) => {
  try {
    const { studentRef, category, type, remarkText } = req.body;

    const remark = await Remark.create({
      studentRef,
      teacherRef: req.user._id,
      category: category || 'General',
      type: type || 'Positive',
      remarkText
    });

    const populated = await Remark.findById(remark._id)
      .populate('studentRef', 'name rollNumber gradeClass')
      .populate('teacherRef', 'name department');

    res.status(201).json({ success: true, message: 'Remark added successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get remarks for a student (Parents, Students, Teachers)
exports.getStudentRemarks = async (req, res) => {
  try {
    let studentId = req.params.studentId;

    if (req.user.role === 'student') {
      studentId = req.user._id;
    } else if (req.user.role === 'parent' && !studentId) {
      studentId = req.user.studentRef;
    }

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const remarks = await Remark.find({ studentRef: studentId })
      .populate('teacherRef', 'name department email')
      .populate('studentRef', 'name rollNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: remarks.length, data: remarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all remarks (Teacher overview)
exports.getAllRemarks = async (req, res) => {
  try {
    const remarks = await Remark.find()
      .populate('studentRef', 'name rollNumber gradeClass')
      .populate('teacherRef', 'name department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: remarks.length, data: remarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a remark (Teacher action)
exports.deleteRemark = async (req, res) => {
  try {
    const remark = await Remark.findByIdAndDelete(req.params.id);
    if (!remark) {
      return res.status(404).json({ success: false, message: 'Remark not found' });
    }
    res.json({ success: true, message: 'Remark deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

