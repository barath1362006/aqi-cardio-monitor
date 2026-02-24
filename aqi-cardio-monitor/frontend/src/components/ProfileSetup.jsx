import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfileSetup.css';

const ProfileSetup = ({ onComplete }) => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        age: user.age || '',
        smoking_status: user.smoking_status || 'no',
        existing_conditions: user.existing_conditions || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Form data before submission:', formData);
            const payload = {
                ...formData,
                age: formData.age ? parseInt(formData.age) : null
            };
            console.log('Sending sanitized payload:', payload);

            const response = await api.post('/api/user/update-profile', payload);
            console.log('Profile update response:', response.data);

            updateProfile(response.data.user);
            if (onComplete) onComplete();
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-setup-overlay">
            <div className="profile-setup-card">
                <h2>Complete Your Profile</h2>
                <p>Welcome! Help us provide more accurate health insights by completing your profile.</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Your age"
                            min="1"
                            max="120"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="smoking_status">Do you smoke?</label>
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

                    <div className="form-group">
                        <label htmlFor="existing_conditions">Existing Conditions</label>
                        <input
                            type="text"
                            id="existing_conditions"
                            name="existing_conditions"
                            value={formData.existing_conditions}
                            onChange={handleChange}
                            placeholder="e.g., Hypertension, Diabetes (optional)"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Get Started'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
