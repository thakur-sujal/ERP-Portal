const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology']
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
        enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Assistant']
    },
    specialization: {
        type: String,
        trim: true
    },
    assignedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    joiningDate: {
        type: Date,
        default: Date.now
    },
    qualification: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
facultySchema.index({ department: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
