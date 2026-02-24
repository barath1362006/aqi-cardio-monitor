import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, isAdmin, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard', { replace: true });
            return;
        }
        fetchAdminData();
    }, [isAdmin, navigate]);

    const fetchAdminData = async () => {
        try {
            const [usersRes, recordsRes] = await Promise.all([
                api.get('/api/admin/users'),
                api.get('/api/admin/records'),
            ]);

            setUsers(usersRes.data);
            setRecords(recordsRes.data);
        } catch (err) {
            setError('Failed to load admin data.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter((u) => u.user_id !== userId));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalUsers: users.length,
        totalRecords: records.length,
        highRisk: records.filter(r => r.systolic_bp > 140 || r.heart_rate > 100).length
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Accessing Secure Admin Panel...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">⚙️</span>
                    <h3>Admin Console</h3>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 User Management
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
                        onClick={() => setActiveTab('records')}
                    >
                        📊 Health Records
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-avatar">{user?.name?.[0].toUpperCase()}</div>
                        <div className="admin-meta">
                            <p className="admin-name">{user.name}</p>
                            <span className="admin-badge">{user.role}</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Dashboard Overview</h1>
                    <p>Manage system users and monitor cardiovascular health reports.</p>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Users</div>
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-icon">👥</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Health Logs</div>
                        <div className="stat-value">{stats.totalRecords}</div>
                        <div className="stat-icon">📝</div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-label">Critical Risks</div>
                        <div className="stat-value">{stats.highRisk}</div>
                        <div className="stat-icon">⚠️</div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {activeTab === 'users' ? (
                    <section className="admin-content-card">
                        <div className="card-header">
                            <h3>Registered Users</h3>
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Age</th>
                                        <th>Role</th>
                                        <th>Joined Date</th>
                                        {isSuperAdmin && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.user_id}>
                                            <td>
                                                <div className="user-info-cell">
                                                    <span className="user-name">{u.name}</span>
                                                    <span className="user-email">{u.email}</span>
                                                </div>
                                            </td>
                                            <td>{u.age || '-'}</td>
                                            <td>
                                                <span className={`badge role-${u.role}`}>{u.role}</span>
                                            </td>
                                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                            {isSuperAdmin && (
                                                <td>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteUser(u.user_id, u.name)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : (
                    <section className="admin-content-card">
                        <div className="card-header">
                            <h3>Global Health Records</h3>
                        </div>
                        <div className="table-wrapper">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Heart Rate</th>
                                        <th>Blood Pressure</th>
                                        <th>Status</th>
                                        <th>Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((r) => {
                                        const isHigh = r.systolic_bp > 140 || r.heart_rate > 100;
                                        return (
                                            <tr key={r.record_id}>
                                                <td><strong>{r.user_name}</strong></td>
                                                <td>{r.heart_rate} bpm</td>
                                                <td>{r.systolic_bp}/{r.diastolic_bp} mmHg</td>
                                                <td>
                                                    <span className={`status-pill ${isHigh ? 'danger' : 'safe'}`}>
                                                        {isHigh ? 'High Risk' : 'Normal'}
                                                    </span>
                                                </td>
                                                <td>{new Date(r.recorded_at).toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
