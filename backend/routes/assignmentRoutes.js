const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  submitAssignment,
  getSubmissionsByAssignment,
  gradeSubmission,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAssignments);
router.post('/', authorize('teacher'), createAssignment);
router.delete('/:id', authorize('teacher'), deleteAssignment);

router.post('/:assignmentId/submit', authorize('student'), submitAssignment);
router.get('/:assignmentId/submissions', authorize('teacher'), getSubmissionsByAssignment);
router.put('/submissions/:submissionId/grade', authorize('teacher'), gradeSubmission);

module.exports = router;

