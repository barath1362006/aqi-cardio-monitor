import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AQICard from '../components/AQICard';
import RiskBadge from '../components/RiskBadge';
import AlertBanner from '../components/AlertBanner';
import AQIChart from '../components/AQIChart';
import HealthChart from '../components/HealthChart';
import RiskGauge from '../components/RiskGauge';
import ProfileSetup from '../components/ProfileSetup';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [selectedCity, setSelectedCity] = useState('Chennai');
    const [aqiData, setAqiData] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [aqiHistory, setAqiHistory] = useState([]);
    const [healthHistory, setHealthHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [activeAlert, setActiveAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cities = ['Chennai', 'Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Kolkata'];

    const isProfileIncomplete = !user?.age;

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.age, selectedCity]); // Re-fetch data if profile or city is updated

    useEffect(() => {
        if (user && user.user_id) {
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const socket = io(socketUrl);
            
            socket.on('connect', () => {
                console.log('[Socket] Connected to server');
                socket.emit('join', { user_id: user.user_id });
            });

            socket.on('emergency_alert', (data) => {
                console.log('[Socket] Real-time alert received:', data);
                setActiveAlert(data);
                // Also update the alerts list if it's new
                setAlerts(prev => [data, ...prev]);
            });

            socket.on('disconnect', () => {
                console.log('[Socket] Disconnected');
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        // const city = 'Chennai'; // Variable for future city selection enrichment

        try {
            // Use Promise.allSettled to ensure one failure doesn't block others
            const results = await Promise.allSettled([
                api.get(`/api/aqi/current?city=${selectedCity}`),
                api.get('/api/health/history'),
                api.get('/api/aqi/history?days=7'),
                api.get('/api/alerts')
            ]);

            // 1. Current AQI
            if (results[0].status === 'fulfilled') {
                setAqiData(results[0].value.data);
            } else {
                console.error('Failed to fetch current AQI:', results[0].reason);
            }

            // 2. Health History
            let latestHealth = null;
            if (results[1].status === 'fulfilled') {
                setHealthHistory(results[1].value.data);
                latestHealth = results[1].value.data[0];
            } else {
                console.error('Failed to fetch health history:', results[1].reason);
            }

            // 3. AQI History
            if (results[2].status === 'fulfilled') {
                setAqiHistory(results[2].value.data);
            }

            // 4. Alerts
            if (results[3].status === 'fulfilled') {
                setAlerts(results[3].value.data);
            }

            // 5. Fetch alerts (latest few)
            const alertsRes = await api.get('/api/alerts');
            const latestAlerts = alertsRes.data;
            setAlerts(latestAlerts);
            
            // Only show banner if alert is very recent (last 2 mins)
            if (latestAlerts.length > 0) {
                const alertTime = new Date(latestAlerts[0].created_at).getTime();
                const now = new Date().getTime();
                if (now - alertTime < 2 * 60 * 1000) {
                    setActiveAlert(latestAlerts[0]);
                }
            }

            // 6. Run prediction if we have necessary data
            const currentAqiId = results[0].status === 'fulfilled' ? results[0].value.data.aqi_id : null;
            if (latestHealth && currentAqiId && user.age) {
                try {
                    const predRes = await api.post('/api/predict', {
                        aqi_id: currentAqiId,
                        heart_rate: latestHealth.heart_rate,
                        systolic_bp: latestHealth.systolic_bp,
                        age: user.age,
                        smoking_status: user.smoking_status === 'yes' ? 1 : 0,
                        existing_conditions: user.existing_conditions ? 1 : 0,
                    });
                    setRiskData(predRes.data);
                } catch (predErr) {
                    console.warn('Prediction service analysis failed:', predErr.message);
                }
            }

            // If ALL core data fails, set a general error
            if (results.every(r => r.status === 'rejected')) {
                setError('Unable to load any dashboard data. Please try again later.');
            }

        } catch (err) {
            setError('An unexpected error occurred while loading the dashboard.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isProfileIncomplete && !aqiData) { // Only show loading spinner on initial load or city change if no data
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {isProfileIncomplete && <ProfileSetup onComplete={fetchDashboardData} />}

            <div className="dashboard-header">
                <div className="header-main">
                    <h1>Dashboard</h1>
                    <p>Welcome back, <strong>{user.name}</strong></p>
                </div>
                <div className="city-selector">
                    <label htmlFor="city-select">Viewing AQI for:</label>
                    <select 
                        id="city-select" 
                        value={selectedCity} 
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="city-dropdown"
                    >
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
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
                {aqiHistory.length > 0 ? (
                    <AQIChart data={aqiHistory} />
                ) : (
                    <div className="chart-placeholder">
                        <h3>AQI History</h3>
                        <p>No air quality data available for the last 7 days.</p>
                    </div>
                )}

                {healthHistory.length > 0 ? (
                    <HealthChart data={healthHistory} />
                ) : (
                    <div className="chart-placeholder">
                        <h3>Health Trends</h3>
                        <div className="empty-state-content">
                            <p>No health records found.</p>
                            <a href="/health-input" className="cta-link">Submit your first vitals</a>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Row: Risk Gauge + Alerts */}
            <div className="dashboard-row bottom-row">
                <RiskGauge riskScore={riskData?.risk_score || 0} />
                <div className="recent-alerts-card">
                    <h3>Recent Alerts</h3>
                    {alerts.length === 0 ? (
                        <div className="no-alerts-state">
                            <p>No alerts yet. Stay healthy! 💚</p>
                        </div>
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
