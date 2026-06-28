import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const count = await notificationService.getUnreadCount();
                setUnreadCount(count);
            } catch (e) {
                // silently ignore
            }
        };
        if (user) {
            fetchUnread();
            const interval = setInterval(fetchUnread, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const citizenLinks = [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/report', icon: 'add_circle', label: 'Report Damage' },
        { path: '/my-complaints', icon: 'history', label: 'My Complaints' },
        { path: '/track', icon: 'location_searching', label: 'Track Complaint' },
        { path: '/profile', icon: 'account_circle', label: 'Profile' },
    ];

    const adminLinks = [
        { path: '/admin', icon: 'dashboard', label: 'Dashboard' },
        { path: '/admin/complaints', icon: 'assignment', label: 'Complaints' },
        { path: '/admin/analytics', icon: 'bar_chart', label: 'Analytics' },
        { path: '/admin/reports', icon: 'summarize', label: 'Reports' },
        { path: '/admin/settings', icon: 'settings', label: 'Settings' },
    ];

    const links = user?.is_staff ? adminLinks : citizenLinks;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-slate-100 flex-col z-30 shadow-sm">
            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive = location.pathname === link.path ||
                        (link.path !== '/admin' && location.pathname.startsWith(link.path));
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                                {link.icon}
                            </span>
                            <span>{link.label}</span>
                            {/* Notification badge for specific links */}
                            {link.label === 'Dashboard' && unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="p-3 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 uppercase"
                        style={{ background: user?.is_staff ? 'linear-gradient(135deg, #0f172a, #1e3a5f)' : 'linear-gradient(135deg, #3d4cad, #4f67e0)' }}>
                        {user?.username?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.is_staff ? 'Administrator' : 'Citizen'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
