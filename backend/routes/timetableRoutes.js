const express = require('express');
const router = express.Router();
const {
  getTimetable,
  addTimetableSlot,
  deleteTimetableSlot
} = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getTimetable);
router.post('/', authorize('teacher'), addTimetableSlot);
router.delete('/:id', authorize('teacher'), deleteTimetableSlot);

module.exports = router;

