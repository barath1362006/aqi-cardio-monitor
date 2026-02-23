import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Restore user from localStorage if available
        const saved = localStorage.getItem('aqi_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (userData) => {
        // userData: { user_id, name, role }
        setUser(userData);
        localStorage.setItem('aqi_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('aqi_user');
    };

    const isLoggedIn = !!user;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isSuperAdmin = user?.role === 'superadmin';

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn, isAdmin, isSuperAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
