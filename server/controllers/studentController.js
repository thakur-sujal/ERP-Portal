const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin/Faculty
exports.getStudents = async (req, res, next) => {
    try {
        const { department, semester, batch, search, page = 1, limit = 10 } = req.query;

        let query = {};

        if (department) query.department = department;
        if (semester) query.semester = parseInt(semester);
        if (batch) query.batch = batch;

        const students = await Student.find(query)
            .populate('user', 'firstName lastName email phone avatar isActive')
            .populate('enrolledCourses', 'courseCode courseName')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ rollNumber: 1 });

        // Filter by search if provided
        let filteredStudents = students;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredStudents = students.filter(s =>
                s.user?.firstName?.toLowerCase().includes(searchLower) ||
                s.user?.lastName?.toLowerCase().includes(searchLower) ||
                s.rollNumber?.toLowerCase().includes(searchLower)
            );
        }

        const total = await Student.countDocuments(query);

        res.status(200).json({
            success: true,
            count: filteredStudents.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            students: filteredStudents
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('user', 'firstName lastName email phone avatar')
            .populate('enrolledCourses');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get student by user ID
// @route   GET /api/students/user/:userId
// @access  Private
exports.getStudentByUserId = async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.params.userId })
            .populate('user', 'firstName lastName email phone avatar')
            .populate('enrolledCourses');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res, next) => {
    try {
        let student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check authorization
        if (req.user.role === 'student' && student.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this student' });
        }

        student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('user', 'firstName lastName email phone avatar');

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get student attendance
// @route   GET /api/students/:id/attendance
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
    try {
        const { courseId, startDate, endDate } = req.query;

        let query = { student: req.params.id };

        if (courseId) query.course = courseId;
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate('course', 'courseCode courseName')
            .populate('markedBy', 'user')
            .sort({ date: -1 });

        // Calculate attendance summary
        const summary = {};
        attendance.forEach(record => {
            const courseId = record.course._id.toString();
            if (!summary[courseId]) {
                summary[courseId] = {
                    course: record.course,
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0
                };
            }
            summary[courseId].total++;
            summary[courseId][record.status]++;
        });

        // Calculate percentages
        const attendanceSummary = Object.values(summary).map(s => ({
            ...s,
            percentage: ((s.present + s.late) / s.total * 100).toFixed(2)
        }));

        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance,
            summary: attendanceSummary
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get student grades
// @route   GET /api/students/:id/grades
// @access  Private
exports.getStudentGrades = async (req, res, next) => {
    try {
        const { semester, academicYear } = req.query;

        let query = { student: req.params.id };

        if (semester) query.semester = parseInt(semester);
        if (academicYear) query.academicYear = academicYear;

        const grades = await Grade.find(query)
            .populate('course', 'courseCode courseName credits')
            .sort({ semester: -1, examType: 1 });

        // Calculate GPA if semester is specified
        let gpa = null;
        if (semester) {
            gpa = await Grade.calculateGPA(req.params.id, parseInt(semester));
        }

        res.status(200).json({
            success: true,
            count: grades.length,
            grades,
            gpa
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Enroll student in courses
// @route   POST /api/students/:id/enroll
// @access  Private/Admin
exports.enrollCourses = async (req, res, next) => {
    try {
        const { courseIds } = req.body;

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Add courses that aren't already enrolled
        const newCourses = courseIds.filter(id => !student.enrolledCourses.includes(id));
        student.enrolledCourses.push(...newCourses);
        await student.save();

        await student.populate('enrolledCourses', 'courseCode courseName');

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        next(error);
    }
};
