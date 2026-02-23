import React, { useState } from 'react';
import './Components.css';

const HistoryTable = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    if (!data || data.length === 0) {
        return (
            <div className="card">
                <h3>Records History</h3>
                <p className="no-data">No records found.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageData = data.slice(startIdx, startIdx + rowsPerPage);

    return (
        <div className="card history-table-card">
            <h3>Records History</h3>
            <div className="table-wrapper">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>AQI</th>
                            <th>PM2.5</th>
                            <th>Heart Rate</th>
                            <th>BP (Systolic)</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                                <td>{row.aqi_value ?? '-'}</td>
                                <td>{row.pm25?.toFixed(1) ?? '-'}</td>
                                <td>{row.heart_rate ?? '-'}</td>
                                <td>{row.systolic_bp ?? '-'}</td>
                                <td>
                                    <span className={`risk-tag risk-${(row.risk_label || 'na').toLowerCase()}`}>
                                        {row.risk_label || 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ← Prev
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default HistoryTable;
