const Exam = require('../models/Exam');
const Mark = require('../models/Mark');

// Get all exams / exam timetable
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('subjectRef', 'name code')
      .populate('createdBy', 'name')
      .sort({ examDate: 1 });
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Exam / add to exam timetable (Teacher action)
exports.createExam = async (req, res) => {
  try {
    const { title, examType, subjectRef, examDate, startTime, endTime, roomNumber, maxMarks } = req.body;

    const exam = await Exam.create({
      title,
      examType: examType || 'Internal 1',
      subjectRef,
      examDate,
      startTime: startTime || '10:00 AM',
      endTime: endTime || '01:00 PM',
      roomNumber: roomNumber || 'Hall A',
      maxMarks: maxMarks || 100,
      createdBy: req.user._id
    });

    const populated = await Exam.findById(exam._id).populate('subjectRef', 'name code');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload or update marks for a student (Teacher action)
exports.uploadMark = async (req, res) => {
  try {
    const { studentRef, examRef, subjectRef, marksObtained, maxMarks, grade, remarks } = req.body;

    const calculatedGrade = grade || (
      marksObtained >= 90 ? 'A+' :
      marksObtained >= 80 ? 'A' :
      marksObtained >= 70 ? 'B' :
      marksObtained >= 60 ? 'C' :
      marksObtained >= 50 ? 'D' : 'F'
    );

    const mark = await Mark.findOneAndUpdate(
      { studentRef, examRef },
      {
        studentRef,
        examRef,
        subjectRef,
        marksObtained: Number(marksObtained),
        maxMarks: Number(maxMarks) || 100,
        grade: calculatedGrade,
        remarks: remarks || '',
        uploadedBy: req.user._id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('studentRef', 'name rollNumber')
     .populate('examRef', 'title examType maxMarks')
     .populate('subjectRef', 'name code');

    res.status(200).json({ success: true, message: 'Marks uploaded successfully', data: mark });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all marks for an exam or subject (Teacher overview)
exports.getAllMarks = async (req, res) => {
  try {
    const { examRef, subjectRef } = req.query;
    let query = {};
    if (examRef) query.examRef = examRef;
    if (subjectRef) query.subjectRef = subjectRef;

    const marks = await Mark.find(query)
      .populate('studentRef', 'name rollNumber gradeClass')
      .populate('examRef', 'title examType maxMarks examDate')
      .populate('subjectRef', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get marks for a specific student (For Student or Parent)
exports.getStudentMarks = async (req, res) => {
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

    const marks = await Mark.find({ studentRef: studentId })
      .populate('examRef', 'title examType examDate maxMarks')
      .populate('subjectRef', 'name code')
      .sort({ createdAt: -1 });

    // Calculate overall stats
    const totalMax = marks.reduce((acc, m) => acc + (m.maxMarks || 100), 0);
    const totalObtained = marks.reduce((acc, m) => acc + m.marksObtained, 0);
    const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalExams: marks.length,
          totalObtained,
          totalMax,
          overallPercentage
        },
        marks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete exam
exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    await Mark.deleteMany({ examRef: req.params.id });
    res.json({ success: true, message: 'Exam and related marks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

