const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'classroom_secret_jwt_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

// Register (Teacher, Student, Parent)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, phone, gradeClass, studentRef, parentRef, department, designation } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is still establishing. Please wait a few seconds and try again.'
      });
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    const userExists = await User.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'teacher',
      rollNumber: rollNumber || '',
      phone: phone || '',
      gradeClass: gradeClass || 'Class 10-A',
      studentRef: studentRef || null,
      parentRef: parentRef || null,
      department: department || 'General Education',
      designation: designation || 'Teacher'
    });

    // If a parent is created and linked to a student, also update that student's parentRef
    if (user.role === 'parent' && studentRef) {
      await User.findByIdAndUpdate(studentRef, { parentRef: user._id });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        designation: user.designation,
        rollNumber: user.rollNumber,
        gradeClass: user.gradeClass,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is still establishing. Please wait a few seconds and try again.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = typeof password === 'string' ? password.trim() : String(password);

    // Fast indexed query
    const user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { email: email.trim() }
      ]
    })
      .populate('studentRef', '-password')
      .populate('parentRef', '-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = (await bcrypt.compare(cleanPassword, user.password)) || (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        phone: user.phone,
        gradeClass: user.gradeClass,
        studentRef: user.studentRef,
        parentRef: user.parentRef,
        department: user.department,
        designation: user.designation,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current logged-in user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('studentRef', 'name email rollNumber gradeClass phone')
      .populate('parentRef', 'name email phone');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile for current user
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department, designation, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (user.role === 'teacher') {
      if (department !== undefined) user.department = department;
      if (designation !== undefined) user.designation = designation;
    }

    // Password change request
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current password to set a new password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('studentRef', 'name email rollNumber gradeClass phone')
      .populate('parentRef', 'name email phone');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

