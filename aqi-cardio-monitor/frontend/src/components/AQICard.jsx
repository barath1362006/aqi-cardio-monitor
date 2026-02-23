import React from 'react';
import './Components.css';

const AQICard = ({ data }) => {
    if (!data) {
        return (
            <div className="card aqi-card">
                <h3>Air Quality Index</h3>
                <p className="no-data">No AQI data available</p>
            </div>
        );
    }

    const getAQIColor = (value) => {
        if (value <= 50) return '#22c55e';    // Green - Good
        if (value <= 100) return '#eab308';   // Yellow - Moderate
        if (value <= 150) return '#f97316';   // Orange - Unhealthy for sensitive
        return '#ef4444';                      // Red - Unhealthy
    };

    const getAQILabel = (value) => {
        if (value <= 50) return 'Good';
        if (value <= 100) return 'Moderate';
        if (value <= 150) return 'Unhealthy (Sensitive)';
        return 'Unhealthy';
    };

    return (
        <div className="card aqi-card">
            <h3>Air Quality Index</h3>
            <div className="aqi-main">
                <div
                    className="aqi-value"
                    style={{ color: getAQIColor(data.aqi_value) }}
                >
                    {data.aqi_value}
                </div>
                <div className="aqi-meta">
                    <span className="aqi-city">📍 {data.city}</span>
                    <span
                        className="aqi-label"
                        style={{ background: getAQIColor(data.aqi_value) }}
                    >
                        {getAQILabel(data.aqi_value)}
                    </span>
                </div>
            </div>
            <div className="pollutant-grid">
                <div className="pollutant"><span>PM2.5</span><strong>{data.pm25?.toFixed(1)}</strong></div>
                <div className="pollutant"><span>PM10</span><strong>{data.pm10?.toFixed(1)}</strong></div>
                <div className="pollutant"><span>CO</span><strong>{data.co?.toFixed(1)}</strong></div>
                <div className="pollutant"><span>NO₂</span><strong>{data.no2?.toFixed(1)}</strong></div>
                <div className="pollutant"><span>O₃</span><strong>{data.o3?.toFixed(1)}</strong></div>
            </div>
        </div>
    );
};

export default AQICard;
