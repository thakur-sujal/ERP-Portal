const express = require('express');
const router = express.Router();
const { uploadGrades, getCourseGrades, getStudentGrades, updateGrade, deleteGrade } = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Admin and Faculty can upload/update/delete grades
router.post('/upload', authorize('admin', 'faculty'), uploadGrades);
router.get('/course/:courseId', authorize('admin', 'faculty'), getCourseGrades);
router.get('/student/:studentId', getStudentGrades);
router.put('/:id', authorize('admin', 'faculty'), updateGrade);
router.delete('/:id', authorize('admin'), deleteGrade);

module.exports = router;
