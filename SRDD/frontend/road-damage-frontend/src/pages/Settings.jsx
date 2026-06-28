import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { logout } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('userTheme') || 'light');
    const [smsNotify, setSmsNotify] = useState(localStorage.getItem('userSmsNotify') !== 'false');
    const [emailNotify, setEmailNotify] = useState(localStorage.getItem('userEmailNotify') === 'true');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        
        // Persist preferences
        localStorage.setItem('userTheme', theme);
        localStorage.setItem('userSmsNotify', smsNotify ? 'true' : 'false');
        localStorage.setItem('userEmailNotify', emailNotify ? 'true' : 'false');

        // Apply dark mode theme class to page layout
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        setSuccessMessage('Platform preferences saved successfully.');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-lg animate-in fade-in duration-300">
            <div className="space-y-xs">
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Platform Settings</h2>
                <p className="text-on-surface-variant font-body-md">Configure notification updates, visual themes, and accessibility settings.</p>
            </div>

            {successMessage && (
                <div className="text-emerald-700 font-label-sm p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex gap-sm items-center">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{successMessage}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-lg text-xs">
                {/* Visual Theme Selection */}
                <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                    <h3 className="font-headline-md text-base font-bold text-on-surface border-b border-slate-100 pb-sm">Appearance</h3>
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-label-md text-on-surface font-semibold">System Theme</p>
                            <p className="text-body-sm text-on-surface-variant">Switch between light and dark modes.</p>
                        </div>
                        <select 
                            className="bg-slate-50 border border-slate-200 rounded-lg px-md py-2 font-label-sm focus:ring-primary outline-none cursor-pointer text-xs"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="light">Light Theme</option>
                            <option value="dark">Dark Theme</option>
                        </select>
                    </div>
                </section>

                {/* Notifications Options */}
                <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                    <h3 className="font-headline-md text-base font-bold text-on-surface border-b border-slate-100 pb-sm">Notification Updates</h3>
                    
                    <div className="space-y-md">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="font-label-md text-on-surface font-semibold">SMS Notifications</p>
                                <p className="text-body-sm text-on-surface-variant">Receive automated timeline updates on your phone.</p>
                            </div>
                            <input 
                                type="checkbox"
                                checked={smsNotify}
                                onChange={(e) => setSmsNotify(e.target.checked)}
                                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer border-t border-slate-50 pt-md">
                            <div>
                                <p className="font-label-md text-on-surface font-semibold">Email Verification Alerts</p>
                                <p className="text-body-sm text-on-surface-variant">Receive formal resolution summaries via email.</p>
                            </div>
                            <input 
                                type="checkbox"
                                checked={emailNotify}
                                onChange={(e) => setEmailNotify(e.target.checked)}
                                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                            />
                        </label>
                    </div>
                </section>

                {/* Sessions operations */}
                <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                    <h3 className="font-headline-md text-base font-bold text-rose-700 border-b border-slate-100 pb-sm">Account Actions</h3>
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-label-md text-on-surface font-semibold">Sign Out</p>
                            <p className="text-body-sm text-on-surface-variant">Securely log out from this device.</p>
                        </div>
                        <button 
                            type="button"
                            onClick={logout}
                            className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-lg py-2.5 rounded-xl font-label-md font-bold transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </section>

                <div className="flex justify-end">
                    <button 
                        type="submit"
                        className="bg-primary hover:bg-primary-container text-white px-lg py-3 rounded-xl font-label-md font-bold shadow hover:shadow-md transition-all cursor-pointer text-xs"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
