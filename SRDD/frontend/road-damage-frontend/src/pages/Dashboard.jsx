import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0, escalated: 0 });
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const statsResponse = await dashboardService.getStats();
                setStats(statsResponse.data);

                const complaintsResponse = await complaintService.getMyList();
                setRecentComplaints(complaintsResponse.data.slice(0, 5));
            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Calculate percentage breakdown for the status distribution donut
    const totalCount = stats.total || 0;
    const resolvedPct = totalCount ? Math.round((stats.completed / totalCount) * 100) : 0;
    const inProgressPct = totalCount ? Math.round((stats.in_progress / totalCount) * 100) : 0;
    const pendingPct = totalCount ? Math.round(((stats.pending + stats.escalated) / totalCount) * 100) : 0;

    return (
        <div className="space-y-lg animate-in fade-in duration-300">
            {/* Welcome Banner */}
            <section className="relative overflow-hidden rounded-[20px] bg-primary p-lg text-white shadow-lg shadow-primary/10">
                <div className="absolute inset-0 opacity-10 road-overlay"></div>
                <div className="relative z-10 flex flex-col gap-sm">
                    <div className="inline-flex items-center gap-sm bg-white/20 px-3 py-1 rounded-full text-label-sm font-label-sm w-fit">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        <span>Active Monitoring Portal</span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold">
                        Welcome back, {user?.username || 'Reporter'}
                    </h2>
                    <p className="font-body-md text-body-md opacity-90 max-w-md">
                        Your reports help prioritize repairs across the city.
                    </p>
                    <div className="mt-md flex flex-wrap gap-sm">
                        <Link 
                            to={ROUTES.REPORT} 
                            className="bg-white text-primary px-lg py-3 rounded-xl font-label-md text-label-md font-bold shadow-sm hover:scale-[1.02] active:scale-95 transition-all text-center"
                        >
                            Report New Damage
                        </Link>
                        <Link 
                            to={ROUTES.TRACK} 
                            className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-lg py-3 rounded-xl font-label-md text-label-md font-bold hover:bg-white/30 active:scale-95 transition-all text-center"
                        >
                            Track Status
                        </Link>
                    </div>
                </div>
            </section>

            {error && (
                <div className="text-error font-label-sm p-3 bg-error-container/20 rounded-xl border border-error/20 flex gap-sm items-center">
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                </div>
            )}

            {/* KPI Cards Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {/* Total */}
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 flex flex-col gap-xs">
                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Total Reports</span>
                    <span className="text-primary font-headline-lg text-display-lg leading-none mt-xs font-bold">{stats.total}</span>
                    <div className="flex items-center gap-xs text-[11px] text-primary mt-sm font-semibold">
                        <span className="material-symbols-outlined text-sm">history</span>
                        <span>Lifetime submissions</span>
                    </div>
                </div>
                {/* Pending */}
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 flex flex-col gap-xs">
                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Pending</span>
                    <span className="text-tertiary font-headline-lg text-display-lg leading-none mt-xs font-bold">{stats.pending}</span>
                    <div className="h-1.5 w-full bg-surface-container rounded-full mt-sm overflow-hidden">
                        <div 
                            className="h-full bg-tertiary rounded-full" 
                            style={{ width: `${totalCount ? (stats.pending / totalCount) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
                {/* In Progress */}
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 flex flex-col gap-xs">
                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">In Progress</span>
                    <span className="text-secondary-container font-headline-lg text-display-lg leading-none mt-xs font-bold">{stats.in_progress}</span>
                    <div className="h-1.5 w-full bg-surface-container rounded-full mt-sm overflow-hidden">
                        <div 
                            className="h-full bg-secondary-container rounded-full" 
                            style={{ width: `${totalCount ? (stats.in_progress / totalCount) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
                {/* Resolved */}
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 flex flex-col gap-xs">
                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Resolved</span>
                    <span className="text-emerald-700 font-headline-lg text-display-lg leading-none mt-xs font-bold">{stats.completed}</span>
                    <div className="flex items-center gap-xs text-[11px] text-emerald-700 mt-sm font-semibold">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>Infrastructure restored</span>
                    </div>
                </div>
            </section>

            {/* Bento Grid: Status Distribution & Recent Reports */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                {/* Status Mix (Donut Chart) */}
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 flex flex-col justify-between">
                    <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Status Mix</h3>
                        <p className="text-body-sm text-on-surface-variant">Breakdown of reported hazard states</p>
                    </div>
                    
                    <div className="relative h-44 w-full flex items-center justify-center my-md">
                        {/* Circular Donut Visual */}
                        <div className="w-32 h-32 rounded-full border-[14px] border-slate-100 flex items-center justify-center relative">
                            {/* Inner circle label */}
                            <div className="text-center">
                                <span className="block font-headline-lg text-headline-lg font-bold leading-none text-primary">{stats.total}</span>
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Total</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-sm">
                        <div className="flex justify-between items-center text-label-sm">
                            <div className="flex items-center gap-sm">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                <span className="text-on-surface-variant">Resolved</span>
                            </div>
                            <span className="font-bold text-on-surface">{resolvedPct}%</span>
                        </div>
                        <div className="flex justify-between items-center text-label-sm">
                            <div className="flex items-center gap-sm">
                                <div className="w-2.5 h-2.5 rounded-full bg-secondary-container"></div>
                                <span className="text-on-surface-variant">In Progress</span>
                            </div>
                            <span className="font-bold text-on-surface">{inProgressPct}%</span>
                        </div>
                        <div className="flex justify-between items-center text-label-sm">
                            <div className="flex items-center gap-sm">
                                <div className="w-2.5 h-2.5 rounded-full bg-tertiary"></div>
                                <span className="text-on-surface-variant">Pending / Escalated</span>
                            </div>
                            <span className="font-bold text-on-surface">{pendingPct}%</span>
                        </div>
                    </div>
                </div>

                {/* Recent Incident Reports List */}
                <div className="lg:col-span-2 bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-sm">
                            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Recent Complaints</h3>
                            <Link to={ROUTES.HISTORY} className="text-primary font-label-md text-label-md hover:underline font-bold">View All</Link>
                        </div>
                        <p className="text-body-sm text-on-surface-variant mb-md">Updates on your reported road complaints</p>
                    </div>

                    {isLoading ? (
                        <div className="space-y-md my-auto py-8">
                            <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
                            <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
                            <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
                        </div>
                    ) : recentComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-xl text-center space-y-sm my-auto">
                            <span className="material-symbols-outlined text-4xl text-outline-variant">check_circle</span>
                            <h4 className="font-headline-md text-on-surface">All clear!</h4>
                            <p className="text-body-sm text-on-surface-variant max-w-xs">You have no pending road hazard reports.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar flex-grow">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-100 text-on-surface-variant font-label-sm text-label-sm uppercase">
                                    <tr>
                                        <th className="pb-sm font-semibold">Complaint</th>
                                        <th className="pb-sm font-semibold">Location</th>
                                        <th className="pb-sm font-semibold">Status</th>
                                        <th className="pb-sm font-semibold text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-sm text-body-sm divide-y divide-slate-50">
                                    {recentComplaints.map((complaint) => (
                                        <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-md">
                                                <div className="flex items-center gap-sm">
                                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                        <span className="material-symbols-outlined text-[18px]">warning</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-on-surface">{complaint.detected_damage || complaint.damage_type || 'Road Damage'}</p>
                                                        <p className="text-[10px] text-outline">ID: #{complaint.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-md text-on-surface-variant font-medium max-w-[120px] truncate">{complaint.location}</td>
                                            <td className="py-md">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    complaint.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                    complaint.status === 'Escalated' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td className="py-md text-right">
                                                <Link 
                                                    to={`${ROUTES.TRACK}?id=${complaint.id}`}
                                                    className="text-primary hover:bg-primary/5 p-1.5 rounded-full inline-flex items-center transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
