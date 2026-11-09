const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.post('/', authorize('teacher'), createNotification);
router.delete('/:id', authorize('teacher'), deleteNotification);

module.exports = router;

