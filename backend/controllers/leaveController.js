const LeaveRequest = require('../models/LeaveRequest');

// Apply for leave (Student action)
exports.applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    const leave = await LeaveRequest.create({
      studentRef: req.user._id,
      fromDate,
      toDate,
      reason,
      status: 'Pending'
    });

    const populated = await LeaveRequest.findById(leave._id)
      .populate('studentRef', 'name rollNumber gradeClass email');

    res.status(201).json({ success: true, message: 'Leave request submitted', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leave requests (Teacher sees all; Student sees their own)
exports.getLeaveRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentRef = req.user._id;
    } else if (req.user.role === 'parent' && req.user.studentRef) {
      query.studentRef = req.user.studentRef;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('studentRef', 'name rollNumber gradeClass email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Review leave request (Teacher action: Approve / Reject)
exports.reviewLeave = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const { id } = req.params;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'" });
    }

    const leave = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        status,
        adminRemarks: adminRemarks || '',
        reviewedBy: req.user._id
      },
      { new: true }
    ).populate('studentRef', 'name rollNumber gradeClass email')
     .populate('reviewedBy', 'name');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.json({ success: true, message: `Leave request ${status}`, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

