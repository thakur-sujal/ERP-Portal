import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../store/authSlice';
import { facultyService, courseService, attendanceService } from '../../services';
import { Check, X, Clock, Users, Calendar, Save, ChevronDown } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './Attendance.css';

export default function MarkAttendance() {
    const dispatch = useDispatch();
    const { profile } = useSelector(state => state.auth);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState({});
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
            // Initialize attendance state
            const initialAttendance = {};
            data.students.forEach(s => {
                initialAttendance[s._id] = 'present';
            });
            setAttendance(initialAttendance);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        if (courseId) {
            fetchStudents(courseId);
        } else {
            setStudents([]);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const markAllAs = (status) => {
        const newAttendance = {};
        students.forEach(s => {
            newAttendance[s._id] = status;
        });
        setAttendance(newAttendance);
    };

    const handleSubmit = async () => {
        if (!selectedCourse || !selectedDate) {
            toast.error('Please select course and date');
            return;
        }

        setSaving(true);
        try {
            const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await attendanceService.mark({
                courseId: selectedCourse,
                date: selectedDate,
                attendanceData
            });

            toast.success('Attendance marked successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setSaving(false);
        }
    };

    const presentCount = Object.values(attendance).filter(s => s === 'present').length;
    const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
    const lateCount = Object.values(attendance).filter(s => s === 'late').length;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Mark Attendance</h1>
                <p className="page-subtitle">Record student attendance for your classes</p>
            </div>

            <Card className="attendance-controls">
                <div className="controls-grid">
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
                        <label>Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="date-input"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            </Card>

            {selectedCourse && students.length > 0 && (
                <>
                    <div className="attendance-summary">
                        <div className="summary-card present">
                            <Check size={20} />
                            <span>{presentCount} Present</span>
                        </div>
                        <div className="summary-card absent">
                            <X size={20} />
                            <span>{absentCount} Absent</span>
                        </div>
                        <div className="summary-card late">
                            <Clock size={20} />
                            <span>{lateCount} Late</span>
                        </div>
                        <div className="summary-card total">
                            <Users size={20} />
                            <span>{students.length} Total</span>
                        </div>
                    </div>

                    <Card title="Students" action={
                        <div className="quick-actions">
                            <button className="quick-btn present" onClick={() => markAllAs('present')}>All Present</button>
                            <button className="quick-btn absent" onClick={() => markAllAs('absent')}>All Absent</button>
                        </div>
                    }>
                        {loading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <div className="students-list">
                                {students.map((student, index) => (
                                    <div key={student._id} className="student-row animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="student-info">
                                            <div className="student-avatar">
                                                {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="student-name">{student.user?.firstName} {student.user?.lastName}</p>
                                                <p className="student-roll">{student.rollNumber}</p>
                                            </div>
                                        </div>
                                        <div className="attendance-buttons">
                                            <button
                                                className={`att-btn present ${attendance[student._id] === 'present' ? 'active' : ''}`}
                                                onClick={() => handleAttendanceChange(student._id, 'present')}
                                            >
                                                <Check size={16} /> Present
                                            </button>
                                            <button
                                                className={`att-btn late ${attendance[student._id] === 'late' ? 'active' : ''}`}
                                                onClick={() => handleAttendanceChange(student._id, 'late')}
                                            >
                                                <Clock size={16} /> Late
                                            </button>
                                            <button
                                                className={`att-btn absent ${attendance[student._id] === 'absent' ? 'active' : ''}`}
                                                onClick={() => handleAttendanceChange(student._id, 'absent')}
                                            >
                                                <X size={16} /> Absent
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <div className="submit-section">
                        <Button onClick={handleSubmit} loading={saving} icon={Save}>
                            Save Attendance
                        </Button>
                    </div>
                </>
            )}

            {selectedCourse && students.length === 0 && !loading && (
                <Card>
                    <div className="empty-state">
                        <Users size={48} />
                        <p>No students enrolled in this course</p>
                    </div>
                </Card>
            )}
        </div>
    );
}
