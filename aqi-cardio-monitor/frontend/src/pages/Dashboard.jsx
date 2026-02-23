import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AQICard from '../components/AQICard';
import RiskBadge from '../components/RiskBadge';
import AlertBanner from '../components/AlertBanner';
import AQIChart from '../components/AQIChart';
import HealthChart from '../components/HealthChart';
import RiskGauge from '../components/RiskGauge';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [aqiData, setAqiData] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [aqiHistory, setAqiHistory] = useState([]);
    const [healthHistory, setHealthHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [activeAlert, setActiveAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Fetch current AQI
            const aqiRes = await api.get('/api/aqi/current?city=Chennai');
            setAqiData(aqiRes.data);

            // 2. Fetch health history
            const healthRes = await api.get(`/api/health/history?user_id=${user.user_id}`);
            setHealthHistory(healthRes.data);

            // 3. Run prediction if we have health data
            const latestHealth = healthRes.data[0];
            if (latestHealth && aqiRes.data.aqi_id) {
                try {
                    const predRes = await api.post('/api/predict', {
                        user_id: user.user_id,
                        aqi_id: aqiRes.data.aqi_id,
                        heart_rate: latestHealth.heart_rate,
                        systolic_bp: latestHealth.systolic_bp,
                        age: 30, // Default; ideally fetched from user profile
                        smoking_status: 0,
                        existing_conditions: 0,
                    });
                    setRiskData(predRes.data);
                } catch (predErr) {
                    console.log('Prediction not available:', predErr.message);
                }
            }

            // 4. Fetch AQI history
            const aqiHistRes = await api.get('/api/aqi/history?days=7');
            setAqiHistory(aqiHistRes.data);

            // 5. Fetch alerts
            const alertsRes = await api.get(`/api/alerts?user_id=${user.user_id}`);
            setAlerts(alertsRes.data);
            if (alertsRes.data.length > 0) {
                setActiveAlert(alertsRes.data[0]);
            }
        } catch (err) {
            setError('Failed to load dashboard data. Please check your connection.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Welcome back, <strong>{user.name}</strong></p>
            </div>

            {error && <div className="dashboard-error">{error}</div>}

            {activeAlert && (
                <AlertBanner
                    message={activeAlert.message}
                    onClose={() => setActiveAlert(null)}
                />
            )}

            {/* Top Row: AQI Card + Risk Badge */}
            <div className="dashboard-row top-row">
                <AQICard data={aqiData} />
                <RiskBadge
                    riskLabel={riskData?.risk_label || 'N/A'}
                    riskScore={riskData?.risk_score || 0}
                />
            </div>

            {/* Middle Row: Charts */}
            <div className="dashboard-row charts-row">
                <AQIChart data={aqiHistory} />
                <HealthChart data={healthHistory} />
            </div>

            {/* Bottom Row: Risk Gauge + Alerts */}
            <div className="dashboard-row bottom-row">
                <RiskGauge riskScore={riskData?.risk_score || 0} />
                <div className="recent-alerts-card">
                    <h3>Recent Alerts</h3>
                    {alerts.length === 0 ? (
                        <p className="no-data">No alerts yet. Stay healthy! 💚</p>
                    ) : (
                        <ul className="alerts-list">
                            {alerts.slice(0, 5).map((alert) => (
                                <li key={alert.alert_id} className={`alert-item severity-${alert.severity.toLowerCase()}`}>
                                    <span className="alert-severity">{alert.severity}</span>
                                    <span className="alert-message">{alert.message}</span>
                                    <span className="alert-date">
                                        {new Date(alert.created_at).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
