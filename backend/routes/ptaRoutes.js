const express = require('express');
const router = express.Router();
const {
  getPTAMeetings,
  createPTAMeeting,
  deletePTAMeeting
} = require('../controllers/ptaController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getPTAMeetings);
router.post('/', authorize('teacher'), createPTAMeeting);
router.delete('/:id', authorize('teacher'), deletePTAMeeting);

module.exports = router;

