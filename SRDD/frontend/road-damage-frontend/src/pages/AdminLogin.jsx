import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { login, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(username, password);
            if (!user?.is_staff) {
                logout();
                setError('Unauthorized. This portal is reserved for verified administrators only.');
                return;
            }
            navigate(ROUTES.ADMIN);
        } catch (err) {
            setError('Invalid administrator credentials. Please verify and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        { label: 'Complaints Today', value: 'Live', icon: 'assignment' },
        { label: 'Damage Reports', value: '99.2%', icon: 'auto_awesome' },
        { label: 'Avg. Resolution', value: '48h', icon: 'timer' },
    ];

    return (
        <div className="min-h-screen flex bg-slate-950">
            {/* Left Panel — Dark Command Center */}
            <div className="hidden lg:flex w-[540px] flex-shrink-0 relative overflow-hidden items-center justify-center">
                {/* Background gradient */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(145deg, #0f0f23 0%, #1a1a3e 50%, #1e2d5a 100%)' }} />

                {/* Decorative accents */}
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />

                <div className={`relative z-10 text-white max-w-md px-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        Secure Government Portal
                    </div>

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                            <span className="material-symbols-outlined text-blue-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                        </div>
                        <div>
                            <span className="font-bold text-xl tracking-tight block text-white font-sans">Road Detector</span>
                            <span className="text-xs text-slate-400 uppercase tracking-widest">Administrator Operations</span>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold leading-tight mb-4 text-white">
                        Command &<br />
                        <span style={{ color: '#60a5fa' }}>Control Center</span>
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed mb-10">
                        Enterprise-grade infrastructure management. Oversee damage analysis, dispatch repair crews, and monitor city-wide road health in real time.
                    </p>

                    {/* Mini stat cards */}
                    <div className="grid grid-cols-3 gap-3 mb-10">
                        {statCards.map((s, i) => (
                            <div key={i} className="rounded-xl p-3 text-center"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <span className="material-symbols-outlined text-blue-400 text-xl mb-1 block">{s.icon}</span>
                                <div className="font-bold text-white text-sm">{s.value}</div>
                                <div className="text-slate-500 text-[10px] uppercase tracking-wider leading-tight">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Access level indicator */}
                    <div className="rounded-xl p-4"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-red-400 text-[18px]">security</span>
                            <span className="text-red-400 text-sm font-bold uppercase tracking-wide">Restricted Access</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            This portal is exclusively for authorized government administrators. All access attempts are logged and monitored.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-50">
                <div className={`w-full max-w-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900">
                            <span className="material-symbols-outlined text-blue-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 block text-sm font-sans">Road Detector</span>
                            <span className="text-slate-400 text-xs">Admin Portal</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">Admin Sign In</h1>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-900 text-blue-400">Secure Gateway</span>
                        </div>
                        <p className="text-slate-500">Access the operations dashboard and manage road infrastructure.</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">lock</span>
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700" htmlFor="admin-username">Admin Username</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">badge</span>
                                    <input
                                        id="admin-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="admin.username"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700" htmlFor="admin-password">Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        id="admin-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        required
                                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                                style={{ background: isLoading ? '#374151' : 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Verifying credentials...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">security</span>
                                        Secure Administrator Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">
                                Are you a citizen reporter?{' '}
                                <Link to={ROUTES.LOGIN} className="text-indigo-600 font-semibold hover:underline">Citizen Login →</Link>
                            </p>
                        </div>
                    </div>

                    {/* Warning notice */}
                    <div className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="material-symbols-outlined text-amber-600 text-lg flex-shrink-0 mt-0.5">warning</span>
                        <p className="text-xs text-amber-700">
                            Unauthorized access to this portal is strictly prohibited and subject to legal action. All sessions are audited.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
