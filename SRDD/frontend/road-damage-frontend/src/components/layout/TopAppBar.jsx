import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const TopAppBar = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [fullProfile, setFullProfile] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('me/');
                setFullProfile(response.data);
            } catch (error) {
                console.error("Error fetching header profile info", error);
            }
        };
        if (user) {
            fetchProfile();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/');
    };

    const isStaff = user?.is_staff;
    const displayName = fullProfile?.profile?.full_name || user?.username || 'User';
    const displayPhone = fullProfile?.profile?.phone_number || 'No phone set';

    return (
        <nav className="fixed top-0 w-full z-40 bg-white border-b border-slate-100 shadow-sm h-16">
            <div className="flex items-center justify-between px-md h-full w-full max-w-7xl mx-auto relative">
                <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 transition-transform" data-icon="menu">menu</span>
                    <h1 className="font-headline-md text-[18px] font-bold tracking-tight text-primary font-sans uppercase">
                        Road Detector
                    </h1>
                </div>

                <div className="flex items-center gap-sm relative" ref={dropdownRef}>
                    {/* User profile avatar clickable */}
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm uppercase shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform border border-indigo-100 outline-none"
                    >
                        {user?.username?.[0] || 'U'}
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 top-11 w-64 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Profile Info Summary */}
                            <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm uppercase">
                                    {user?.username?.[0] || 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 truncate leading-snug">{displayName}</p>
                                    <p className="text-[10px] text-slate-400 truncate leading-snug">{fullProfile?.email || user?.email}</p>
                                    <span className="inline-block mt-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider">
                                        {isStaff ? 'Administrator' : 'Citizen'}
                                    </span>
                                </div>
                            </div>

                            {/* Additional Metadata Info */}
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                                <p><strong>Phone:</strong> {displayPhone}</p>
                                {isStaff && fullProfile?.profile?.department && (
                                    <p><strong>Dept:</strong> {fullProfile.profile.department}</p>
                                )}
                            </div>

                            {/* Menu Links */}
                            <div className="py-1">
                                {isStaff ? (
                                    <>
                                        <Link 
                                            to="/admin/settings" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                                            My Profile
                                        </Link>
                                        <Link 
                                            to="/admin" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">dashboard</span>
                                            Dashboard
                                        </Link>
                                        <Link 
                                            to="/admin/complaints" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">assignment</span>
                                            Complaint Management
                                        </Link>
                                        <Link 
                                            to="/admin/reports" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">summarize</span>
                                            Reports
                                        </Link>
                                        <Link 
                                            to="/admin/settings" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">settings</span>
                                            Settings & Credentials
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link 
                                            to="/profile" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                                            My Profile
                                        </Link>
                                        <Link 
                                            to="/my-complaints" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">history</span>
                                            Complaint History
                                        </Link>
                                        <Link 
                                            to="/settings" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">settings</span>
                                            Settings & Preferences
                                        </Link>
                                    </>
                                )}

                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-rose-50 font-medium border-t border-slate-100 mt-1 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-red-400">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default TopAppBar;
