import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { timetableService } from '../../services';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import Card from '../../components/common/Card';
import './Timetable.css';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat' };

export default function Timetable({ role }) {
    const { user, profile } = useSelector(state => state.auth);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('week'); // week or day
    const [selectedDay, setSelectedDay] = useState(days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

    useEffect(() => {
        fetchTimetable();
    }, [profile]);

    const fetchTimetable = async () => {
        try {
            const params = {};
            if (role === 'student' && profile?.department) {
                params.department = profile.department;
                params.semester = profile.semester;
            } else if (role === 'faculty' && profile?._id) {
                params.facultyId = profile._id;
            }

            const { data } = await timetableService.getAll(params);
            setTimetable(data.timetable || []);
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    const getClassesForDay = (day) => {
        return timetable
            .filter(t => t.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const isCurrentClass = (slot) => {
        const now = new Date();
        const currentDay = days[now.getDay() === 0 ? 6 : now.getDay() - 1];
        if (slot.dayOfWeek !== currentDay) return false;

        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = slot.startTime.split(':').map(Number);
        const [endH, endM] = slot.endTime.split(':').map(Number);
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;

        return currentTime >= startTime && currentTime <= endTime;
    };

    const currentDayName = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Calendar className="title-icon" /> Timetable
                    </h1>
                    <p className="page-subtitle">
                        {role === 'student' ? `${profile?.department} - Semester ${profile?.semester}` :
                            role === 'faculty' ? 'Your teaching schedule' : 'Institution schedule'}
                    </p>
                </div>
                <div className="view-toggle">
                    <button className={`toggle-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>
                        Week View
                    </button>
                    <button className={`toggle-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>
                        Day View
                    </button>
                </div>
            </div>

            {view === 'day' && (
                <div className="day-selector">
                    {days.map(day => (
                        <button
                            key={day}
                            className={`day-btn ${selectedDay === day ? 'active' : ''} ${day === currentDayName ? 'today' : ''}`}
                            onClick={() => setSelectedDay(day)}
                        >
                            {dayLabels[day]}
                        </button>
                    ))}
                </div>
            )}

            {view === 'week' ? (
                <div className="week-grid">
                    {days.map(day => {
                        const classes = getClassesForDay(day);
                        const isToday = day === currentDayName;
                        return (
                            <div key={day} className={`day-column ${isToday ? 'today' : ''}`}>
                                <div className="day-header">
                                    <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                                    {isToday && <span className="today-badge">Today</span>}
                                </div>
                                <div className="day-classes">
                                    {classes.length > 0 ? (
                                        classes.map((slot, idx) => (
                                            <div
                                                key={slot._id}
                                                className={`class-card ${isCurrentClass(slot) ? 'current' : ''}`}
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="class-time">
                                                    <Clock size={14} />
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                                <div className="class-name">{slot.course?.courseName}</div>
                                                <div className="class-code">{slot.course?.courseCode}</div>
                                                <div className="class-meta">
                                                    <span><MapPin size={12} /> {slot.room}</span>
                                                    {role !== 'faculty' && (
                                                        <span><User size={12} /> {slot.faculty?.user?.firstName}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-class">No classes</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <div className="day-timetable">
                        {getClassesForDay(selectedDay).length > 0 ? (
                            getClassesForDay(selectedDay).map((slot, idx) => (
                                <div
                                    key={slot._id}
                                    className={`day-class-row ${isCurrentClass(slot) ? 'current' : ''}`}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className="time-column">
                                        <Clock size={18} />
                                        <div>
                                            <span className="start-time">{slot.startTime}</span>
                                            <span className="end-time">{slot.endTime}</span>
                                        </div>
                                    </div>
                                    <div className="class-details">
                                        <h3>{slot.course?.courseName}</h3>
                                        <div className="class-info">
                                            <span className="course-code">{slot.course?.courseCode}</span>
                                            <span><MapPin size={14} /> {slot.room}</span>
                                            {role !== 'faculty' && slot.faculty?.user && (
                                                <span><User size={14} /> Prof. {slot.faculty.user.firstName} {slot.faculty.user.lastName}</span>
                                            )}
                                        </div>
                                    </div>
                                    {isCurrentClass(slot) && (
                                        <div className="live-badge">
                                            <span className="pulse"></span> Live
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-day">
                                <BookOpen size={48} />
                                <p>No classes scheduled for {selectedDay}</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
