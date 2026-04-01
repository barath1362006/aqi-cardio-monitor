import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import HistoryTable from '../components/HistoryTable';
import './Pages.css';

const History = () => {
    const { user } = useAuth();
    const [combinedData, setCombinedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchHistory = async () => {
        try {
            const [aqiRes, healthRes] = await Promise.all([
                api.get('/api/aqi/history?days=30'),
                api.get('/api/health/history'),
            ]);

            // Combine data: Map each health record to the nearest AQI record
            const combined = healthRes.data.map((health) => {
                const healthTime = new Date(health.recorded_at).getTime();
                
                // Find the AQI record closest in time to this health record
                let nearestAqi = null;
                let minDiff = Infinity;

                aqiRes.data.forEach((aqi) => {
                    const aqiTime = new Date(aqi.fetched_at).getTime();
                    const diff = Math.abs(healthTime - aqiTime);
                    if (diff < minDiff) {
                        minDiff = diff;
                        nearestAqi = aqi;
                    }
                });

                // Only use the AQI record if it's within a reasonable window (e.g., 24 hours)
                const isRelevant = minDiff < (24 * 60 * 60 * 1000);
                const aqi = isRelevant ? nearestAqi : {};

                return {
                    date: health.recorded_at,
                    aqi_value: aqi.aqi_value || 'N/A',
                    pm25: aqi.pm25 || 'N/A',
                    heart_rate: health.heart_rate,
                    systolic_bp: health.systolic_bp,
                    risk_label: health.risk_label || null, // Could be joined in backend later
                };
            });

            setCombinedData(combined);
            setFilteredData(combined);
        } catch (err) {
            setError('Failed to load history data.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        if (!startDate || !endDate) {
            setFilteredData(combinedData);
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);

        const filtered = combinedData.filter((item) => {
            const date = new Date(item.date);
            return date >= start && date <= end;
        });

        setFilteredData(filtered);
    };

    const clearFilter = () => {
        setStartDate('');
        setEndDate('');
        setFilteredData(combinedData);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-spinner"></div>
                <p>Loading history...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title">History</h2>
            {error && <div className="error-message">{error}</div>}

            <div className="filter-bar">
                <div className="filter-group">
                    <label>From:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>To:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <button className="btn-filter" onClick={handleFilter}>Apply Filter</button>
                <button className="btn-filter-clear" onClick={clearFilter}>Clear</button>
            </div>

            <HistoryTable data={filteredData} />
        </div>
    );
};

export default History;
