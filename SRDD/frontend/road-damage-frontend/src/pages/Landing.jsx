import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const Landing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [progressWidth, setProgressWidth] = useState('w-0');

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgressWidth('w-full');
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleReportRedirect = () => {
        if (user) {
            if (user.is_staff) {
                navigate(ROUTES.ADMIN);
            } else {
                navigate(ROUTES.REPORT);
            }
        } else {
            navigate(ROUTES.LOGIN);
        }
    };

    return (
        <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen flex flex-col">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 shadow-sm bg-white/90 backdrop-blur-md border-b border-outline-variant/10">
                <div className="flex items-center justify-between px-gutter py-sm w-full max-w-container-max mx-auto h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>engineering</span>
                        </div>
                        <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary font-sans">Road Detector</span>
                    </div>
                    <div className="flex items-center gap-lg">
                        <nav className="hidden md:flex gap-xl text-label-md font-label-md">
                            <Link className="text-primary font-semibold" to="/">Home</Link>
                            <Link className="text-on-surface-variant hover:text-primary transition-colors" to={user ? (user.is_staff ? ROUTES.ADMIN : ROUTES.DASHBOARD) : ROUTES.LOGIN}>Dashboard</Link>
                            <Link className="text-on-surface-variant hover:text-primary transition-colors" to="/track">Track Issue</Link>
                        </nav>
                        <div className="flex items-center gap-md">
                            {user ? (
                                <Link to={user.is_staff ? ROUTES.ADMIN : ROUTES.DASHBOARD} className="px-md py-2 bg-primary text-white rounded-xl font-label-md hover:bg-primary-container transition-all active:scale-95 shadow-sm">
                                    Go to Portal
                                </Link>
                            ) : (
                                <>
                                    <Link to={ROUTES.LOGIN} className="px-md py-2 text-primary font-label-md font-bold hover:bg-primary/5 rounded-xl transition-all">
                                        Sign In
                                    </Link>
                                    <Link to={ROUTES.REGISTER} className="px-md py-2 bg-primary text-white rounded-xl font-label-md hover:bg-primary-container transition-all active:scale-95 shadow-sm">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-16 flex-grow">
                {/* Hero Section */}
                <section className="hero-gradient relative min-h-[600px] flex items-center px-gutter py-2xl">
                    <div className="max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-2xl items-center">
                        <div className="space-y-lg z-10">
                            <div className="inline-flex items-center gap-sm bg-primary/10 text-primary px-sm py-1 rounded-full border border-primary/20">
                                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                <span className="font-label-sm text-label-sm uppercase tracking-wider">Enterprise Infrastructure Platform</span>
                            </div>
                            <h1 className="font-display-lg text-display-lg text-on-surface max-w-xl leading-tight">
                                Transforming Road Infrastructure with <span className="text-primary">Intelligence.</span>
                            </h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                                Road Detector is a Road Damage Reporting & Monitoring System. Empowering citizens and city administrators to report, analyze, track, and resolve road damages automatically.
                            </p>
                            <div className="flex flex-wrap gap-md pt-md">
                                <button onClick={handleReportRedirect} className="px-xl py-4 bg-primary text-white rounded-xl font-label-md font-bold hover:bg-primary-container transition-all shadow-lg active:scale-95 flex items-center gap-sm">
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Report Damage Now
                                </button>
                                <Link to={ROUTES.REGISTER} className="px-lg py-4 font-label-md text-label-md text-primary border border-primary-container rounded-xl hover:bg-primary-container/10 transition-all">
                                    Create Free Account
                                </Link>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/5 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-white rounded-[20px] shadow-lg p-4 overflow-hidden aspect-square flex items-center justify-center border border-slate-100">
                                <img className="w-full h-full object-cover rounded-xl" alt="Road Scanner Preview" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWHb806p3sBPX0ztHi2yQiyscXPnd5rQwuEBwi94Jk9HaKX7trkjeFbBTLzJjtr7TSaYSYNGavo_peB4qG8ay58gHk41lHBuTuhe2kd64eF-Fp3xl7ayIBK1Wz3SsE3y7HdSqWUzY_5DGc68Z_yrYjeIIafAoq8gTlY2W6ZKcUtHGa3z5LaRxr0jQqL0kHureLxfJdLmmUxqE44LGoojFEI2w1e8Iq3sRGJcmKPzEUqLQeoVY-dpp2iqI0o3ubXZcMIm0YFtLGa-es" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section (Bento Style) */}
                <section className="py-2xl px-gutter bg-surface">
                    <div className="max-w-container-max mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                            <div className="bg-white border border-outline-variant/30 premium-card-shadow p-lg flex flex-col gap-sm rounded-[20px]">
                                <span className="text-primary font-display-lg text-display-lg">94%</span>
                                <span className="font-label-md text-label-md text-on-surface-variant uppercase">Resolution Rate</span>
                                <p className="font-body-sm text-body-sm text-outline">Average complaints resolved within 72 hours of reporting.</p>
                            </div>
                            <div className="p-lg flex flex-col gap-sm rounded-[20px] bg-primary text-white shadow-lg shadow-primary/20">
                                <span className="font-display-lg text-display-lg">1.2M</span>
                                <span className="font-label-md text-label-md uppercase opacity-85">Reports Processed</span>
                                <p className="font-body-sm text-body-sm opacity-90">Road Detector manages thousands of reports daily with high precision.</p>
                            </div>
                            <div className="bg-white border border-outline-variant/30 premium-card-shadow p-lg flex flex-col gap-sm rounded-[20px]">
                                <span className="text-primary font-display-lg text-display-lg">24/7</span>
                                <span className="font-label-md text-label-md text-on-surface-variant uppercase">Active Monitoring</span>
                                <p className="font-body-sm text-body-sm text-outline">Real-time alerts sent to regional maintenance crews instantly.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* AI Highlight */}
                <section className="py-3xl px-gutter bg-surface-container-low border-y border-outline-variant/25">
                    <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2xl items-center">
                        <div className="bg-white p-lg rounded-[20px] shadow-md border border-slate-100 space-y-md">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-sm">
                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                                    </div>
                                    <div>
                                        <h3 className="font-headline-md text-headline-md">Smart Analysis</h3>
                                        <p className="text-body-sm text-outline">Road Detector System v4.0</p>
                                    </div>
                                </div>
                                <span className="bg-indigo-50 text-primary font-semibold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">SYSTEM ANALYSIS</span>
                            </div>
                            <div className="space-y-md">
                                <div className="p-md bg-white rounded-xl border border-slate-100 flex gap-md items-center">
                                    <span className="material-symbols-outlined text-primary">image</span>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full bg-primary transition-all duration-1000 ${progressWidth}`}></div>
                                    </div>
                                    <span className="font-label-sm text-label-sm">Classified</span>
                                </div>
                                <div className="p-md bg-emerald-50 border border-emerald-200 rounded-xl flex gap-md items-start">
                                    <span className="material-symbols-outlined text-emerald-700">check_circle</span>
                                    <div>
                                        <p className="font-label-md text-label-md text-emerald-700 uppercase mb-xs">Classification: Pothole (Grade 3)</p>
                                        <p className="text-body-sm text-emerald-800">Damage detected. Priority set to 'High' based on traffic flow and size. Maintenance crew notified for Zone 4B.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-lg">
                            <h2 className="font-headline-lg text-headline-lg text-on-surface">Precision Reporting Powered by Computer Vision</h2>
                            <p className="font-body-lg text-body-lg text-on-surface-variant">
                                Our advanced analysis system evaluates your photos to determine the severity, type, and urgency of the damage. No more manual sorting; the system routes the report directly to the correct department within seconds.
                            </p>
                            <ul className="space-y-md">
                                <li className="flex items-center gap-md">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-[16px]">done</span>
                                    </span>
                                    <span className="font-body-md text-body-md">Auto-tagging for potholes, cracks, and debris</span>
                                </li>
                                <li className="flex items-center gap-md">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-[16px]">done</span>
                                    </span>
                                    <span className="font-body-md text-body-md">GPS verification and cross-referencing</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-3xl px-gutter max-w-container-max mx-auto text-center">
                    <h2 className="font-headline-lg text-headline-lg mb-2xl">Simple Steps to Better Roads</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2xl">
                        <div className="relative group">
                            <div className="w-20 h-20 bg-surface-container-high rounded-[20px] flex items-center justify-center mx-auto mb-lg group-hover:bg-primary transition-colors group-hover:text-white duration-200">
                                <span className="material-symbols-outlined text-[32px]">photo_camera</span>
                            </div>
                            <h4 className="font-headline-md text-headline-md mb-sm">Snap a Photo</h4>
                            <p className="text-body-sm text-outline">Take a clear picture of the road damage through our secure web interface.</p>
                        </div>
                        <div className="relative group">
                            <div className="w-20 h-20 bg-surface-container-high rounded-[20px] flex items-center justify-center mx-auto mb-lg group-hover:bg-primary transition-colors group-hover:text-white duration-200">
                                <span className="material-symbols-outlined text-[32px]">location_on</span>
                            </div>
                            <h4 className="font-headline-md text-headline-md mb-sm">Verify Details</h4>
                            <p className="text-body-sm text-outline">Confirm the automatically detected location and add a brief description.</p>
                        </div>
                        <div className="relative group">
                            <div className="w-20 h-20 bg-surface-container-high rounded-[20px] flex items-center justify-center mx-auto mb-lg group-hover:bg-primary transition-colors group-hover:text-white duration-200">
                                <span className="material-symbols-outlined text-[32px]">send</span>
                            </div>
                            <h4 className="font-headline-md text-headline-md mb-sm">Submit &amp; Track</h4>
                            <p className="text-body-sm text-outline">Get a tracking ID and receive updates as your report moves to resolution.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-2xl px-gutter">
                    <div className="max-w-container-max mx-auto bg-inverse-surface rounded-[30px] p-2xl md:p-3xl text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
                        <div className="relative z-10 space-y-lg">
                            <h2 className="font-display-lg text-display-lg text-white max-w-2xl mx-auto">Ready to make a difference in your community?</h2>
                            <p className="text-white/70 font-body-lg text-body-lg max-w-xl mx-auto">
                                Your report helps our crews prioritize repairs where they are needed most. Join 50,000+ citizens improving their city today.
                            </p>
                            <div className="pt-md">
                                <button onClick={handleReportRedirect} className="bg-white text-primary px-3xl py-lg rounded-2xl font-headline-md text-headline-md hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                    Report Damage Now
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface py-2xl px-gutter border-t border-slate-100">
                <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-2xl">
                    <div className="space-y-md">
                        <div className="flex items-center gap-sm">
                            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary font-sans">Road Detector</span>
                        </div>
                        <p className="text-body-sm text-outline">An initiative to modernize municipal road infrastructure maintenance through citizen engagement and technology.</p>
                    </div>
                    <div>
                        <h5 className="font-label-md text-label-md uppercase text-on-surface mb-lg">Platform</h5>
                        <ul className="space-y-sm text-body-sm text-on-surface-variant">
                            <li><span className="hover:text-primary transition-colors cursor-pointer">How it works</span></li>
                            <li><span className="hover:text-primary transition-colors cursor-pointer">Technology</span></li>
                            <li><span className="hover:text-primary transition-colors cursor-pointer">Success Stories</span></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-label-md text-label-md uppercase text-on-surface mb-lg">Portal Gateway</h5>
                        <ul className="space-y-sm text-body-sm text-on-surface-variant">
                            <li><Link className="hover:text-primary transition-colors" to={ROUTES.LOGIN}>Citizen Login</Link></li>
                            <li><Link className="hover:text-primary transition-colors" to={ROUTES.ADMIN_LOGIN}>Admin Portal</Link></li>
                            <li><Link className="hover:text-primary transition-colors" to={ROUTES.REGISTER}>Create Account</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-label-md text-label-md uppercase text-on-surface mb-lg">Trust &amp; Privacy</h5>
                        <ul className="space-y-sm text-body-sm text-on-surface-variant">
                            <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
                            <li><span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span></li>
                            <li><span className="hover:text-primary transition-colors cursor-pointer">Data Security</span></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-container-max mx-auto mt-2xl pt-lg border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-md">
                    <span className="text-body-sm text-outline">© 2026 Road Detector Platform. All rights reserved.</span>
                    <div className="flex gap-lg">
                        <span className="flex items-center gap-xs text-body-sm text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            System Status: Operational
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
