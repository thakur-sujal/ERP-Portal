const express = require('express');
const router = express.Router();
const { markAttendance, getCourseAttendance, getStudentAttendance, updateAttendance, getAttendanceSummary, deleteAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Admin and Faculty can mark/update attendance
router.post('/mark', authorize('admin', 'faculty'), markAttendance);
router.get('/course/:courseId', authorize('admin', 'faculty'), getCourseAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/summary/:courseId', authorize('admin', 'faculty'), getAttendanceSummary);
router.put('/:id', authorize('admin', 'faculty'), updateAttendance);
router.delete('/:id', authorize('admin'), deleteAttendance);

module.exports = router;
