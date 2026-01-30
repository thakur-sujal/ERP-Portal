const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, addMaterial, getCourseStudents } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getCourses).post(authorize('admin'), createCourse);
router.route('/:id').get(getCourse).put(authorize('admin'), updateCourse).delete(authorize('admin'), deleteCourse);
router.post('/:id/materials', authorize('admin', 'faculty'), addMaterial);
router.get('/:id/students', authorize('admin', 'faculty'), getCourseStudents);

module.exports = router;
