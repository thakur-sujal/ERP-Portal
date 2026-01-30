const Course = require('../models/Course');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res, next) => {
    try {
        const { department, semester, search, page = 1, limit = 20 } = req.query;

        let query = { isActive: true };

        if (department) query.department = department;
        if (semester) query.semester = parseInt(semester);
        if (search) {
            query.$or = [
                { courseCode: { $regex: search, $options: 'i' } },
                { courseName: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await Course.find(query)
            .populate({
                path: 'faculty',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ semester: 1, courseCode: 1 });

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            count: courses.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            courses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate({
                path: 'faculty',
                populate: { path: 'user', select: 'firstName lastName email' }
            });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Get enrolled students count
        const enrolledCount = await Student.countDocuments({
            enrolledCourses: course._id
        });

        res.status(200).json({
            success: true,
            course,
            enrolledCount
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res, next) => {
    try {
        const course = await Course.create(req.body);

        // If faculty is assigned, update their assignedCourses
        if (course.faculty) {
            await Faculty.findByIdAndUpdate(
                course.faculty,
                { $addToSet: { assignedCourses: course._id } }
            );
        }

        res.status(201).json({
            success: true,
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res, next) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const oldFacultyId = course.faculty?.toString();

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Update faculty assignments if changed
        if (req.body.faculty && req.body.faculty !== oldFacultyId) {
            // Remove from old faculty
            if (oldFacultyId) {
                await Faculty.findByIdAndUpdate(oldFacultyId, {
                    $pull: { assignedCourses: course._id }
                });
            }
            // Add to new faculty
            await Faculty.findByIdAndUpdate(req.body.faculty, {
                $addToSet: { assignedCourses: course._id }
            });
        }

        res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Remove from faculty's assigned courses
        if (course.faculty) {
            await Faculty.findByIdAndUpdate(course.faculty, {
                $pull: { assignedCourses: course._id }
            });
        }

        // Remove from students' enrolled courses
        await Student.updateMany(
            { enrolledCourses: course._id },
            { $pull: { enrolledCourses: course._id } }
        );

        await course.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add course material
// @route   POST /api/courses/:id/materials
// @access  Private/Faculty/Admin
exports.addMaterial = async (req, res, next) => {
    try {
        const { title, description, fileUrl } = req.body;

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        course.materials.push({
            title,
            description,
            fileUrl,
            uploadedAt: new Date()
        });

        await course.save();

        res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private/Faculty/Admin
exports.getCourseStudents = async (req, res, next) => {
    try {
        const students = await Student.find({
            enrolledCourses: req.params.id
        })
            .populate('user', 'firstName lastName email avatar')
            .sort({ rollNumber: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        next(error);
    }
};
