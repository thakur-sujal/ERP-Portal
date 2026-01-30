import { useState, useEffect } from 'react';
import { userService } from '../../services';
import { Users, Plus, Search, Edit2, Trash2, X, Check, Filter, MoreVertical } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import './UserManagement.css';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '', password: '', firstName: '', lastName: '', phone: '', role: 'student', isActive: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await userService.getAll();
            setUsers(data.users || []);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.update(editingUser._id, formData);
                toast.success('User updated successfully');
            } else {
                await userService.create(formData);
                toast.success('User created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: '',
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || '',
            role: user.role,
            isActive: user.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await userService.delete(userId);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const toggleStatus = async (user) => {
        try {
            await userService.update(user._id, { isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'student', isActive: true });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        faculty: users.filter(u => u.role === 'faculty').length,
        admins: users.filter(u => u.role === 'admin').length,
        active: users.filter(u => u.isActive).length
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage all users in the system</p>
                </div>
                <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>
                    Add User
                </Button>
            </div>

            <div className="user-stats">
                <div className="stat-card total">
                    <Users size={24} />
                    <div>
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>
                <div className="stat-card students">
                    <span className="stat-number">{stats.students}</span>
                    <span className="stat-label">Students</span>
                </div>
                <div className="stat-card faculty">
                    <span className="stat-number">{stats.faculty}</span>
                    <span className="stat-label">Faculty</span>
                </div>
                <div className="stat-card admins">
                    <span className="stat-number">{stats.admins}</span>
                    <span className="stat-label">Admins</span>
                </div>
                <div className="stat-card active">
                    <span className="stat-number">{stats.active}</span>
                    <span className="stat-label">Active</span>
                </div>
            </div>

            <Card>
                <div className="table-controls">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <Filter size={16} />
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="all">All Roles</option>
                            <option value="student">Students</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner" style={{ margin: '3rem auto' }}></div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, idx) => (
                                <tr key={user._id} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar" data-role={user.role}>
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div>
                                                <span className="user-name">{user.firstName} {user.lastName}</span>
                                                {user.phone && <span className="user-phone">{user.phone}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                                    <td>
                                        <button
                                            className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => toggleStatus(user)}
                                        >
                                            {user.isActive ? <Check size={12} /> : <X size={12} />}
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn edit" onClick={() => handleEdit(user)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(user._id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && filteredUsers.length === 0 && (
                    <div className="empty-state">
                        <Users size={48} />
                        <p>No users found</p>
                    </div>
                )}
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Edit User' : 'Add New User'}>
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-row">
                        <Input label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                        <Input label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                    </div>
                    <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    {!editingUser && (
                        <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    )}
                    <div className="input-group">
                        <label className="input-label">Role</label>
                        <select className="select-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit">{editingUser ? 'Update' : 'Create'} User</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
