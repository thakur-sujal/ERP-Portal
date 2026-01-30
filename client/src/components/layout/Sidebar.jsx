import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
    LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
    GraduationCap, UserCog, BarChart3, LogOut, User
} from 'lucide-react';
import './Sidebar.css';

const menuItems = {
    admin: [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/students', icon: GraduationCap, label: 'Students' },
        { path: '/admin/faculty', icon: UserCog, label: 'Faculty' },
        { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
        { path: '/admin/timetable', icon: Calendar, label: 'Timetable' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
    faculty: [
        { path: '/faculty', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
        { path: '/faculty/attendance', icon: ClipboardList, label: 'Attendance' },
        { path: '/faculty/grades', icon: GraduationCap, label: 'Grades' },
        { path: '/faculty/timetable', icon: Calendar, label: 'Timetable' },
    ],
    student: [
        { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/student/courses', icon: BookOpen, label: 'My Courses' },
        { path: '/student/attendance', icon: ClipboardList, label: 'Attendance' },
        { path: '/student/grades', icon: GraduationCap, label: 'Grades' },
        { path: '/student/timetable', icon: Calendar, label: 'Timetable' },
    ]
};

export default function Sidebar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const role = user?.role || 'student';
    const items = menuItems[role] || menuItems.student;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <GraduationCap size={32} className="logo-icon" />
                    <span className="logo-text">EduERP</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {items.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.path === `/${role}`}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        <User size={20} />
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.firstName} {user?.lastName}</span>
                        <span className="user-role">{role}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
