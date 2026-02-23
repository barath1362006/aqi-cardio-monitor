import React from 'react';
import './Components.css';

const RiskBadge = ({ riskLabel, riskScore }) => {
    const getColor = (label) => {
        switch (label) {
            case 'Low': return '#22c55e';
            case 'Moderate': return '#f97316';
            case 'High': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const getBgColor = (label) => {
        switch (label) {
            case 'Low': return '#f0fdf4';
            case 'Moderate': return '#fffbeb';
            case 'High': return '#fef2f2';
            default: return '#f9fafb';
        }
    };

    return (
        <div className="card risk-badge-card" style={{ borderColor: getColor(riskLabel) }}>
            <h3>Risk Level</h3>
            <div className="risk-badge-content">
                <div
                    className="risk-badge"
                    style={{
                        background: getBgColor(riskLabel),
                        color: getColor(riskLabel),
                        borderColor: getColor(riskLabel)
                    }}
                >
                    {riskLabel}
                </div>
                <div className="risk-score">
                    <span className="score-value" style={{ color: getColor(riskLabel) }}>
                        {(riskScore * 100).toFixed(1)}%
                    </span>
                    <span className="score-label">Confidence Score</span>
                </div>
            </div>
        </div>
    );
};

export default RiskBadge;
