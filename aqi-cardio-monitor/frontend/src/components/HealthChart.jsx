import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Components.css';

const HealthChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="card chart-card">
                <h3>Health Metrics Trend</h3>
                <p className="no-data">No health data available. Submit your first reading!</p>
            </div>
        );
    }

    // Format and reverse for chronological order
    const chartData = [...data].reverse().map((item) => ({
        date: new Date(item.recorded_at).toLocaleDateString('en-IN', {
            month: 'short', day: 'numeric'
        }),
        'Systolic BP': item.systolic_bp,
        'Heart Rate': item.heart_rate,
    }));

    return (
        <div className="card chart-card">
            <h3>Health Metrics Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} />
                    <YAxis fontSize={12} tickLine={false} />
                    <Tooltip
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="Systolic BP"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Heart Rate"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HealthChart;
