import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard">🫀 AQI Cardio Monitor</Link>
            </div>
            <div className="navbar-links">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/health-input" className="nav-link">Health Input</Link>
                <Link to="/alerts" className="nav-link">Alerts</Link>
                <Link to="/history" className="nav-link">History</Link>
                {isAdmin && <Link to="/admin" className="nav-link nav-admin">Admin</Link>}
            </div>
            <div className="navbar-user">
                <Link to="/profile" className="user-profile-link">
                    <span className="user-avatar-small">{user?.name ? user.name[0].toUpperCase() : '👤'}</span>
                    <span className="user-name">{user?.name}</span>
                </Link>
                <span className="user-role">{user?.role}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
