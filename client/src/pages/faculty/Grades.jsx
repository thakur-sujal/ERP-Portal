import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../store/authSlice';
import { facultyService, courseService, gradeService } from '../../services';
import { Upload, Award, ChevronDown, Save, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './Grades.css';

const examTypes = [
    { value: 'internal1', label: 'Internal 1' },
    { value: 'internal2', label: 'Internal 2' },
    { value: 'midterm', label: 'Midterm' },
    { value: 'final', label: 'Final Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'practical', label: 'Practical' }
];

export default function UploadGrades() {
    const dispatch = useDispatch();
    const { profile } = useSelector(state => state.auth);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [examType, setExamType] = useState('internal1');
    const [maxMarks, setMaxMarks] = useState(100);
    const [academicYear, setAcademicYear] = useState('2025-2026');
    const [grades, setGrades] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        dispatch(getMe());
    }, [dispatch]);

    useEffect(() => {
        if (profile?._id) {
            fetchCourses();
        }
    }, [profile]);

    const fetchCourses = async () => {
        try {
            const { data } = await facultyService.getCourses(profile._id);
            setCourses(data.courses || []);
        } catch (error) {
            toast.error('Failed to fetch courses');
        }
    };

    const fetchStudents = async (courseId) => {
        setLoading(true);
        try {
            const { data } = await courseService.getStudents(courseId);
            setStudents(data.students || []);
            const initialGrades = {};
            data.students.forEach(s => {
                initialGrades[s._id] = '';
            });
            setGrades(initialGrades);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        if (courseId) fetchStudents(courseId);
        else setStudents([]);
    };

    const handleGradeChange = (studentId, marks) => {
        const numMarks = marks === '' ? '' : Math.min(Math.max(0, Number(marks)), maxMarks);
        setGrades(prev => ({ ...prev, [studentId]: numMarks }));
    };

    const calculateGrade = (marks) => {
        if (marks === '' || marks === undefined) return '-';
        const percentage = (marks / maxMarks) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        if (percentage >= 33) return 'D';
        return 'F';
    };

    const handleSubmit = async () => {
        if (!selectedCourse || !examType) {
            toast.error('Please select course and exam type');
            return;
        }

        const gradesData = Object.entries(grades)
            .filter(([_, marks]) => marks !== '' && marks !== undefined)
            .map(([studentId, marks]) => ({
                studentId,
                marks: Number(marks),
                maxMarks
            }));

        if (gradesData.length === 0) {
            toast.error('Please enter at least one grade');
            return;
        }

        setSaving(true);
        try {
            await gradeService.upload({
                courseId: selectedCourse,
                examType,
                academicYear,
                gradesData
            });
            toast.success('Grades uploaded successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload grades');
        } finally {
            setSaving(false);
        }
    };

    const getStats = () => {
        const validGrades = Object.values(grades).filter(g => g !== '' && g !== undefined);
        if (validGrades.length === 0) return { avg: 0, highest: 0, lowest: 0 };
        const nums = validGrades.map(Number);
        return {
            avg: (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1),
            highest: Math.max(...nums),
            lowest: Math.min(...nums)
        };
    };

    const stats = getStats();

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Upload Grades</h1>
                <p className="page-subtitle">Enter and manage student grades for your courses</p>
            </div>

            <Card className="grade-controls">
                <div className="controls-grid-4">
                    <div className="control-group">
                        <label>Select Course</label>
                        <div className="select-wrapper">
                            <select value={selectedCourse} onChange={handleCourseChange} className="select-field">
                                <option value="">-- Select a course --</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>
                                ))}
                            </select>
                            <ChevronDown className="select-icon" size={18} />
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Exam Type</label>
                        <div className="select-wrapper">
                            <select value={examType} onChange={(e) => setExamType(e.target.value)} className="select-field">
                                {examTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="select-icon" size={18} />
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Max Marks</label>
                        <input
                            type="number"
                            value={maxMarks}
                            onChange={(e) => setMaxMarks(Number(e.target.value))}
                            className="number-input"
                            min="1"
                            max="200"
                        />
                    </div>

                    <div className="control-group">
                        <label>Academic Year</label>
                        <input
                            type="text"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="text-input"
                            placeholder="2025-2026"
                        />
                    </div>
                </div>
            </Card>

            {selectedCourse && students.length > 0 && (
                <>
                    <div className="grade-stats">
                        <div className="stat-box">
                            <TrendingUp size={20} />
                            <div>
                                <span className="stat-label">Average</span>
                                <span className="stat-value">{stats.avg}</span>
                            </div>
                        </div>
                        <div className="stat-box highest">
                            <Award size={20} />
                            <div>
                                <span className="stat-label">Highest</span>
                                <span className="stat-value">{stats.highest}</span>
                            </div>
                        </div>
                        <div className="stat-box lowest">
                            <Award size={20} />
                            <div>
                                <span className="stat-label">Lowest</span>
                                <span className="stat-value">{stats.lowest}</span>
                            </div>
                        </div>
                    </div>

                    <Card title="Student Grades">
                        {loading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <table className="grades-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student</th>
                                        <th>Roll Number</th>
                                        <th>Marks (out of {maxMarks})</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => {
                                        const grade = calculateGrade(grades[student._id]);
                                        return (
                                            <tr key={student._id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="student-cell">
                                                        <div className="mini-avatar">
                                                            {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                                                        </div>
                                                        {student.user?.firstName} {student.user?.lastName}
                                                    </div>
                                                </td>
                                                <td><span className="roll-badge">{student.rollNumber}</span></td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={grades[student._id]}
                                                        onChange={(e) => handleGradeChange(student._id, e.target.value)}
                                                        className="marks-input"
                                                        min="0"
                                                        max={maxMarks}
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td>
                                                    <span className={`grade-badge grade-${grade.replace('+', 'plus')}`}>
                                                        {grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </Card>

                    <div className="submit-section">
                        <Button onClick={handleSubmit} loading={saving} icon={Upload}>
                            Upload Grades
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
