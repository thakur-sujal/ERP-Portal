const express = require('express');
const router = express.Router();
const { getOverview, getAttendanceAnalytics, getGradeAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getOverview);
router.get('/attendance', getAttendanceAnalytics);
router.get('/grades', getGradeAnalytics);

module.exports = router;
