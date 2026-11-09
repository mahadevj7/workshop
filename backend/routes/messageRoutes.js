const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  replyMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/send', sendMessage);
router.get('/', getMessages);
router.put('/:id/reply', authorize('teacher'), replyMessage);

module.exports = router;

