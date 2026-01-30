const express = require('express');
const router = express.Router();
const { getTimetable, createTimetable, updateTimetable, deleteTimetable } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTimetable).post(authorize('admin'), createTimetable);
router.route('/:id').put(authorize('admin'), updateTimetable).delete(authorize('admin'), deleteTimetable);

module.exports = router;
