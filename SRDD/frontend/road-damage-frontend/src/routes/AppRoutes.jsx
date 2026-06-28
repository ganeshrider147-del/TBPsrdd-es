import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import AdminLogin from '../pages/AdminLogin';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ReportDamage from '../pages/ReportDamage';
import MyComplaints from '../pages/MyComplaints';
import TrackComplaint from '../pages/TrackComplaint';
import AdminDashboard from '../pages/AdminDashboard';
import AdminComplaints from '../pages/AdminComplaints';
import AdminAnalytics from '../pages/AdminAnalytics';
import AdminReports from '../pages/AdminReports';
import AdminSettings from '../pages/AdminSettings';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const AppRoutes = () => {
    const { user } = useAuth();
    
    return (
        <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<Landing />} />
            <Route path={ROUTES.LOGIN} element={user ? <Navigate to={user.is_staff ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace /> : <Login />} />
            <Route path={ROUTES.ADMIN_LOGIN} element={user ? <Navigate to={user.is_staff ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace /> : <AdminLogin />} />
            <Route path={ROUTES.REGISTER} element={user ? <Navigate to={user.is_staff ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace /> : <Register />} />
            <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
            
            {/* Citizen Protected Routes */}
            <Route element={<ProtectedRoute adminOnly={false} />}>
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.REPORT} element={<ReportDamage />} />
                <Route path={ROUTES.HISTORY} element={<MyComplaints />} />
                <Route path={ROUTES.TRACK} element={<TrackComplaint />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.SETTINGS} element={<Settings />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
                <Route path={ROUTES.ADMIN_COMPLAINTS} element={<AdminComplaints />} />
                <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalytics />} />
                <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReports />} />
                <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettings />} />
            </Route>

            {/* 404 Catch All */}
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
