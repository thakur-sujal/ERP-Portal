import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../../store/authSlice';
import { Mail, Lock, User, GraduationCap, Phone, Hash, Building } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './Auth.css';

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology'];

export default function Register() {
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        email: '', password: '', firstName: '', lastName: '', phone: '',
        rollNumber: '', employeeId: '', department: 'Computer Science', semester: 1, batch: '2024-2028'
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector(state => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(register({ ...formData, role }));
        if (register.fulfilled.match(result)) {
            navigate(`/${role}`);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg"><div className="auth-bg-gradient"></div></div>

            <div className="auth-card glass-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <div className="auth-logo"><GraduationCap size={40} /></div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join EduERP today</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <div className="role-selector">
                    {['student', 'faculty'].map(r => (
                        <button key={r} className={`role-btn ${role === r ? 'active' : ''}`} onClick={() => setRole(r)} type="button">
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-row">
                        <Input label="First Name" name="firstName" placeholder="John" icon={User} value={formData.firstName} onChange={handleChange} required />
                        <Input label="Last Name" name="lastName" placeholder="Doe" icon={User} value={formData.lastName} onChange={handleChange} required />
                    </div>

                    <Input label="Email" name="email" type="email" placeholder="email@example.com" icon={Mail} value={formData.email} onChange={handleChange} required />
                    <Input label="Phone" name="phone" placeholder="+91 9876543210" icon={Phone} value={formData.phone} onChange={handleChange} />
                    <Input label="Password" name="password" type="password" placeholder="Min 6 characters" icon={Lock} value={formData.password} onChange={handleChange} required />

                    <div className="input-group">
                        <label className="input-label">Department</label>
                        <select name="department" className="select-field" value={formData.department} onChange={handleChange}>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {role === 'student' ? (
                        <div className="auth-row">
                            <Input label="Roll Number" name="rollNumber" placeholder="CS2024001" icon={Hash} value={formData.rollNumber} onChange={handleChange} required />
                            <Input label="Batch" name="batch" placeholder="2024-2028" icon={Building} value={formData.batch} onChange={handleChange} required />
                        </div>
                    ) : (
                        <Input label="Employee ID" name="employeeId" placeholder="FAC001" icon={Hash} value={formData.employeeId} onChange={handleChange} required />
                    )}

                    <Button type="submit" fullWidth loading={isLoading}>Create Account</Button>
                </form>

                <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </div>
    );
}
