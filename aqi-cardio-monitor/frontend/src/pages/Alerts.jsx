import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Pages.css';

const Alerts = () => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAlerts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await api.get(`/api/alerts?user_id=${user.user_id}`);
            setAlerts(res.data);
        } catch (err) {
            setError('Failed to load alerts.');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Low': return '#22c55e';
            case 'Moderate': return '#f97316';
            case 'High': return '#ef4444';
            case 'Emergency': return '#991b1b';
            default: return '#9ca3af';
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-spinner"></div>
                <p>Loading alerts...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title">Alerts</h2>
            {error && <div className="error-message">{error}</div>}

            {alerts.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🔔</span>
                    <h3>No Alerts</h3>
                    <p>You don't have any alerts yet. Keep monitoring your health!</p>
                </div>
            ) : (
                <div className="alerts-grid">
                    {alerts.map((alert) => (
                        <div
                            key={alert.alert_id}
                            className="alert-card"
                            style={{ borderLeftColor: getSeverityColor(alert.severity) }}
                        >
                            <div className="alert-card-header">
                                <span
                                    className="severity-badge"
                                    style={{ background: getSeverityColor(alert.severity) }}
                                >
                                    {alert.severity}
                                </span>
                                <span className="alert-date">
                                    {new Date(alert.created_at).toLocaleString()}
                                </span>
                            </div>
                            <p className="alert-card-message">{alert.message}</p>
                            <div className="alert-card-meta">
                                <span>Risk: {alert.risk_label}</span>
                                <span>Score: {(alert.risk_score * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Alerts;
