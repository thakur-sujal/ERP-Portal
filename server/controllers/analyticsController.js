const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

// @desc    Get dashboard overview stats
exports.getOverview = async (req, res, next) => {
    try {
        const [totalStudents, totalFaculty, totalCourses, totalUsers] = await Promise.all([
            Student.countDocuments(),
            Faculty.countDocuments(),
            Course.countDocuments({ isActive: true }),
            User.countDocuments()
        ]);

        const departmentStats = await Student.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            stats: { totalStudents, totalFaculty, totalCourses, totalUsers },
            departmentStats,
            recentUsers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get attendance analytics
exports.getAttendanceAnalytics = async (req, res, next) => {
    try {
        const { department } = req.query;

        const attendanceStats = await Attendance.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const monthlyAttendance = await Attendance.aggregate([
            { $group: { _id: { $month: '$date' }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } } } },
            { $sort: { '_id': 1 } }
        ]);

        res.status(200).json({ success: true, attendanceStats, monthlyAttendance });
    } catch (error) {
        next(error);
    }
};

// @desc    Get grade analytics
exports.getGradeAnalytics = async (req, res, next) => {
    try {
        const gradeDistribution = await Grade.aggregate([
            { $group: { _id: '$grade', count: { $sum: 1 } } },
            { $sort: { '_id': 1 } }
        ]);

        const avgByExamType = await Grade.aggregate([
            { $group: { _id: '$examType', avgMarks: { $avg: { $multiply: [{ $divide: ['$marks', '$maxMarks'] }, 100] } } } }
        ]);

        res.status(200).json({ success: true, gradeDistribution, avgByExamType });
    } catch (error) {
        next(error);
    }
};
