const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
    examType: {
        type: String,
        enum: ['internal1', 'internal2', 'midterm', 'final', 'assignment', 'practical'],
        required: true
    },
    marks: {
        type: Number,
        required: true,
        min: 0
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 1
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I'],
        default: 'I'
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    academicYear: {
        type: String,
        required: true
    },
    uploadedBy: {
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

// Compound index to prevent duplicate grade records
gradeSchema.index({ student: 1, course: 1, examType: 1, academicYear: 1 }, { unique: true });

// Pre-save hook to calculate grade
gradeSchema.pre('save', function (next) {
    const percentage = (this.marks / this.maxMarks) * 100;

    if (percentage >= 90) this.grade = 'A+';
    else if (percentage >= 80) this.grade = 'A';
    else if (percentage >= 70) this.grade = 'B+';
    else if (percentage >= 60) this.grade = 'B';
    else if (percentage >= 50) this.grade = 'C+';
    else if (percentage >= 40) this.grade = 'C';
    else if (percentage >= 33) this.grade = 'D';
    else this.grade = 'F';

    next();
});

// Static method to calculate GPA
gradeSchema.statics.calculateGPA = async function (studentId, semester) {
    const gradePoints = {
        'A+': 10, 'A': 9, 'B+': 8, 'B': 7,
        'C+': 6, 'C': 5, 'D': 4, 'F': 0
    };

    const grades = await this.find({ student: studentId, semester, examType: 'final' })
        .populate('course', 'credits');

    if (grades.length === 0) return 0;

    let totalCredits = 0;
    let totalPoints = 0;

    grades.forEach(g => {
        const credits = g.course?.credits || 3;
        totalCredits += credits;
        totalPoints += (gradePoints[g.grade] || 0) * credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
};

module.exports = mongoose.model('Grade', gradeSchema);
