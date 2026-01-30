const Timetable = require('../models/Timetable');

// @desc    Get timetable
exports.getTimetable = async (req, res, next) => {
    try {
        const { department, semester, dayOfWeek } = req.query;
        let query = { isActive: true };
        if (department) query.department = department;
        if (semester) query.semester = parseInt(semester);
        if (dayOfWeek) query.dayOfWeek = dayOfWeek;

        const timetable = await Timetable.find(query)
            .populate('course', 'courseCode courseName')
            .populate({ path: 'faculty', populate: { path: 'user', select: 'firstName lastName' } })
            .sort({ dayOfWeek: 1, startTime: 1 });

        const grouped = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        days.forEach(day => grouped[day] = []);
        timetable.forEach(t => grouped[t.dayOfWeek].push(t));

        res.status(200).json({ success: true, timetable, grouped });
    } catch (error) {
        next(error);
    }
};

// @desc    Create timetable entry
exports.createTimetable = async (req, res, next) => {
    try {
        const entry = await Timetable.create(req.body);
        res.status(201).json({ success: true, entry });
    } catch (error) {
        next(error);
    }
};

// @desc    Update timetable entry
exports.updateTimetable = async (req, res, next) => {
    try {
        const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json({ success: true, entry });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete timetable entry
exports.deleteTimetable = async (req, res, next) => {
    try {
        const entry = await Timetable.findByIdAndDelete(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        next(error);
    }
};
