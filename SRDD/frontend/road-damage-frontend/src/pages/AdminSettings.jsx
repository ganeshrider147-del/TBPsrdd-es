import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminSettings = () => {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    // Forms state
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [location, setLocation] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('');
    const [email, setEmail] = useState('');

    // Password change
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    // Preferences
    const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'light');
    const [smsNotify, setSmsNotify] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('me/');
            const user = res.data;
            setProfile(user);
            setEmail(user.email || '');
            
            if (user.profile) {
                setFullName(user.profile.full_name || '');
                setPhoneNumber(user.profile.phone_number || '');
                setLocation(user.profile.location || '');
                setDepartment(user.profile.department || '');
                setDesignation(user.profile.designation || '');
            }
        } catch (err) {
            console.error('Error fetching admin profile:', err);
            setError('Failed to fetch profile settings data.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const res = await api.put('profile/update/', {
                email,
                full_name: fullName,
                phone_number: phoneNumber,
                location,
                department,
                designation
            });
            setProfile(res.data);
            setSuccessMessage('Administrator profile updated successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.error || 'Failed to update administrator profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        setIsPasswordLoading(true);
        try {
            await api.put('profile/change-password/', {
                old_password: oldPassword,
                new_password: newPassword
            });
            setSuccessMessage('Password changed successfully.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.error || 'Failed to update credentials.');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('adminTheme', newTheme);
        // Apply basic stylesheet body classes if dark mode is requested
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-lg animate-in fade-in duration-300">
            {/* Header */}
            <header className="border-b border-slate-100 pb-md">
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Platform Settings</h2>
                <p className="text-on-surface-variant font-body-md">Configure administrator accounts, Twilio service defaults, and view properties.</p>
            </header>

            {successMessage && (
                <div className="text-emerald-700 font-label-sm p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex gap-sm items-center">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div className="text-error font-label-sm p-3 bg-error-container/20 rounded-xl border border-error/20 flex gap-sm items-center">
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {/* Profile Settings */}
                <section className="md:col-span-2 bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                    <h3 className="font-headline-md text-lg font-bold text-on-surface border-b border-slate-100 pb-sm">Administrator Profile</h3>
                    
                    {isLoading && !profile ? (
                        <div className="space-y-sm">
                            <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                            <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                        </div>
                    ) : (
                        <form onSubmit={handleProfileSubmit} className="space-y-md text-xs">
                            <div className="grid grid-cols-2 gap-md">
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">User Account Name</label>
                                    <input 
                                        type="text" 
                                        disabled
                                        value={profile?.username || ''}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-sm py-2.5 outline-none font-bold text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">Email Address</label>
                                    <input 
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">Full Officer Name</label>
                                    <input 
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">Zonal Phone Contact</label>
                                    <input 
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">Municipal Office Location</label>
                                    <input 
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">Authority ID</label>
                                    <input 
                                        type="text"
                                        disabled
                                        value={profile?.profile?.admin_id || 'ADMIN-1004'}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-sm py-2.5 outline-none font-bold text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">Department Division</label>
                                    <input 
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">Officer Designation</label>
                                    <input 
                                        type="text"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="bg-primary hover:bg-primary-container text-white px-lg py-2.5 rounded-xl font-label-md font-bold transition-all shadow cursor-pointer text-xs"
                            >
                                Save Profile Changes
                            </button>
                        </form>
                    )}
                </section>

                {/* Sidebar config options */}
                <div className="space-y-lg">
                    {/* Security change credentials */}
                    <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                        <h3 className="font-headline-md text-sm font-bold text-on-surface border-b border-slate-100 pb-sm">Update Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-sm text-xs">
                            <div className="space-y-xs">
                                <label className="block text-outline font-semibold">Current Password</label>
                                <input 
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 outline-none focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-xs">
                                <label className="block text-outline font-semibold">New Password</label>
                                <input 
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 outline-none focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-xs">
                                <label className="block text-outline font-semibold">Confirm New Password</label>
                                <input 
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 outline-none focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isPasswordLoading}
                                className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl font-label-md font-bold transition-all shadow cursor-pointer text-xs"
                            >
                                {isPasswordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </section>

                    {/* Twilio SMS notifications settings */}
                    <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                        <h3 className="font-headline-md text-sm font-bold text-on-surface border-b border-slate-100 pb-sm">Service Preferences</h3>
                        <div className="space-y-sm text-xs">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="font-label-md text-on-surface font-semibold">Twilio SMS System</p>
                                    <p className="text-[10px] text-outline">Enable automated SMS tracking dispatches.</p>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={smsNotify}
                                    onChange={(e) => setSmsNotify(e.target.checked)}
                                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                />
                            </label>

                            <div className="flex justify-between items-center pt-xs border-t border-slate-100">
                                <div>
                                    <p className="font-label-md text-on-surface font-semibold">Theme Mode</p>
                                    <p className="text-[10px] text-outline">Toggle panel background contrast.</p>
                                </div>
                                <select 
                                    value={theme}
                                    onChange={(e) => handleThemeChange(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-md py-1.5 outline-none focus:ring-2 focus:ring-primary cursor-pointer text-xs"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Account operations logout */}
                    <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                        <h3 className="font-headline-md text-sm font-bold text-rose-700 border-b border-slate-100 pb-sm">Admin Sessions</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-label-md text-on-surface font-semibold text-xs">Sign Out</p>
                                <p className="text-[10px] text-outline">Securely close this session.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={logout}
                                className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-md py-2 rounded-xl text-xs font-bold transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
