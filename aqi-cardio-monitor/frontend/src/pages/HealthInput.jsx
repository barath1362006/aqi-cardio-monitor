import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Pages.css';

const HealthInput = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        heart_rate: '',
        systolic_bp: '',
        diastolic_bp: '',
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            // 1. Submit health data
            await api.post('/api/health/submit', {
                user_id: user.user_id,
                heart_rate: parseInt(formData.heart_rate),
                systolic_bp: parseInt(formData.systolic_bp),
                diastolic_bp: parseInt(formData.diastolic_bp),
            });

            // 2. Get latest AQI
            const aqiRes = await api.get('/api/aqi/current?city=Chennai');

            // 3. Run prediction
            const predRes = await api.post('/api/predict', {
                user_id: user.user_id,
                aqi_id: aqiRes.data.aqi_id,
                heart_rate: parseInt(formData.heart_rate),
                systolic_bp: parseInt(formData.systolic_bp),
                age: user.age || 30, // Use real age from context
                smoking_status: user.smoking_status === 'yes' ? 1 : 0, // Convert string to int
                existing_conditions: user.existing_conditions ? 1 : 0, // Convert presence to bool
            });

            setResult(predRes.data);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || 'Submission failed');
            } else {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (label) => {
        switch (label) {
            case 'Low': return '#22c55e';
            case 'Moderate': return '#f97316';
            case 'High': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    return (
        <div className="page-container">
            <div className="page-card">
                <h2>Submit Health Data</h2>
                <p className="page-subtitle">Enter your current vitals for risk assessment</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="health-form">
                    <div className="form-group">
                        <label htmlFor="heart_rate">Heart Rate (bpm)</label>
                        <input
                            type="number"
                            id="heart_rate"
                            name="heart_rate"
                            value={formData.heart_rate}
                            onChange={handleChange}
                            placeholder="e.g., 72"
                            min="30"
                            max="200"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="systolic_bp">Systolic BP (mmHg)</label>
                        <input
                            type="number"
                            id="systolic_bp"
                            name="systolic_bp"
                            value={formData.systolic_bp}
                            onChange={handleChange}
                            placeholder="e.g., 120"
                            min="60"
                            max="250"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="diastolic_bp">Diastolic BP (mmHg)</label>
                        <input
                            type="number"
                            id="diastolic_bp"
                            name="diastolic_bp"
                            value={formData.diastolic_bp}
                            onChange={handleChange}
                            placeholder="e.g., 80"
                            min="40"
                            max="150"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Submit & Predict'}
                    </button>
                </form>

                {result && (
                    <div className="result-card" style={{ borderColor: getRiskColor(result.risk_label) }}>
                        <h3>Prediction Result</h3>
                        <div className="result-grid">
                            <div className="result-item">
                                <span className="result-label">Risk Level</span>
                                <span className="result-value" style={{ color: getRiskColor(result.risk_label) }}>
                                    {result.risk_label}
                                </span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Risk Score</span>
                                <span className="result-value">
                                    {(result.risk_score * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Alert</span>
                                <span className={`result-value ${result.alert_triggered ? 'alert-yes' : 'alert-no'}`}>
                                    {result.alert_triggered ? '⚠️ Triggered' : '✅ None'}
                                </span>
                            </div>
                        </div>
                        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthInput;
