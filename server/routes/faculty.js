const express = require('express');
const router = express.Router();
const { getFaculty, getFacultyById, getFacultyByUserId, updateFaculty, getFacultyCourses, getFacultyStudents, assignCourses } = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin'), getFaculty);
router.get('/:id', getFacultyById);
router.get('/user/:userId', getFacultyByUserId);
router.put('/:id', authorize('admin'), updateFaculty);
router.get('/:id/courses', getFacultyCourses);
router.get('/:id/students', authorize('admin', 'faculty'), getFacultyStudents);
router.post('/:id/assign-courses', authorize('admin'), assignCourses);

module.exports = router;
