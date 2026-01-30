import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../store/authSlice';
import { BookOpen, Users, ClipboardList, Award } from 'lucide-react';
import { facultyService } from '../../services';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';

export default function FacultyDashboard() {
    const dispatch = useDispatch();
    const { user, profile } = useSelector(state => state.auth);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);

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
            const [courseRes, studentRes] = await Promise.all([
                facultyService.getCourses(profile._id),
                facultyService.getStudents(profile._id)
            ]);
            setCourses(courseRes.data.courses || []);
            setStudents(studentRes.data.students || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Welcome, {user?.firstName}!</h1>
                <p className="page-subtitle">
                    {profile?.department} • {profile?.designation}
                </p>
            </div>

            <div className="stats-grid">
                <StatCard title="Assigned Courses" value={courses.length} icon={BookOpen} color="primary" />
                <StatCard title="Total Students" value={students.length} icon={Users} color="secondary" />
                <StatCard title="Today's Classes" value={0} icon={ClipboardList} color="success" />
                <StatCard title="Pending Grades" value={0} icon={Award} color="warning" />
            </div>

            <div className="content-grid">
                <Card title="My Courses">
                    {courses.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Semester</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(c => (
                                    <tr key={c._id}>
                                        <td><span className="badge badge-primary">{c.courseCode}</span></td>
                                        <td>{c.courseName}</td>
                                        <td>{c.department}</td>
                                        <td>Sem {c.semester}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted text-center p-4">No courses assigned yet</p>
                    )}
                </Card>

                <Card title="Recent Students">
                    {students.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {students.slice(0, 5).map(s => (
                                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
                                        {s.user?.firstName?.[0]}{s.user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.user?.firstName} {s.user?.lastName}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.rollNumber}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center p-4">No students in your courses</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
