import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { login, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(username, password);
            if (user.is_staff) {
                logout();
                setError('Administrator accounts must sign in through the Administrator Login portal.');
                return;
            }
            navigate(ROUTES.DASHBOARD);
        } catch (err) {
            setError('Invalid credentials. Please check your username and password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Panel — Brand */}
            <div className="hidden lg:flex w-[520px] flex-shrink-0 relative overflow-hidden items-center justify-center"
                style={{
                    background: 'linear-gradient(145deg, #1a1a3e 0%, #2d2f6e 40%, #3d4cad 80%, #4f67e0 100%)'
                }}>
                {/* Decorative circles */}
                <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />
                <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
                <div className="absolute top-1/2 right-[-40px] w-48 h-48 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />

                {/* Grid texture overlay */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }} />

                <div className={`relative z-10 text-white max-w-md px-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>road</span>
                        </div>
                        <div>
                            <span className="font-bold text-xl tracking-tight block font-sans">Road Detector</span>
                            <span className="text-xs text-white/60 uppercase tracking-widest">Citizen Portal</span>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        Making roads<br />
                        <span style={{ color: '#93c5fd' }}>safer together.</span>
                    </h2>
                    <p className="text-white/70 text-base leading-relaxed mb-10">
                        Join thousands of citizens reporting road hazards. Our platform ensures every report reaches the right team instantly.
                    </p>

                    {/* Feature highlights */}
                    <div className="space-y-4">
                        {[
                            { icon: 'auto_awesome', text: 'Automatic road damage analysis' },
                            { icon: 'notifications', text: 'Real-time SMS status updates' },
                            { icon: 'track_changes', text: 'Full repair timeline tracking' },
                            { icon: 'shield', text: 'Secure JWT-authenticated portal' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <span className="material-symbols-outlined text-blue-300 text-[18px]">{f.icon}</span>
                                </div>
                                <span className="text-white/80 text-sm">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="font-bold text-2xl text-white">1.2M+</div>
                                <div className="text-white/50 text-xs">Reports Processed</div>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="text-center">
                                <div className="font-bold text-2xl text-white">94%</div>
                                <div className="text-white/50 text-xs">Resolution Rate</div>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="text-center">
                                <div className="font-bold text-2xl text-white">24/7</div>
                                <div className="text-white/50 text-xs">Active Monitoring</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className={`w-full max-w-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #3d4cad, #4f67e0)' }}>
                            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>road</span>
                        </div>
                        <span className="font-bold text-lg text-slate-800 font-sans">Road Detector</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
                        <p className="text-slate-500">Sign in to report road issues and track repairs.</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">error</span>
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700" htmlFor="citizen-username">
                                    Username or Email
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                                    <input
                                        id="citizen-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="your.name or email@example.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="citizen-password">Password</label>
                                    <span className="text-sm text-indigo-600 cursor-pointer hover:underline font-medium">Forgot password?</span>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        id="citizen-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        required
                                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
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

                            <div className="flex items-center gap-2.5">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="remember-me" className="text-sm text-slate-600 cursor-pointer">Keep me signed in</label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                                style={{ background: isLoading ? '#6b7280' : 'linear-gradient(135deg, #3d4cad, #4f67e0)' }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in to Citizen Portal
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                            <p className="text-center text-sm text-slate-500">
                                New to Road Detector?{' '}
                                <Link to={ROUTES.REGISTER} className="text-indigo-600 font-semibold hover:underline">Create free account</Link>
                            </p>
                            <p className="text-center text-sm text-slate-500">
                                Are you an administrator?{' '}
                                <Link to={ROUTES.ADMIN_LOGIN} className="text-slate-700 font-semibold hover:underline">Admin Portal →</Link>
                            </p>
                        </div>
                    </div>

                    {/* Security badges */}
                    <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-slate-400 text-sm">lock</span>
                            SSL Secured
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-slate-400 text-sm">verified_user</span>
                            JWT Protected
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-slate-400 text-sm">shield</span>
                            GDPR Compliant
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
