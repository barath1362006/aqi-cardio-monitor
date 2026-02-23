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

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard', { replace: true });
            return;
        }
        fetchAdminData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAdminData = async () => {
        try {
            const headers = { 'X-User-Role': user.role };

            const [usersRes, recordsRes] = await Promise.all([
                api.get('/api/admin/users', { headers }),
                api.get('/api/admin/records', { headers }),
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
            await api.delete(`/api/admin/users/${userId}`, {
                headers: { 'X-User-Role': user.role },
            });
            setUsers(users.filter((u) => u.user_id !== userId));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading-spinner"></div>
                <p>Loading admin panel...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h2>⚙️ Admin Panel</h2>
                <nav>
                    <a href="#users" className="sidebar-link active">Users</a>
                    <a href="#records" className="sidebar-link">Health Records</a>
                </nav>
                <div className="sidebar-info">
                    <span>Logged in as</span>
                    <strong>{user.name}</strong>
                    <span className="role-tag">{user.role}</span>
                </div>
            </aside>

            <main className="admin-main">
                {error && <div className="error-message">{error}</div>}

                {/* Users Table */}
                <section id="users" className="admin-section">
                    <h3>All Users ({users.length})</h3>
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Age</th>
                                    <th>Role</th>
                                    <th>Created</th>
                                    {isSuperAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.user_id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.age || '-'}</td>
                                        <td>
                                            <span className={`role-badge role-${u.role}`}>{u.role}</span>
                                        </td>
                                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                        {isSuperAdmin && (
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteUser(u.user_id, u.name)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Health Records Table */}
                <section id="records" className="admin-section">
                    <h3>Recent Health Records ({records.length})</h3>
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Heart Rate</th>
                                    <th>Systolic BP</th>
                                    <th>Diastolic BP</th>
                                    <th>Recorded At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r) => (
                                    <tr key={r.record_id}>
                                        <td>{r.user_name}</td>
                                        <td>{r.heart_rate}</td>
                                        <td>{r.systolic_bp}</td>
                                        <td>{r.diastolic_bp}</td>
                                        <td>{new Date(r.recorded_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
