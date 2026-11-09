const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaveRequests,
  reviewLeave
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getLeaveRequests);
router.post('/apply', authorize('student'), applyLeave);
router.put('/:id/review', authorize('teacher'), reviewLeave);

module.exports = router;

