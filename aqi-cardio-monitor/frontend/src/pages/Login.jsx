import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (isLoggedIn) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/login', { email, password });
            const { user_id, name, role } = response.data;
            login({ user_id, name, role });
            navigate('/dashboard');
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || 'Login failed');
            } else {
                setError('Network error. Please check if the server is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🫀 AQI Cardio Monitor</h1>
                    <p>Monitor your cardiovascular health</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>Login</h2>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Login'}
                    </button>
                    <p className="auth-link">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
