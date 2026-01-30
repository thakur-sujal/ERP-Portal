const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Student = require('../models/Student');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
exports.getFaculty = async (req, res, next) => {
    try {
        const { department, designation, search, page = 1, limit = 10 } = req.query;

        let query = {};

        if (department) query.department = department;
        if (designation) query.designation = designation;

        const faculty = await Faculty.find(query)
            .populate('user', 'firstName lastName email phone avatar isActive')
            .populate('assignedCourses', 'courseCode courseName')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ employeeId: 1 });

        // Filter by search if provided
        let filteredFaculty = faculty;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredFaculty = faculty.filter(f =>
                f.user?.firstName?.toLowerCase().includes(searchLower) ||
                f.user?.lastName?.toLowerCase().includes(searchLower) ||
                f.employeeId?.toLowerCase().includes(searchLower)
            );
        }

        const total = await Faculty.countDocuments(query);

        res.status(200).json({
            success: true,
            count: filteredFaculty.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            faculty: filteredFaculty
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single faculty
// @route   GET /api/faculty/:id
// @access  Private
exports.getFacultyById = async (req, res, next) => {
    try {
        const faculty = await Faculty.findById(req.params.id)
            .populate('user', 'firstName lastName email phone avatar')
            .populate('assignedCourses');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        res.status(200).json({
            success: true,
            faculty
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get faculty by user ID
// @route   GET /api/faculty/user/:userId
// @access  Private
exports.getFacultyByUserId = async (req, res, next) => {
    try {
        const faculty = await Faculty.findOne({ user: req.params.userId })
            .populate('user', 'firstName lastName email phone avatar')
            .populate('assignedCourses');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        res.status(200).json({
            success: true,
            faculty
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private/Admin
exports.updateFaculty = async (req, res, next) => {
    try {
        let faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('user', 'firstName lastName email phone avatar');

        res.status(200).json({
            success: true,
            faculty
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get faculty's courses
// @route   GET /api/faculty/:id/courses
// @access  Private
exports.getFacultyCourses = async (req, res, next) => {
    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        const courses = await Course.find({ faculty: req.params.id });

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get students in faculty's courses
// @route   GET /api/faculty/:id/students
// @access  Private/Faculty
exports.getFacultyStudents = async (req, res, next) => {
    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Get all courses assigned to this faculty
        const courseIds = faculty.assignedCourses;

        // Find students enrolled in these courses
        const students = await Student.find({
            enrolledCourses: { $in: courseIds }
        })
            .populate('user', 'firstName lastName email avatar')
            .populate('enrolledCourses', 'courseCode courseName');

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign courses to faculty
// @route   POST /api/faculty/:id/assign-courses
// @access  Private/Admin
exports.assignCourses = async (req, res, next) => {
    try {
        const { courseIds } = req.body;

        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Update faculty's assigned courses
        faculty.assignedCourses = courseIds;
        await faculty.save();

        // Update courses to set this faculty
        await Course.updateMany(
            { _id: { $in: courseIds } },
            { faculty: faculty._id }
        );

        await faculty.populate('assignedCourses', 'courseCode courseName');

        res.status(200).json({
            success: true,
            faculty
        });
    } catch (error) {
        next(error);
    }
};
