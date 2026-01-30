const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    remarks: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, course: 1 });

// Static method to get attendance percentage
attendanceSchema.statics.getAttendancePercentage = async function (studentId, courseId) {
    const stats = await this.aggregate([
        {
            $match: {
                student: mongoose.Types.ObjectId(studentId),
                course: mongoose.Types.ObjectId(courseId)
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                present: {
                    $sum: {
                        $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                percentage: {
                    $multiply: [{ $divide: ['$present', '$total'] }, 100]
                }
            }
        }
    ]);

    return stats.length > 0 ? stats[0].percentage : 0;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
