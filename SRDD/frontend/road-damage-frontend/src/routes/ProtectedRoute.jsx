import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">Loading Road Detector...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !user.is_staff) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (!adminOnly && user.is_staff && window.location.pathname === '/dashboard') {
         return <Navigate to="/admin" replace />;
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

export default ProtectedRoute;
