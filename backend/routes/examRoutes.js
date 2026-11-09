const express = require('express');
const router = express.Router();
const {
  getExams,
  createExam,
  uploadMark,
  getAllMarks,
  getStudentMarks,
  deleteExam
} = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getExams);
router.post('/', authorize('teacher'), createExam);
router.delete('/:id', authorize('teacher'), deleteExam);

router.post('/marks/upload', authorize('teacher'), uploadMark);
router.get('/marks/all', authorize('teacher'), getAllMarks);
router.get('/marks/my-marks', getStudentMarks);
router.get('/marks/student/:studentId', getStudentMarks);

module.exports = router;

