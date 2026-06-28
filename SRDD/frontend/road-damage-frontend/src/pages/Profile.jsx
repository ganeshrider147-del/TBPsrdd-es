import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import api from '../services/api';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [myComplaints, setMyComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    // Form inputs state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [email, setEmail] = useState('');

    // Change Password inputs state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Fetch profile data
            const profileRes = await api.get('me/');
            const userData = profileRes.data;
            setProfile(userData);
            setEmail(userData.email || '');

            if (userData.profile) {
                setFullName(userData.profile.full_name || '');
                setPhone(userData.profile.phone_number || '');
                setLocation(userData.profile.location || '');
            }

            // Fetch citizen's complaints list
            const complaintsRes = await complaintService.getMyList();
            setMyComplaints(complaintsRes.data || []);
        } catch (err) {
            console.error('Error fetching profile settings:', err);
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
                phone_number: phone,
                location
            });
            setProfile(res.data);
            setSuccessMessage('Profile information saved successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.error || 'Failed to save changes.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
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

    // Statistical variables
    const totalReports = myComplaints.length;
    const resolvedReports = myComplaints.filter(c => c.status === 'Completed' || c.status === 'Closed').length;
    const activeReports = totalReports - resolvedReports;

    return (
        <div className="max-w-4xl mx-auto space-y-lg animate-in fade-in duration-300">
            <div className="space-y-xs">
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">User Profile</h2>
                <p className="text-on-surface-variant font-body-md">Manage your account information, contact preferences, and track your activity statistics.</p>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg items-start">
                {/* Left pane: Profile summary + stats */}
                <div className="space-y-md">
                    <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 text-center space-y-md">
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl uppercase shadow-sm mx-auto">
                            {user?.username?.[0] || 'U'}
                        </div>
                        <div>
                            <h3 className="font-headline-md text-lg font-bold text-on-surface">{user?.username}</h3>
                            <p className="text-xs text-on-surface-variant">{user?.email}</p>
                            <span className="inline-block mt-xs bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {user?.is_staff ? 'Administrator' : 'Citizen'}
                            </span>
                        </div>
                    </section>

                    <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                        <h4 className="font-headline-md text-sm font-bold text-on-surface border-b border-slate-100 pb-xs">My Activity Statistics</h4>
                        <div className="grid grid-cols-3 gap-sm text-center">
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                                <span className="text-lg font-bold text-on-surface block">{totalReports}</span>
                                <span className="text-[9px] text-outline font-bold uppercase">Reported</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                                <span className="text-lg font-bold text-blue-600 block">{activeReports}</span>
                                <span className="text-[9px] text-outline font-bold uppercase">Active</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                                <span className="text-lg font-bold text-emerald-600 block">{resolvedReports}</span>
                                <span className="text-[9px] text-outline font-bold uppercase">Resolved</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right/Middle pane: Forms */}
                <div className="md:col-span-2 space-y-lg">
                    {/* General Profile fields */}
                    <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                        <h3 className="font-headline-md text-base font-bold text-on-surface border-b border-slate-100 pb-sm">Account Details</h3>
                        <form onSubmit={handleProfileSubmit} className="space-y-md text-xs">
                            <div className="grid grid-cols-2 gap-md">
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">User Username</label>
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
                                    <label className="block text-outline font-semibold">Full / Display Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2 sm:col-span-1">
                                    <label className="block text-outline font-semibold">Phone Contact (SMS tracking)</label>
                                    <input 
                                        type="text"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs col-span-2">
                                    <label className="block text-outline font-semibold">Home / Regional Location Address</label>
                                    <input 
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-sm border-t border-slate-100">
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-primary hover:bg-primary-container text-white px-lg py-2.5 rounded-xl font-label-md font-bold transition-all shadow cursor-pointer disabled:opacity-75"
                                >
                                    {isLoading ? 'Saving...' : 'Save Profile Details'}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Change Credentials */}
                    <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                        <h3 className="font-headline-md text-base font-bold text-on-surface border-b border-slate-100 pb-sm">Update Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-md text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                                <div className="space-y-xs">
                                    <label className="block text-outline font-semibold">Current Password</label>
                                    <input 
                                        type="password"
                                        required
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="block text-outline font-semibold">New Password</label>
                                    <input 
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="block text-outline font-semibold">Confirm Password</label>
                                    <input 
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 outline-none focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-sm border-t border-slate-100">
                                <button 
                                    type="submit"
                                    disabled={isPasswordLoading}
                                    className="bg-primary hover:bg-primary-container text-white px-lg py-2.5 rounded-xl font-label-md font-bold transition-all shadow cursor-pointer"
                                >
                                    {isPasswordLoading ? 'Changing Password...' : 'Save Password'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;
