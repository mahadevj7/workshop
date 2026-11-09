const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('parentRef', 'name email phone')
      .sort({ rollNumber: 1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new student (Teacher action)
exports.addStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, phone, gradeClass, parentRef } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'student123', salt);

    const student = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      rollNumber,
      phone,
      gradeClass: gradeClass || 'Class 10-A',
      parentRef: parentRef || null
    });

    if (parentRef) {
      await User.findByIdAndUpdate(parentRef, { studentRef: student._id });
    }

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all parents
exports.getParents = async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' })
      .select('-password')
      .populate('studentRef', 'name rollNumber gradeClass')
      .sort({ name: 1 });
    res.json({ success: true, count: parents.length, data: parents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add parent & link with student (Teacher action)
exports.addParent = async (req, res) => {
  try {
    const { name, email, password, phone, studentRef } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'parent123', salt);

    const parent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'parent',
      phone,
      studentRef: studentRef || null
    });

    if (studentRef) {
      await User.findByIdAndUpdate(studentRef, { parentRef: parent._id });
    }

    res.status(201).json({ success: true, data: parent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Link parent and student
exports.linkParentStudent = async (req, res) => {
  try {
    const { parentId, studentId } = req.body;

    await User.findByIdAndUpdate(parentId, { studentRef: studentId });
    await User.findByIdAndUpdate(studentId, { parentRef: parentId });

    res.json({ success: true, message: 'Parent and Student linked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new teacher (Teacher action)
exports.addTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, department, designation } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'teacher123', salt);

    const teacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      phone: phone || '',
      department: department || 'General Education',
      designation: designation || 'Teacher'
    });

    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all teachers (for assigning to subjects)
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ name: 1 });
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user (student/parent)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

