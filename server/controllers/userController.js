const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profile = null;
        if (user.role === 'student') {
            profile = await Student.findOne({ user: user._id }).populate('enrolledCourses');
        } else if (user.role === 'faculty') {
            profile = await Faculty.findOne({ user: user._id }).populate('assignedCourses');
        }

        res.status(200).json({
            success: true,
            user,
            profile
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, role, phone, ...profileData } = req.body;

        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            role,
            phone
        });

        // Create role-specific profile
        if (role === 'student') {
            await Student.create({
                user: user._id,
                rollNumber: profileData.rollNumber,
                department: profileData.department,
                semester: profileData.semester || 1,
                batch: profileData.batch
            });
        } else if (role === 'faculty') {
            await Faculty.create({
                user: user._id,
                employeeId: profileData.employeeId,
                department: profileData.department,
                designation: profileData.designation || 'Lecturer'
            });
        }

        res.status(201).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete associated profile
        if (user.role === 'student') {
            await Student.findOneAndDelete({ user: user._id });
        } else if (user.role === 'faculty') {
            await Faculty.findOneAndDelete({ user: user._id });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};
