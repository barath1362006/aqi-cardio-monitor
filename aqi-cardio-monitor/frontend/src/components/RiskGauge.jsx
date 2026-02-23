import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import './Components.css';

const RiskGauge = ({ riskScore }) => {
    const percentage = Math.round(riskScore * 100);

    const getColor = (score) => {
        if (score < 0.4) return '#22c55e';
        if (score < 0.7) return '#f97316';
        return '#ef4444';
    };

    const getLabel = (score) => {
        if (score < 0.4) return 'Low Risk';
        if (score < 0.7) return 'Moderate Risk';
        return 'High Risk';
    };

    const color = getColor(riskScore);

    const chartData = [
        {
            name: 'Risk',
            value: percentage,
            fill: color,
        },
    ];

    return (
        <div className="card gauge-card">
            <h3>Risk Gauge</h3>
            <div className="gauge-container">
                <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                        barSize={18}
                    >
                        <RadialBar
                            dataKey="value"
                            background={{ fill: '#f3f4f6' }}
                            cornerRadius={10}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="gauge-center">
                    <span className="gauge-value" style={{ color }}>{percentage}%</span>
                    <span className="gauge-label">{getLabel(riskScore)}</span>
                </div>
            </div>
        </div>
    );
};

export default RiskGauge;
