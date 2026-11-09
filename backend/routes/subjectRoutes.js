const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  assignTeacher,
  deleteSubject
} = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getSubjects);
router.post('/', authorize('teacher'), createSubject);
router.put('/:id/assign', authorize('teacher'), assignTeacher);
router.delete('/:id', authorize('teacher'), deleteSubject);

module.exports = router;

