import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        smoking_status: 'no',
        existing_conditions: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Client-side validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Name, email, and password are required');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/api/register', formData);
            setSuccess(response.data.message || 'Registration successful!');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || 'Registration failed');
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
                    <p>Create your account</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>Register</h2>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Age"
                                min="1"
                                max="120"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="smoking_status">Smoking Status</label>
                            <select
                                id="smoking_status"
                                name="smoking_status"
                                value={formData.smoking_status}
                                onChange={handleChange}
                            >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="existing_conditions">Existing Conditions</label>
                        <input
                            type="text"
                            id="existing_conditions"
                            name="existing_conditions"
                            value={formData.existing_conditions}
                            onChange={handleChange}
                            placeholder="e.g., Diabetes, Hypertension (optional)"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Register'}
                    </button>
                    <p className="auth-link">
                        Already have an account? <Link to="/">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
