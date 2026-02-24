import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileSetup from '../components/ProfileSetup';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [showEdit, setShowEdit] = useState(false);

    if (!user) return <div className="profile-container">Loading...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="profile-title">
                        <h1>{user.name}</h1>
                        <p className="profile-email">{user.email}</p>
                        <span className="badge-role">{user.role}</span>
                    </div>
                </div>

                <div className="profile-details">
                    <section className="detail-section">
                        <h2>Health Profile</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Age</label>
                                <p>{user.age || 'Not set'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Smoking Status</label>
                                <p className="capitalize">{user.smoking_status || 'no'}</p>
                            </div>
                            <div className="detail-item full-width">
                                <label>Existing Conditions</label>
                                <p>{user.existing_conditions || 'None'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="detail-section">
                        <h2>Account Information</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>User ID</label>
                                <p>#{user.user_id}</p>
                            </div>
                            <div className="detail-item">
                                <label>Member Since</label>
                                <p>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="profile-actions">
                    <button className="btn-secondary" onClick={() => setShowEdit(true)}>
                        Edit Profile Details
                    </button>
                </div>
            </div>

            {showEdit && (
                <ProfileSetup onComplete={() => setShowEdit(false)} />
            )}
        </div>
    );
};

export default Profile;
