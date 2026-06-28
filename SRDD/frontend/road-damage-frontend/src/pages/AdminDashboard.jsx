import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { complaintService } from '../services/complaintService';
import { ROUTES } from '../constants/routes';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0, escalated: 0, repair_verification: 0 });
    const [severity, setSeverity] = useState({ low: 0, medium: 0, high: 0, critical: 0 });
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const statsRes = await dashboardService.getStats();
            setStats(statsRes.data);

            const severityRes = await dashboardService.getSeverity();
            setSeverity(severityRes.data);

            const listRes = await complaintService.getAll();
            // Take the 5 most recent complaints
            const sorted = (listRes.data || []).sort((a, b) => b.id - a.id);
            setRecentComplaints(sorted.slice(0, 5));
        } catch (err) {
            console.error('Error fetching admin dashboard data:', err);
            setError('Failed to retrieve system operations data.');
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityColor = (level) => {
        switch (level) {
            case 'Critical': return 'text-rose-700 bg-rose-50 border-rose-100';
            case 'High': return 'text-amber-700 bg-amber-50 border-amber-100';
            case 'Medium': return 'text-blue-700 bg-blue-50 border-blue-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-700';
            case 'Closed': return 'bg-slate-100 text-slate-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Work Started': return 'bg-indigo-100 text-indigo-700';
            case 'Work Scheduled': return 'bg-purple-100 text-purple-700';
            case 'Repair Verification': return 'bg-cyan-100 text-cyan-700';
            case 'Escalated': return 'bg-rose-100 text-rose-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    return (
        <div className="space-y-lg animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex justify-between items-center border-b border-slate-100 pb-md">
                <div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Operations Dashboard</h2>
                    <p className="text-on-surface-variant font-body-md">Real-time municipal road maintenance oversight and system diagnostics.</p>
                </div>
                <button 
                    onClick={fetchDashboardData}
                    className="flex items-center gap-xs px-md py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Refresh Data
                </button>
            </header>

            {error && (
                <div className="text-error font-label-sm p-3 bg-error-container/20 rounded-xl border border-error/20 flex gap-sm items-center">
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                </div>
            )}

            {/* KPI Cards Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                        <div className="bg-primary/10 text-primary p-2 rounded-xl">
                            <span className="material-symbols-outlined">inventory</span>
                        </div>
                    </div>
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">All Issues</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">
                        {isLoading ? '...' : stats.total}
                    </h3>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                        <div className="bg-amber-100/50 text-amber-700 p-2 rounded-xl">
                            <span className="material-symbols-outlined">pending_actions</span>
                        </div>
                        <span className="text-label-sm text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">Review</span>
                    </div>
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">Pending</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">
                        {isLoading ? '...' : stats.pending}
                    </h3>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                        <div className="bg-blue-100/50 text-blue-700 p-2 rounded-xl">
                            <span className="material-symbols-outlined">engineering</span>
                        </div>
                        <span className="text-label-sm text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[10px]">Active</span>
                    </div>
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">In Progress</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">
                        {isLoading ? '...' : stats.in_progress}
                    </h3>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                        <div className="bg-emerald-100/50 text-emerald-700 p-2 rounded-xl">
                            <span className="material-symbols-outlined">task_alt</span>
                        </div>
                        <span className="text-label-sm text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Fixed</span>
                    </div>
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">Resolved</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">
                        {isLoading ? '...' : stats.completed}
                    </h3>
                </div>
            </section>

            {/* Bento Grid: Volume & Severity Mix */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                {/* Visual statistics */}
                <div className="lg:col-span-2 bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg flex flex-col justify-between">
                    <div>
                        <h4 className="font-headline-md text-on-surface font-bold">Severity Analysis Overview</h4>
                        <p className="text-body-sm text-on-surface-variant">Classified report density counts</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-md pt-lg">
                        <div className="p-md rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col">
                            <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">Critical</span>
                            <span className="text-2xl font-bold text-rose-800 mt-xs">{isLoading ? '...' : severity.critical}</span>
                        </div>
                        <div className="p-md rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col">
                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">High</span>
                            <span className="text-2xl font-bold text-amber-800 mt-xs">{isLoading ? '...' : severity.high}</span>
                        </div>
                        <div className="p-md rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col">
                            <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Medium</span>
                            <span className="text-2xl font-bold text-blue-800 mt-xs">{isLoading ? '...' : severity.medium}</span>
                        </div>
                        <div className="p-md rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col">
                            <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">Low</span>
                            <span className="text-2xl font-bold text-slate-800 mt-xs">{isLoading ? '...' : severity.low}</span>
                        </div>
                    </div>
                </div>

                {/* Status distribution display */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg flex flex-col">
                    <h4 className="font-headline-md text-on-surface font-bold">Priority Resolution</h4>
                    <p className="text-body-sm text-on-surface-variant">System performance indices</p>
                    <div className="space-y-md mt-lg flex-grow flex flex-col justify-center">
                        <div className="space-y-xs">
                            <div className="flex justify-between text-label-sm font-semibold">
                                <span>Escalated Issues Rate</span>
                                <span>{stats.total ? Math.round((stats.escalated / stats.total) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${stats.total ? (stats.escalated / stats.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-xs">
                            <div className="flex justify-between text-label-sm font-semibold">
                                <span>Resolution Ratio</span>
                                <span>{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Complaints Summary */}
            <section className="bg-white rounded-[20px] shadow-sm border border-slate-200/50 overflow-hidden">
                <div className="p-lg border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-headline-md text-on-surface font-bold">Recent Submissions</h3>
                        <p className="text-body-sm text-on-surface-variant">Review newly reported road hazards.</p>
                    </div>
                    <Link 
                        to={ROUTES.ADMIN_COMPLAINTS}
                        className="bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold px-lg py-2.5 rounded-xl transition-all"
                    >
                        Manage All Complaints
                    </Link>
                </div>

                {isLoading ? (
                    <div className="p-xl space-y-md">
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                    </div>
                ) : recentComplaints.length === 0 ? (
                    <div className="p-xl text-center text-on-surface-variant font-body-md py-12">
                        No reports logged in the system.
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] text-outline uppercase font-bold tracking-wider border-b border-slate-100">
                                    <th className="px-lg py-md">Issue Details</th>
                                    <th className="px-lg py-md">Location</th>
                                    <th className="px-lg py-md">Detection Accuracy</th>
                                    <th className="px-lg py-md">Severity</th>
                                    <th className="px-lg py-md">Status</th>
                                    <th className="px-lg py-md text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-body-sm">
                                {recentComplaints.map((complaint) => {
                                    return (
                                        <tr key={complaint.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-lg py-md">
                                                <div className="flex items-center gap-md">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 flex items-center justify-center text-slate-300">
                                                        {complaint.image ? (
                                                            <img className="w-full h-full object-cover" alt="hazard" src={complaint.image} />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-xl">image</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-on-surface">{complaint.detected_damage || complaint.damage_type || 'Road Damage'}</p>
                                                        <p className="text-[10px] text-outline">ID: #RD-{complaint.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-lg py-md font-medium max-w-[140px] truncate">{complaint.location}</td>
                                            <td className="px-lg py-md font-bold text-primary">{complaint.confidence}%</td>
                                            <td className="px-lg py-md">
                                                <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase ${getSeverityColor(complaint.severity_level)}`}>
                                                    {complaint.severity_level || 'Low'}
                                                </span>
                                            </td>
                                            <td className="px-lg py-md">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td className="px-lg py-md text-right">
                                                <Link 
                                                    to={`${ROUTES.ADMIN_COMPLAINTS}?id=${complaint.id}`}
                                                    className="inline-flex items-center text-primary bg-primary/5 hover:bg-primary/10 text-xs font-bold px-md py-1.5 rounded-lg transition-all"
                                                >
                                                    Inspect
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminDashboard;
