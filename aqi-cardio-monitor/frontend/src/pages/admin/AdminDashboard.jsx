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

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update role');
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
                    {isSuperAdmin && (
                        <button
                            className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
                            onClick={() => setActiveTab('system')}
                        >
                            🛡️ System Management
                        </button>
                    )}
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
                                                {isSuperAdmin ? (
                                                    <select 
                                                        value={u.role} 
                                                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                                                        className="role-selector"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="superadmin">SuperAdmin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`badge role-${u.role}`}>{u.role}</span>
                                                )}
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
                ) : activeTab === 'records' ? (
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
                ) : (
                    <section className="admin-content-card">
                        <div className="card-header">
                            <h3>🛡️ System Management</h3>
                            <p>Global system controls and security monitoring.</p>
                        </div>
                        
                        <div className="system-grid">
                            <div className="system-control-card">
                                <h4>API Configuration</h4>
                                <div className="control-item">
                                    <label>OpenWeather API Status</label>
                                    <span className="status-indicator online">Online</span>
                                </div>
                                <div className="control-item">
                                    <label>ML Model Strategy</label>
                                    <span className="strategy-tag">RandomForestV2</span>
                                </div>
                                <button className="secondary-btn">Rotate API Keys</button>
                            </div>

                            <div className="system-control-card">
                                <h4>Security Logs</h4>
                                <div className="log-list">
                                    <div className="log-entry">
                                        <span className="log-time">10:24 AM</span>
                                        <span className="log-msg">Role change: user_12 to admin</span>
                                    </div>
                                    <div className="log-entry">
                                        <span className="log-time">09:15 AM</span>
                                        <span className="log-msg">Failed login attempt from 192.168.1.1</span>
                                    </div>
                                    <div className="log-entry">
                                        <span className="log-time">Yesterday</span>
                                        <span className="log-msg">Database backup completed</span>
                                    </div>
                                </div>
                                <button className="secondary-btn">View Full Logs</button>
                            </div>

                            <div className="system-control-card">
                                <h4>Alerting Engine</h4>
                                <div className="control-item">
                                    <label>Socket.io Connections</label>
                                    <span className="conn-count">12 Active</span>
                                </div>
                                <div className="control-item">
                                    <label>Auto-Cleanup History</label>
                                    <span className="status-indicator online">Enabled</span>
                                </div>
                                <button className="secondary-btn">Clear Alert Cache</button>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
