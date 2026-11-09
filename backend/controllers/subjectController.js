const Subject = require('../models/Subject');

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('teacherRef', 'name email department')
      .sort({ name: 1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new subject (Teacher action)
exports.createSubject = async (req, res) => {
  try {
    const { name, code, teacherRef, gradeClass, description } = req.body;

    const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
    if (existingSubject) {
      return res.status(400).json({ success: false, message: 'Subject with this code already exists' });
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      teacherRef: teacherRef || req.user._id,
      gradeClass: gradeClass || 'Class 10-A',
      description: description || ''
    });

    const populated = await Subject.findById(subject._id).populate('teacherRef', 'name email department');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign/Reassign teacher to a subject (Teacher action)
exports.assignTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const { id } = req.params;

    const subject = await Subject.findByIdAndUpdate(
      id,
      { teacherRef: teacherId },
      { new: true }
    ).populate('teacherRef', 'name email department');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({ success: true, message: 'Teacher assigned successfully', data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

