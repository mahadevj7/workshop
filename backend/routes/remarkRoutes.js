const express = require('express');
const router = express.Router();
const {
  addRemark,
  getStudentRemarks,
  getAllRemarks,
  deleteRemark
} = require('../controllers/remarkController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/all', authorize('teacher'), getAllRemarks);
router.get('/my-remarks', getStudentRemarks);
router.get('/student/:studentId', getStudentRemarks);
router.post('/', authorize('teacher'), addRemark);
router.delete('/:id', authorize('teacher'), deleteRemark);

module.exports = router;

