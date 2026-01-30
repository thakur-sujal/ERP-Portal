import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, BookOpen, GraduationCap, UserCheck } from 'lucide-react';
import { analyticsService } from '../../services';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminDashboard() {
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await analyticsService.getOverview();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}></div></div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Welcome back, {user?.firstName}!</h1>
                <p className="page-subtitle">Here's what's happening in your institution today.</p>
            </div>

            <div className="stats-grid">
                <StatCard title="Total Students" value={stats?.stats?.totalStudents || 0} icon={GraduationCap} color="primary" />
                <StatCard title="Total Faculty" value={stats?.stats?.totalFaculty || 0} icon={Users} color="secondary" />
                <StatCard title="Active Courses" value={stats?.stats?.totalCourses || 0} icon={BookOpen} color="success" />
                <StatCard title="Total Users" value={stats?.stats?.totalUsers || 0} icon={UserCheck} color="warning" />
            </div>

            <div className="content-grid">
                <Card title="Students by Department">
                    {stats?.departmentStats?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.departmentStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="_id" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'var(--text-secondary)' }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
                                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-muted text-center p-4">No data available</p>
                    )}
                </Card>

                <Card title="Recent Users">
                    {stats?.recentUsers?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stats.recentUsers.map(user => (
                                <div key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.firstName} {user.lastName}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                                    </div>
                                    <span className={`badge badge-${user.role === 'admin' ? 'error' : user.role === 'faculty' ? 'warning' : 'primary'}`} style={{ marginLeft: 'auto' }}>
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center p-4">No users yet</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
