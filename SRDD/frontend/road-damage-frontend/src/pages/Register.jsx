import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ROUTES } from '../constants/routes';

const Register = () => {
    const [accountType, setAccountType] = useState('citizen');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [adminId, setAdminId] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const navigate = useNavigate();

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!username || !email || !password) {
            setError('Please complete all required fields.');
            return;
        }
        if (accountType === 'citizen' && (!fullName || !phone)) {
            setError('Full name and phone number are required for citizen accounts.');
            return;
        }
        if (accountType === 'administrator' && (!adminId || !department || !designation)) {
            setError('Admin ID, department and designation are required for administrator accounts.');
            return;
        }

        const payload = {
            username, email, password,
            account_type: accountType,
            full_name: fullName,
            phone_number: phone,
            location,
            admin_id: adminId,
            department,
            designation,
        };

        setIsLoading(true);
        try {
            await authService.register(payload);
            navigate(accountType === 'administrator' ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN);
        } catch (err) {
            const errorData = err.response?.data;
            let errorMsg = 'Registration failed. Please try again.';
            if (errorData) {
                if (errorData.username) errorMsg = `Username: ${errorData.username[0]}`;
                else if (errorData.email) errorMsg = `Email: ${errorData.email[0]}`;
                else if (typeof errorData.detail === 'string') errorMsg = errorData.detail;
                else if (typeof errorData.error === 'string') errorMsg = errorData.error;
            }
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const isCitizen = accountType === 'citizen';

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Panel */}
            <div className="hidden lg:flex w-[460px] flex-shrink-0 relative overflow-hidden items-center justify-center"
                style={{ background: 'linear-gradient(145deg, #1a1a3e 0%, #2d2f6e 50%, #4f67e0 100%)' }}>
                <div className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
                <div className="absolute bottom-[-40px] left-[-40px] w-56 h-56 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />

                <div className={`relative z-10 text-white max-w-sm px-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>road</span>
                        </div>
                        <span className="font-bold text-xl font-sans">Road Detector</span>
                    </div>

                    <h2 className="text-3xl font-bold leading-snug mb-4">
                        Join the movement for<br />
                        <span style={{ color: '#93c5fd' }}>better roads.</span>
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed mb-10">
                        Create your account and start making an impact. Every report you submit improves road safety for your community.
                    </p>

                    {/* How it works */}
                    <div className="space-y-5">
                        {[
                            { num: '1', title: 'Create account', desc: 'Register as citizen or administrator in under a minute.' },
                            { num: '2', title: 'Report damage', desc: 'Upload a photo — our system handles the rest automatically.' },
                            { num: '3', title: 'Track & receive updates', desc: 'Get SMS notifications as your report moves to resolution.' },
                        ].map((s) => (
                            <div key={s.num} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                                    style={{ background: 'rgba(255,255,255,0.15)', color: '#93c5fd' }}>{s.num}</div>
                                <div>
                                    <div className="text-white font-semibold text-sm">{s.title}</div>
                                    <div className="text-white/50 text-xs leading-relaxed">{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
                <div className={`w-full max-w-lg transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #3d4cad, #4f67e0)' }}>
                            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>road</span>
                        </div>
                        <span className="font-bold text-slate-800 font-sans">Road Detector</span>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Create your account</h1>
                        <p className="text-slate-500 text-sm">Join the platform and start reporting road hazards.</p>
                    </div>

                    {/* Account Type Selector */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                            { value: 'citizen', icon: 'person', label: 'Citizen', desc: 'Report and track road issues' },
                            { value: 'administrator', icon: 'admin_panel_settings', label: 'Administrator', desc: 'Manage and resolve complaints' },
                        ].map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => { setAccountType(t.value); setError(''); }}
                                className={`relative rounded-2xl p-4 text-left transition-all border-2 ${
                                    accountType === t.value
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                {accountType === t.value && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-[12px]">check</span>
                                    </div>
                                )}
                                <span className={`material-symbols-outlined text-2xl mb-1.5 block ${accountType === t.value ? 'text-indigo-600' : 'text-slate-400'}`}
                                    style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                                <div className={`font-bold text-sm ${accountType === t.value ? 'text-indigo-700' : 'text-slate-700'}`}>{t.label}</div>
                                <div className="text-slate-400 text-xs mt-0.5">{t.desc}</div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">error</span>
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {/* Personal info header */}
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                {isCitizen ? 'Citizen Information' : 'Administrator Information'}
                            </h3>

                            {isCitizen && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" required
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" required
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-slate-700">City / Area</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">location_on</span>
                                                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Hyderabad, TS"
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {!isCitizen && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Admin / Employee ID *</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">badge</span>
                                            <input type="text" value={adminId} onChange={e => setAdminId(e.target.value)} placeholder="ADM-2026-001" required
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-slate-700">Department *</label>
                                            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Public Works" required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-slate-700">Designation *</label>
                                            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Road Inspector" required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Divider */}
                            <div className="pt-2">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Account Credentials</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Username *</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">alternate_email</span>
                                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe123" required
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Email *</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Password *</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required
                                            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Confirm Password *</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_reset</span>
                                        <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required
                                            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-symbols-outlined text-lg">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
                                style={{ background: isLoading ? '#6b7280' : 'linear-gradient(135deg, #3d4cad, #4f67e0)' }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create {isCitizen ? 'Citizen' : 'Administrator'} Account
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to={ROUTES.LOGIN} className="text-center text-sm text-slate-500 hover:text-indigo-600 font-medium">
                                Already a citizen? <span className="text-indigo-600 font-semibold">Sign in →</span>
                            </Link>
                            <span className="hidden sm:block text-slate-300">|</span>
                            <Link to={ROUTES.ADMIN_LOGIN} className="text-center text-sm text-slate-500 hover:text-slate-700 font-medium">
                                Admin login →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
