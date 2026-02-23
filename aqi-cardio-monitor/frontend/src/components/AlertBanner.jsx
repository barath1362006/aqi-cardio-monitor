import React from 'react';
import './Components.css';

const AlertBanner = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="alert-banner">
            <span className="alert-banner-icon">⚠️</span>
            <span className="alert-banner-text">{message}</span>
            <button className="alert-banner-close" onClick={onClose}>✕</button>
        </div>
    );
};

export default AlertBanner;
