const express = require('express');
const router = express.Router();
const {
  getStudents,
  addStudent,
  getParents,
  addParent,
  linkParentStudent,
  getTeachers,
  addTeacher,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Routes
router.get('/students', getStudents);
router.post('/students', authorize('teacher'), addStudent);

router.get('/parents', getParents);
router.post('/parents', authorize('teacher'), addParent);

router.post('/link-parent-student', authorize('teacher'), linkParentStudent);

router.get('/teachers', getTeachers);
router.post('/teachers', authorize('teacher'), addTeacher);
router.delete('/:id', authorize('teacher'), deleteUser);

module.exports = router;

