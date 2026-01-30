const express = require('express');
const router = express.Router();
const { getStudents, getStudent, getStudentByUserId, updateStudent, getStudentAttendance, getStudentGrades, enrollCourses } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'faculty'), getStudents);
router.get('/:id', getStudent);
router.get('/user/:userId', getStudentByUserId);
router.put('/:id', updateStudent);
router.get('/:id/attendance', getStudentAttendance);
router.get('/:id/grades', getStudentGrades);
router.post('/:id/enroll', authorize('admin'), enrollCourses);

module.exports = router;
