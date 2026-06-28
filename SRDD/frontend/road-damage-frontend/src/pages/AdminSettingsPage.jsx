import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';

const AdminSettingsPage = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0, escalated: 0 });
    const [preferences, setPreferences] = useState({
        smsNotifications: true,
        autoEscalation: true,
        aiInspection: true,
        mobileAlerts: false,
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await dashboardService.getStats();
                setStats(res.data || {});
            } catch (err) {
                console.error(err);
            }
        };

        loadStats();
    }, []);

    const togglePreference = (key) => {
        setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const settingsList = [
        { key: 'smsNotifications', label: 'Citizen SMS updates', description: 'Send status updates to citizens when work changes.' },
        { key: 'autoEscalation', label: 'Auto-escalation', description: 'Elevate overdue complaints after the service window.' },
        { key: 'aiInspection', label: 'AI damage review', description: 'Keep computer vision review enabled for new reports.' },
        { key: 'mobileAlerts', label: 'Mobile alerts', description: 'Prompt staff when high-priority cases are updated.' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <header>
                <h2 className="text-2xl font-bold text-slate-900">Admin Settings</h2>
                <p className="text-sm text-slate-600">Tune operational controls and review the current system health.</p>
            </header>

            <section className="grid gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Open cases</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{stats.pending}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Active work</div>
                    <div className="mt-2 text-3xl font-bold text-blue-600">{stats.in_progress}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Resolved</div>
                    <div className="mt-2 text-3xl font-bold text-emerald-600">{stats.completed}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Escalated</div>
                    <div className="mt-2 text-3xl font-bold text-rose-600">{stats.escalated}</div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Workflow preferences</h3>
                <div className="mt-4 space-y-3">
                    {settingsList.map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <div>
                                <div className="font-medium text-slate-800">{setting.label}</div>
                                <div className="text-sm text-slate-500">{setting.description}</div>
                            </div>
                            <button
                                onClick={() => togglePreference(setting.key)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${preferences[setting.key] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${preferences[setting.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">System notes</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• New complaints are assessed with AI vision, then queued for an administrator review.</li>
                    <li>• Status updates can be paired with repair evidence uploaded from the field.</li>
                    <li>• Citizens receive in-app notifications and SMS updates based on the current workflow settings.</li>
                </ul>
            </section>
        </div>
    );
};

export default AdminSettingsPage;
