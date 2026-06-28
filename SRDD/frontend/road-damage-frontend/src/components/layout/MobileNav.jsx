import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MobileNav = () => {
    const { user } = useAuth();
    const location = useLocation();

    const homePath = user?.is_staff ? '/admin' : '/dashboard';

    const navItems = [
        { path: homePath, icon: 'home', label: 'Home' },
        { path: '/report', icon: 'add_box', label: 'Report' },
        { path: '/track', icon: 'query_stats', label: 'Track' },
        { path: '/my-complaints', icon: 'person', label: 'Profile' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-white/90 dark:bg-inverse-surface/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-16 px-sm pb-safe">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.path}
                            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 active:scale-90 transition-transform duration-150 ${
                                isActive 
                                ? 'bg-primary-container text-on-primary-container' 
                                : 'text-on-surface-variant opacity-70 hover:text-primary hover:opacity-100'
                            }`} 
                            to={item.path}
                        >
                            <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
                            <span className="font-label-sm text-[10px] mt-0.5">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
