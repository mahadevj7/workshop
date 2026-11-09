const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceOverview,
  getStudentAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/mark', authorize('teacher'), markAttendance);
router.get('/overview', authorize('teacher'), getAttendanceOverview);
router.get('/my-attendance', getStudentAttendance);
router.get('/student/:studentId', getStudentAttendance);

module.exports = router;

