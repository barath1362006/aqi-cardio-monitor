import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Components.css';

const AQIChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="card chart-card">
                <h3>AQI Trend (Last 7 Days)</h3>
                <p className="no-data">No AQI history available</p>
            </div>
        );
    }

    // Format data for chart
    const chartData = [...data].reverse().map((item) => ({
        date: new Date(item.fetched_at).toLocaleDateString('en-IN', {
            month: 'short', day: 'numeric'
        }),
        AQI: item.aqi_value,
        'PM2.5': item.pm25,
    }));

    return (
        <div className="card chart-card">
            <h3>AQI Trend (Last 7 Days)</h3>
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
                        dataKey="AQI"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="PM2.5"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AQIChart;
