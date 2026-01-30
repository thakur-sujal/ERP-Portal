const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    dayOfWeek: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology']
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    classType: {
        type: String,
        enum: ['lecture', 'lab', 'tutorial'],
        default: 'lecture'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to prevent scheduling conflicts
timetableSchema.index({ dayOfWeek: 1, startTime: 1, room: 1 }, { unique: true });
timetableSchema.index({ department: 1, semester: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
