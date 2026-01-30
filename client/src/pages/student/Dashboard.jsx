import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../store/authSlice';
import { BookOpen, ClipboardList, Award, Calendar } from 'lucide-react';
import { studentService } from '../../services';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';

export default function StudentDashboard() {
    const dispatch = useDispatch();
    const { user, profile } = useSelector(state => state.auth);
    const [attendance, setAttendance] = useState([]);
    const [grades, setGrades] = useState({ grades: [], cgpa: 0 });

    useEffect(() => {
        dispatch(getMe());
    }, [dispatch]);

    useEffect(() => {
        if (profile?._id) {
            fetchData();
        }
    }, [profile]);

    const fetchData = async () => {
        try {
            const [attRes, gradeRes] = await Promise.all([
                studentService.getAttendance(profile._id, {}),
                studentService.getGrades(profile._id, {})
            ]);
            setAttendance(attRes.data.courseSummary || []);
            setGrades(gradeRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const avgAttendance = attendance.length > 0
        ? (attendance.reduce((acc, a) => acc + parseFloat(a.percentage), 0) / attendance.length).toFixed(1)
        : 0;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Welcome, {user?.firstName}!</h1>
                <p className="page-subtitle">
                    {profile?.department} • Semester {profile?.semester} • Roll: {profile?.rollNumber}
                </p>
            </div>

            <div className="stats-grid">
                <StatCard title="Enrolled Courses" value={profile?.enrolledCourses?.length || 0} icon={BookOpen} color="primary" />
                <StatCard title="Average Attendance" value={`${avgAttendance}%`} icon={ClipboardList} color={parseFloat(avgAttendance) >= 75 ? 'success' : 'warning'} />
                <StatCard title="CGPA" value={grades.cgpa || 'N/A'} icon={Award} color="secondary" />
                <StatCard title="Semester" value={profile?.semester || 1} icon={Calendar} color="success" />
            </div>

            <div className="content-grid">
                <Card title="Attendance Summary">
                    {attendance.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map(a => (
                                    <tr key={a.course._id}>
                                        <td>{a.course.courseName}</td>
                                        <td>{a.present}</td>
                                        <td>{a.absent}</td>
                                        <td>
                                            <span className={`badge ${parseFloat(a.percentage) >= 75 ? 'badge-success' : 'badge-warning'}`}>
                                                {a.percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted text-center p-4">No attendance records yet</p>
                    )}
                </Card>

                <Card title="Recent Grades">
                    {grades.grades?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {grades.grades.slice(0, 5).map(g => (
                                <div key={g._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                    <div>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{g.course?.courseName}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.examType}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.marks}/{g.maxMarks}</p>
                                        <span className={`badge ${g.grade !== 'F' ? 'badge-success' : 'badge-error'}`}>{g.grade}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center p-4">No grades yet</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
