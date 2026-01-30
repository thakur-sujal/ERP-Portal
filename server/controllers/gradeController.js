const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

// @desc    Upload grades for a course
// @route   POST /api/grades/upload
// @access  Private/Admin/Faculty
exports.uploadGrades = async (req, res, next) => {
    try {
        const { courseId, examType, academicYear, gradesData } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Admin has full access, faculty needs to be assigned to course
        let uploaderId;
        if (req.user.role === 'admin') {
            // Admin can upload for any course
            uploaderId = req.user.id;
        } else {
            const faculty = await Faculty.findOne({ user: req.user.id });
            if (!faculty) {
                return res.status(403).json({ message: 'Faculty profile not found' });
            }
            if (course.faculty?.toString() !== faculty._id.toString()) {
                return res.status(403).json({ message: 'Not authorized for this course' });
            }
            uploaderId = faculty._id;
        }

        const results = [];
        for (const gradeData of gradesData) {
            const student = await Student.findById(gradeData.studentId);
            if (!student) continue;

            const existing = await Grade.findOne({
                student: gradeData.studentId, course: courseId, examType, academicYear
            });

            if (existing) {
                existing.marks = gradeData.marks;
                existing.maxMarks = gradeData.maxMarks;
                await existing.save();
                results.push({ studentId: gradeData.studentId, action: 'updated' });
            } else {
                await Grade.create({
                    student: gradeData.studentId, course: courseId, examType,
                    marks: gradeData.marks, maxMarks: gradeData.maxMarks,
                    semester: student.semester, academicYear, uploadedBy: uploaderId
                });
                results.push({ studentId: gradeData.studentId, action: 'created' });
            }
        }

        res.status(200).json({ success: true, results });
    } catch (error) {
        next(error);
    }
};

// @desc    Get grades for a course
exports.getCourseGrades = async (req, res, next) => {
    try {
        const { examType } = req.query;
        let query = { course: req.params.courseId };
        if (examType) query.examType = examType;

        const grades = await Grade.find(query)
            .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' } });

        res.status(200).json({ success: true, grades });
    } catch (error) {
        next(error);
    }
};

// @desc    Get student's grades
exports.getStudentGrades = async (req, res, next) => {
    try {
        const { semester } = req.query;
        let query = { student: req.params.studentId };
        if (semester) query.semester = parseInt(semester);

        const grades = await Grade.find(query).populate('course', 'courseCode courseName credits');
        const cgpa = semester ? await Grade.calculateGPA(req.params.studentId, parseInt(semester)) : 0;

        res.status(200).json({ success: true, grades, cgpa });
    } catch (error) {
        next(error);
    }
};

// @desc    Update grade
exports.updateGrade = async (req, res, next) => {
    try {
        const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!grade) return res.status(404).json({ message: 'Grade not found' });
        res.status(200).json({ success: true, grade });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin
exports.deleteGrade = async (req, res, next) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) return res.status(404).json({ message: 'Grade not found' });

        await grade.deleteOne();
        res.status(200).json({ success: true, message: 'Grade deleted' });
    } catch (error) {
        next(error);
    }
};
