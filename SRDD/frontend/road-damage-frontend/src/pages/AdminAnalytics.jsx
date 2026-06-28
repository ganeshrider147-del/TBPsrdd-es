import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await analyticsService.getAnalytics();
            setAnalytics(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to retrieve system operations analytics data.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-xl space-y-md">
                <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                <div className="h-20 bg-slate-50 rounded-lg animate-pulse"></div>
                <div className="h-40 bg-slate-50 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-error font-label-sm p-lg bg-error-container/20 rounded-[20px] border border-error/20 flex gap-sm items-center">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
            </div>
        );
    }

    const {
        total_complaints = 0,
        completion_rate = 0,
        average_rating = null,
        monthly_trends = [],
        damage_distribution = {},
        severity_breakdown = {},
        status_breakdown = {}
    } = analytics || {};

    // Custom SVG Bar Chart Calculation for Monthly Trends
    const trends = monthly_trends.length > 0 ? monthly_trends : [
        { month: 'No Data', count: 0 }
    ];
    const maxTrendCount = Math.max(...trends.map(t => t.count), 5);
    const chartHeight = 160;
    const chartWidth = 500;
    const barWidth = 40;
    const gap = 20;

    return (
        <div className="space-y-lg animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex justify-between items-center border-b border-slate-100 pb-md">
                <div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">System Analytics</h2>
                    <p className="text-on-surface-variant font-body-md">Real-time analytical graphs, damage classifications, and operations resolution metrics.</p>
                </div>
                <button 
                    onClick={fetchAnalytics}
                    className="flex items-center gap-xs px-md py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Refresh Data
                </button>
            </header>

            {/* KPI Cards Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">Total Reports</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">{total_complaints}</h3>
                    <p className="text-[10px] text-outline mt-1">Logged municipal complaints</p>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">Completion Rate</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">{completion_rate}%</h3>
                    <p className="text-[10px] text-emerald-600 mt-1">Resolved vs Reported Ratio</p>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">Avg Citizen Rating</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">
                        {average_rating ? `${average_rating} / 5` : 'N/A'}
                    </h3>
                    <p className="text-[10px] text-primary mt-1">Post-repair feedback score</p>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">Escalated Rate</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">
                        {total_complaints ? Math.round(((status_breakdown.escalated || 0) / total_complaints) * 100) : 0}%
                    </h3>
                    <p className="text-[10px] text-rose-500 mt-1">Urgent attention needed</p>
                </div>
            </section>

            {/* Monthly Trend Visualizer using animated SVG */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                <div className="lg:col-span-2 bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg flex flex-col justify-between">
                    <div>
                        <h4 className="font-headline-md text-on-surface font-bold">Complaint Monthly Trends</h4>
                        <p className="text-body-sm text-on-surface-variant">Report submissions timeline overview</p>
                    </div>
                    
                    {/* SVG Chart */}
                    <div className="w-full flex justify-center py-lg">
                        <svg className="w-full max-w-lg" viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}>
                            {/* Horizontal guide lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                const y = ratio * chartHeight;
                                return (
                                    <line 
                                        key={idx} 
                                        x1="0" 
                                        y1={y} 
                                        x2={chartWidth} 
                                        y2={y} 
                                        stroke="#f1f5f9" 
                                        strokeWidth="1" 
                                    />
                                );
                            })}

                            {trends.map((item, idx) => {
                                const barHeight = (item.count / maxTrendCount) * chartHeight;
                                const x = idx * (barWidth + gap) + 40;
                                const y = chartHeight - barHeight;

                                return (
                                    <g key={idx} className="group cursor-pointer">
                                        {/* Hover Tooltip background */}
                                        <rect 
                                            x={x - 5} 
                                            y={y - 25} 
                                            width={barWidth + 10} 
                                            height="20" 
                                            rx="4" 
                                            fill="#1e1b4b" 
                                            className="opacity-0 group-hover:opacity-100 transition-opacity" 
                                        />
                                        <text 
                                            x={x + barWidth / 2} 
                                            y={y - 12} 
                                            fill="white" 
                                            textAnchor="middle" 
                                            fontSize="9" 
                                            fontWeight="bold" 
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {item.count}
                                        </text>

                                        {/* Animated Bar */}
                                        <rect 
                                            x={x} 
                                            y={y} 
                                            width={barWidth} 
                                            height={barHeight} 
                                            rx="6" 
                                            fill="url(#barGradient)" 
                                            className="transition-all duration-500 hover:opacity-85" 
                                        />

                                        {/* X Axis Label */}
                                        <text 
                                            x={x + barWidth / 2} 
                                            y={chartHeight + 20} 
                                            fill="#64748b" 
                                            textAnchor="middle" 
                                            fontSize="10" 
                                            fontWeight="bold"
                                        >
                                            {item.month}
                                        </text>
                                    </g>
                                );
                            })}
                            
                            {/* Color Gradients */}
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3d4cad" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Status Breakdown Distribution */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg flex flex-col justify-between">
                    <div>
                        <h4 className="font-headline-md text-on-surface font-bold">Operational Status Mix</h4>
                        <p className="text-body-sm text-on-surface-variant">Active vs completed workflow stages</p>
                    </div>
                    
                    <div className="space-y-md py-md">
                        <div className="space-y-xs">
                            <div className="flex justify-between text-xs font-semibold text-on-surface">
                                <span className="flex items-center gap-xs">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                                    Pending Review
                                </span>
                                <span>{status_breakdown.pending || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${total_complaints ? ((status_breakdown.pending || 0) / total_complaints) * 100 : 0}%` }} />
                            </div>
                        </div>

                        <div className="space-y-xs">
                            <div className="flex justify-between text-xs font-semibold text-on-surface">
                                <span className="flex items-center gap-xs">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                                    In Active Repairs
                                </span>
                                <span>{status_breakdown.in_progress || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${total_complaints ? ((status_breakdown.in_progress || 0) / total_complaints) * 100 : 0}%` }} />
                            </div>
                        </div>

                        <div className="space-y-xs">
                            <div className="flex justify-between text-xs font-semibold text-on-surface">
                                <span className="flex items-center gap-xs">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                                    Resolved (Completed/Closed)
                                </span>
                                <span>{status_breakdown.completed || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${total_complaints ? ((status_breakdown.completed || 0) / total_complaints) * 100 : 0}%` }} />
                            </div>
                        </div>

                        <div className="space-y-xs">
                            <div className="flex justify-between text-xs font-semibold text-on-surface">
                                <span className="flex items-center gap-xs">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                                    Escalated Delays
                                </span>
                                <span>{status_breakdown.escalated || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${total_complaints ? ((status_breakdown.escalated || 0) / total_complaints) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Damage Class & Severity Distribution grids */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {/* Damage Type Distribution */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg space-y-md">
                    <div>
                        <h4 className="font-headline-md text-on-surface font-bold">Damage Type Classification</h4>
                        <p className="text-body-sm text-on-surface-variant">Real-time computer vision classified categories</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-md text-center py-sm">
                        <div className="p-md rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-2xl font-extrabold text-primary">{damage_distribution.pothole || 0}</span>
                            <p className="text-[10px] text-outline font-bold uppercase mt-xs">Potholes</p>
                        </div>
                        <div className="p-md rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-2xl font-extrabold text-primary">{damage_distribution.crack || 0}</span>
                            <p className="text-[10px] text-outline font-bold uppercase mt-xs">Cracks</p>
                        </div>
                        <div className="p-md rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-2xl font-extrabold text-slate-500">{damage_distribution.unknown || 0}</span>
                            <p className="text-[10px] text-outline font-bold uppercase mt-xs">Unclassified</p>
                        </div>
                    </div>
                </div>

                {/* Severity Breakdown stats */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg space-y-md">
                    <div>
                        <h4 className="font-headline-md text-on-surface font-bold">Damage Severity Distribution</h4>
                        <p className="text-body-sm text-on-surface-variant">Priority mix based on inspection severity levels</p>
                    </div>

                    <div className="grid grid-cols-4 gap-xs pt-xs">
                        <div className="p-xs text-center">
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold mx-auto">
                                {severity_breakdown.critical || 0}
                            </div>
                            <span className="text-[10px] text-outline font-bold block mt-sm">Critical</span>
                        </div>
                        <div className="p-xs text-center">
                            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold mx-auto">
                                {severity_breakdown.high || 0}
                            </div>
                            <span className="text-[10px] text-outline font-bold block mt-sm">High</span>
                        </div>
                        <div className="p-xs text-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mx-auto">
                                {severity_breakdown.medium || 0}
                            </div>
                            <span className="text-[10px] text-outline font-bold block mt-sm">Medium</span>
                        </div>
                        <div className="p-xs text-center">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold mx-auto">
                                {severity_breakdown.low || 0}
                            </div>
                            <span className="text-[10px] text-outline font-bold block mt-sm">Low</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminAnalytics;
