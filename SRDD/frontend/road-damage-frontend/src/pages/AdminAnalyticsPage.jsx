import React, { useEffect, useMemo, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { dashboardService } from '../services/dashboardService';

const AdminAnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0, escalated: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [analyticsRes, statsRes] = await Promise.all([
                    analyticsService.getAnalytics(),
                    dashboardService.getStats()
                ]);
                setAnalytics(analyticsRes.data);
                setStats(statsRes.data || {});
            } catch (err) {
                console.error(err);
                setError('Unable to load analytics right now.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const monthlyTrendMax = useMemo(() => {
        if (!analytics?.monthly_trends?.length) return 1;
        return Math.max(...analytics.monthly_trends.map(item => item.count), 1);
    }, [analytics]);

    const statCards = [
        { label: 'Total complaints', value: analytics?.total_complaints ?? stats.total, tone: 'bg-indigo-50 text-indigo-700' },
        { label: 'Completion rate', value: `${analytics?.completion_rate ?? 0}%`, tone: 'bg-emerald-50 text-emerald-700' },
        { label: 'Avg. citizen rating', value: analytics?.average_rating ?? '—', tone: 'bg-amber-50 text-amber-700' },
        { label: 'Escalated', value: stats.escalated ?? 0, tone: 'bg-rose-50 text-rose-700' },
    ];

    if (loading) {
        return <div className="space-y-4"><div className="h-24 bg-slate-100 rounded-xl animate-pulse" /><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <header>
                <h2 className="text-2xl font-bold text-slate-900">Analytics Overview</h2>
                <p className="text-sm text-slate-600">Inspect report trends, severity mix, and workload across the district.</p>
            </header>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className={`inline-flex rounded-xl p-2 text-sm font-semibold ${card.tone}`}>{card.label}</div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">{card.value}</div>
                    </div>
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Monthly complaint volume</h3>
                            <p className="text-sm text-slate-500">A simple trend snapshot for the last reporting period.</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {analytics?.monthly_trends?.length ? analytics.monthly_trends.map((item) => (
                            <div key={item.month}>
                                <div className="mb-1 flex justify-between text-sm text-slate-600">
                                    <span>{item.month}</span>
                                    <span>{item.count}</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-slate-100">
                                    <div className="h-2.5 rounded-full bg-indigo-600" style={{ width: `${Math.max((item.count / monthlyTrendMax) * 100, 8)}%` }} />
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500">No trend data has been generated yet.</p>}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Damage distribution</h3>
                    <div className="mt-4 space-y-3">
                        {Object.entries(analytics?.damage_distribution || {}).map(([key, value]) => (
                            <div key={key} className="rounded-xl bg-slate-50 p-3">
                                <div className="flex items-center justify-between text-sm text-slate-700">
                                    <span className="capitalize">{key.replace('_', ' ')}</span>
                                    <span className="font-semibold">{value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Severity breakdown</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {Object.entries(analytics?.severity_breakdown || {}).map(([key, value]) => (
                            <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <div className="text-sm font-medium capitalize text-slate-600">{key}</div>
                                <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Active workflow status</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {Object.entries(analytics?.status_breakdown || {}).map(([key, value]) => (
                            <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <div className="text-sm font-medium capitalize text-slate-600">{key.replace('_', ' ')}</div>
                                <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminAnalyticsPage;
