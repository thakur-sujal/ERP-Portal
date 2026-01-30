import { useState, useEffect } from 'react';
import { courseService, facultyService } from '../../services';
import { BookOpen, Plus, Search, Edit2, Trash2, Users, Award, ChevronDown } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import './CourseManagement.css';

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology'];

export default function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        courseCode: '', courseName: '', department: 'Computer Science',
        semester: 1, credits: 3, faculty: '', description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, facultyRes] = await Promise.all([
                courseService.getAll(),
                facultyService.getAll()
            ]);
            setCourses(coursesRes.data.courses || []);
            setFaculty(facultyRes.data.faculty || []);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await courseService.update(editingCourse._id, formData);
                toast.success('Course updated successfully');
            } else {
                await courseService.create(formData);
                toast.success('Course created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            courseCode: course.courseCode,
            courseName: course.courseName,
            department: course.department,
            semester: course.semester,
            credits: course.credits,
            faculty: course.faculty?._id || '',
            description: course.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await courseService.delete(courseId);
            toast.success('Course deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete course');
        }
    };

    const resetForm = () => {
        setEditingCourse(null);
        setFormData({ courseCode: '', courseName: '', department: 'Computer Science', semester: 1, credits: 3, faculty: '', description: '' });
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.courseName.toLowerCase().includes(search.toLowerCase()) ||
            course.courseCode.toLowerCase().includes(search.toLowerCase());
        const matchesDept = deptFilter === 'all' || course.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    const stats = {
        total: courses.length,
        bySemester: [1, 2, 3, 4, 5, 6, 7, 8].map(sem => courses.filter(c => c.semester === sem).length)
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Course Management</h1>
                    <p className="page-subtitle">Manage all courses in the institution</p>
                </div>
                <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>
                    Add Course
                </Button>
            </div>

            <div className="course-stats">
                <div className="stat-main">
                    <BookOpen size={32} />
                    <div>
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">Total Courses</span>
                    </div>
                </div>
                <div className="semester-breakdown">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <div key={sem} className="semester-stat">
                            <span className="sem-label">Sem {sem}</span>
                            <span className="sem-count">{stats.bySemester[sem - 1]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Card>
                <div className="table-controls">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                            <option value="all">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner" style={{ margin: '3rem auto' }}></div>
                ) : (
                    <div className="courses-grid">
                        {filteredCourses.map((course, idx) => (
                            <div key={course._id} className="course-card animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="course-header">
                                    <span className="course-code">{course.courseCode}</span>
                                    <div className="course-actions">
                                        <button className="action-btn" onClick={() => handleEdit(course)}><Edit2 size={14} /></button>
                                        <button className="action-btn delete" onClick={() => handleDelete(course._id)}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <h3 className="course-name">{course.courseName}</h3>
                                <div className="course-tags">
                                    <span className="tag dept">{course.department}</span>
                                    <span className="tag sem">Sem {course.semester}</span>
                                    <span className="tag credits">{course.credits} Credits</span>
                                </div>
                                {course.faculty && (
                                    <div className="course-faculty">
                                        <Users size={14} />
                                        <span>Prof. {course.faculty.user?.firstName} {course.faculty.user?.lastName}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredCourses.length === 0 && (
                    <div className="empty-state">
                        <BookOpen size={48} />
                        <p>No courses found</p>
                    </div>
                )}
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCourse ? 'Edit Course' : 'Add New Course'} size="large">
                <form onSubmit={handleSubmit} className="course-form">
                    <div className="form-row">
                        <Input label="Course Code" placeholder="CS101" value={formData.courseCode} onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })} required />
                        <Input label="Credits" type="number" min="1" max="6" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })} required />
                    </div>
                    <Input label="Course Name" placeholder="Introduction to Programming" value={formData.courseName} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} required />
                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">Department</label>
                            <select className="select-field" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Semester</label>
                            <select className="select-field" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Assign Faculty</label>
                        <select className="select-field" value={formData.faculty} onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}>
                            <option value="">-- Select Faculty --</option>
                            {faculty.map(f => (
                                <option key={f._id} value={f._id}>
                                    {f.user?.firstName} {f.user?.lastName} ({f.department})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Description (Optional)</label>
                        <textarea
                            className="textarea-field"
                            rows="3"
                            placeholder="Course description..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit">{editingCourse ? 'Update' : 'Create'} Course</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
