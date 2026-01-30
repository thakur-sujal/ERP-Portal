const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

// @desc    Mark attendance for a class
// @route   POST /api/attendance/mark
// @access  Private/Faculty
exports.markAttendance = async (req, res, next) => {
    try {
        const { courseId, date, attendanceData } = req.body;
        // attendanceData: [{ studentId, status, remarks }]

        // Verify faculty is assigned to this course
        const faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) {
            return res.status(403).json({ message: 'Faculty profile not found' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if faculty is assigned to this course
        if (course.faculty?.toString() !== faculty._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to mark attendance for this course' });
        }

        const attendanceDate = new Date(date);
        const results = [];

        for (const record of attendanceData) {
            try {
                // Check if attendance already exists for this student-course-date
                const existing = await Attendance.findOne({
                    student: record.studentId,
                    course: courseId,
                    date: attendanceDate
                });

                if (existing) {
                    // Update existing record
                    existing.status = record.status;
                    existing.remarks = record.remarks;
                    await existing.save();
                    results.push({ studentId: record.studentId, action: 'updated' });
                } else {
                    // Create new record
                    await Attendance.create({
                        student: record.studentId,
                        course: courseId,
                        date: attendanceDate,
                        status: record.status,
                        markedBy: faculty._id,
                        remarks: record.remarks
                    });
                    results.push({ studentId: record.studentId, action: 'created' });
                }
            } catch (err) {
                results.push({ studentId: record.studentId, action: 'error', error: err.message });
            }
        }

        // Update total classes for course
        const totalClasses = await Attendance.distinct('date', { course: courseId });
        course.totalClasses = totalClasses.length;
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Attendance marked successfully',
            results
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get attendance by course and date
// @route   GET /api/attendance/course/:courseId
// @access  Private/Faculty/Admin
exports.getCourseAttendance = async (req, res, next) => {
    try {
        const { date, startDate, endDate } = req.query;

        let query = { course: req.params.courseId };

        if (date) {
            query.date = new Date(date);
        } else if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .sort({ date: -1 });

        // Group by date
        const groupedByDate = {};
        attendance.forEach(record => {
            const dateKey = record.date.toISOString().split('T')[0];
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = [];
            }
            groupedByDate[dateKey].push(record);
        });

        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance,
            groupedByDate
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get student's attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
    try {
        const { courseId } = req.query;

        let query = { student: req.params.studentId };
        if (courseId) query.course = courseId;

        const attendance = await Attendance.find(query)
            .populate('course', 'courseCode courseName')
            .sort({ date: -1 });

        // Calculate stats per course
        const stats = {};
        attendance.forEach(record => {
            const courseId = record.course._id.toString();
            if (!stats[courseId]) {
                stats[courseId] = {
                    course: record.course,
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0
                };
            }
            stats[courseId].total++;
            stats[courseId][record.status]++;
        });

        const courseSummary = Object.values(stats).map(s => ({
            ...s,
            percentage: s.total > 0 ? ((s.present + s.late) / s.total * 100).toFixed(2) : 0
        }));

        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance,
            courseSummary
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Faculty
exports.updateAttendance = async (req, res, next) => {
    try {
        const { status, remarks } = req.body;

        let attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        attendance.status = status;
        if (remarks !== undefined) attendance.remarks = remarks;
        await attendance.save();

        res.status(200).json({
            success: true,
            attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get attendance summary for a course
// @route   GET /api/attendance/summary/:courseId
// @access  Private/Faculty/Admin
exports.getAttendanceSummary = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;

        // Get all students enrolled in the course
        const students = await Student.find({ enrolledCourses: courseId })
            .populate('user', 'firstName lastName');

        // Get all attendance records for the course
        const attendanceRecords = await Attendance.find({ course: courseId });

        // Calculate summary for each student
        const summary = students.map(student => {
            const studentRecords = attendanceRecords.filter(
                r => r.student.toString() === student._id.toString()
            );

            const total = studentRecords.length;
            const present = studentRecords.filter(r => r.status === 'present').length;
            const late = studentRecords.filter(r => r.status === 'late').length;
            const absent = studentRecords.filter(r => r.status === 'absent').length;

            return {
                student: {
                    _id: student._id,
                    rollNumber: student.rollNumber,
                    name: `${student.user.firstName} ${student.user.lastName}`
                },
                total,
                present,
                late,
                absent,
                percentage: total > 0 ? ((present + late) / total * 100).toFixed(2) : 0
            };
        });

        // Get unique dates
        const dates = [...new Set(attendanceRecords.map(r => r.date.toISOString().split('T')[0]))];

        res.status(200).json({
            success: true,
            totalClasses: dates.length,
            totalStudents: students.length,
            summary,
            dates: dates.sort()
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
exports.deleteAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        await attendance.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Attendance record deleted'
        });
    } catch (error) {
        next(error);
    }
};
