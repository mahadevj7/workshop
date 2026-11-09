const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// Get all assignments (For Teachers & Students)
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('subjectRef', 'name code')
      .populate('teacherRef', 'name email')
      .sort({ dueDate: 1 });

    // If student, attach submission status
    if (req.user.role === 'student') {
      const submissions = await Submission.find({ studentRef: req.user._id });
      const submissionMap = {};
      submissions.forEach(s => {
        submissionMap[s.assignmentRef.toString()] = s;
      });

      const enriched = assignments.map(a => {
        const doc = a.toObject();
        doc.submission = submissionMap[a._id.toString()] || null;
        return doc;
      });

      return res.json({ success: true, count: enriched.length, data: enriched });
    }

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Assignment (Teacher action)
exports.createAssignment = async (req, res) => {
  try {
    const { title, subjectRef, description, dueDate, maxMarks, gradeClass } = req.body;

    const assignment = await Assignment.create({
      title,
      subjectRef,
      teacherRef: req.user._id,
      description,
      dueDate,
      maxMarks: maxMarks || 100,
      gradeClass: gradeClass || 'Class 10-A'
    });

    const populated = await Assignment.findById(assignment._id)
      .populate('subjectRef', 'name code')
      .populate('teacherRef', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Assignment (Student action)
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content, fileAttachment } = req.body;

    let submission = await Submission.findOne({
      assignmentRef: assignmentId,
      studentRef: req.user._id
    });

    if (submission) {
      submission.content = content;
      submission.fileAttachment = fileAttachment || submission.fileAttachment;
      submission.submittedAt = new Date();
      submission.status = 'Resubmitted';
      await submission.save();
    } else {
      submission = await Submission.create({
        assignmentRef: assignmentId,
        studentRef: req.user._id,
        content,
        fileAttachment: fileAttachment || '',
        status: 'Submitted'
      });
    }

    res.status(200).json({ success: true, message: 'Assignment submitted successfully', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View submissions for an assignment (Teacher action)
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignmentRef: assignmentId })
      .populate('studentRef', 'name email rollNumber gradeClass')
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Grade/Mark a submission (Teacher action)
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marksObtained, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        marksObtained: Number(marksObtained),
        feedback,
        status: 'Graded',
        gradedBy: req.user._id
      },
      { new: true }
    ).populate('studentRef', 'name rollNumber');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, message: 'Submission graded successfully', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete assignment (Teacher action)
exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ assignmentRef: req.params.id });
    res.json({ success: true, message: 'Assignment and related submissions deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

