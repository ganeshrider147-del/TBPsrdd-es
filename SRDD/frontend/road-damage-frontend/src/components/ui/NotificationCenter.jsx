import React, { useEffect, useState, useRef } from 'react';
import { notificationService } from '../../services/notificationService';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const NotificationCenter = ({ onClose, onCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const panelRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await notificationService.getNotifications();
            setNotifications(res.data || []);
            const unread = (res.data || []).filter(n => !n.is_read).length;
            if (onCountChange) onCountChange(unread);
        } catch (e) {
            console.error('Failed to load notifications:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        const unread = notifications.filter(n => !n.is_read && n.id !== id).length;
        if (onCountChange) onCountChange(unread);
    };

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        if (onCountChange) onCountChange(0);
    };

    const typeConfig = {
        success: { bg: 'bg-emerald-50 border-emerald-200', icon: 'check_circle', iconColor: 'text-emerald-600', dot: 'bg-emerald-500' },
        warning: { bg: 'bg-amber-50 border-amber-200', icon: 'warning', iconColor: 'text-amber-600', dot: 'bg-amber-500' },
        error: { bg: 'bg-red-50 border-red-200', icon: 'error', iconColor: 'text-red-600', dot: 'bg-red-500' },
        info: { bg: 'bg-blue-50 border-blue-200', icon: 'info', iconColor: 'text-blue-600', dot: 'bg-blue-500' },
    };

    const unreadNotifications = notifications.filter(n => !n.is_read);
    const readNotifications = notifications.filter(n => n.is_read);

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div ref={panelRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
            style={{ maxHeight: '80vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Notifications</span>
                    {unreadNotifications.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                            {unreadNotifications.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadNotifications.length > 0 && (
                        <button onClick={handleMarkAllRead}
                            className="text-xs text-indigo-600 font-semibold hover:underline">
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
                {isLoading ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-3xl text-indigo-400">progress_activity</span>
                        <p className="text-slate-400 text-sm">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-3 text-center px-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-400 text-2xl">notifications_none</span>
                        </div>
                        <p className="font-semibold text-slate-700">No notifications yet</p>
                        <p className="text-slate-400 text-sm">You'll be notified when your complaint status changes.</p>
                    </div>
                ) : (
                    <>
                        {unreadNotifications.length > 0 && (
                            <div>
                                <div className="px-5 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                                    New
                                </div>
                                {unreadNotifications.map(n => {
                                    const cfg = typeConfig[n.type] || typeConfig.info;
                                    return (
                                        <div key={n.id}
                                            className="px-5 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => handleMarkRead(n.id)}>
                                            <div className="flex gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border`}>
                                                    <span className={`material-symbols-outlined text-[18px] ${cfg.iconColor}`}
                                                        style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-semibold text-slate-900 text-sm leading-snug">{n.title}</p>
                                                        <span className="text-slate-400 text-xs flex-shrink-0">{formatTime(n.created_at)}</span>
                                                    </div>
                                                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{n.message}</p>
                                                    {n.complaint && (
                                                        <Link to={`${ROUTES.TRACK}?id=${n.complaint}`}
                                                            className="text-indigo-600 text-xs font-semibold mt-1 hover:underline inline-block"
                                                            onClick={onClose}>
                                                            View complaint →
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${cfg.dot}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {readNotifications.length > 0 && (
                            <div>
                                <div className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                                    Earlier
                                </div>
                                {readNotifications.slice(0, 10).map(n => {
                                    const cfg = typeConfig[n.type] || typeConfig.info;
                                    return (
                                        <div key={n.id} className="px-5 py-3 border-b border-slate-50 opacity-70">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100">
                                                    <span className={`material-symbols-outlined text-[16px] text-slate-400`}>{cfg.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-medium text-slate-700 text-sm leading-snug">{n.title}</p>
                                                        <span className="text-slate-300 text-xs flex-shrink-0">{formatTime(n.created_at)}</span>
                                                    </div>
                                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
