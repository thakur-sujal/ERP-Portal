import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/authSlice';
import { Mail, Lock, GraduationCap } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './Auth.css';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector(state => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(formData));
        if (login.fulfilled.match(result)) {
            const role = result.payload.user.role;
            navigate(`/${role}`);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg">
                <div className="auth-bg-gradient"></div>
            </div>

            <div className="auth-card glass-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <GraduationCap size={40} />
                    </div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your EduERP account</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit" fullWidth loading={isLoading}>
                        Sign In
                    </Button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>

                <div className="demo-credentials">
                    <p>Demo Credentials:</p>
                    <code>admin@test.com / password123</code>
                </div>
            </div>
        </div>
    );
}
