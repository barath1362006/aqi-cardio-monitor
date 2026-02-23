import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HealthInput from './pages/HealthInput';
import Alerts from './pages/Alerts';
import History from './pages/History';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

/* Protected route wrapper — redirects to login if not authenticated */
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/" replace />;
};

/* Admin route wrapper — redirects to dashboard if not admin */
const AdminRoute = ({ children }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn) return <Navigate to="/" replace />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
};

/* Layout wrapper with Navbar for authenticated pages */
const AuthLayout = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return (
        <>
            {isLoggedIn && <Navbar />}
            <main className="main-content">
                {children}
            </main>
        </>
    );
};

function AppRoutes() {
    return (
        <AuthLayout>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/health-input" element={
                    <ProtectedRoute><HealthInput /></ProtectedRoute>
                } />
                <Route path="/alerts" element={
                    <ProtectedRoute><Alerts /></ProtectedRoute>
                } />
                <Route path="/history" element={
                    <ProtectedRoute><History /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <AdminRoute><AdminDashboard /></AdminRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthLayout>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
