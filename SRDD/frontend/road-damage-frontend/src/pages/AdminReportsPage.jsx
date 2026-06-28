import React, { useEffect, useMemo, useState } from 'react';
import { complaintService } from '../services/complaintService';
import { dashboardService } from '../services/dashboardService';

const AdminReportsPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, escalated: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [complaintsRes, statsRes] = await Promise.all([
                    complaintService.getAll(),
                    dashboardService.getStats()
                ]);
                setComplaints(complaintsRes.data || []);
                setStats(statsRes.data || {});
            } catch (err) {
                console.error(err);
                setError('Unable to load reports right now.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const latestComplaints = useMemo(() => {
        return [...complaints].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 8);
    }, [complaints]);

    const handleDownload = async (complaintId) => {
        try {
            setDownloadingId(complaintId);
            const blob = await complaintService.downloadReport(complaintId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `road_report_RD-${complaintId}.txt`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setError('The report could not be downloaded.');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <header>
                <h2 className="text-2xl font-bold text-slate-900">Operations Reports</h2>
                <p className="text-sm text-slate-600">Export complaint reports and review the most recent maintenance cases.</p>
            </header>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Archived reports</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Completed cases</div>
                    <div className="mt-2 text-3xl font-bold text-emerald-600">{stats.completed}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Escalated cases</div>
                    <div className="mt-2 text-3xl font-bold text-rose-600">{stats.escalated}</div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-4">
                    <h3 className="text-lg font-semibold text-slate-900">Recent report exports</h3>
                </div>
                {loading ? (
                    <div className="space-y-3 p-4">
                        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                ) : latestComplaints.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">No complaint reports are available yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {latestComplaints.map((complaint) => (
                            <div key={complaint.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="font-semibold text-slate-900">{complaint.detected_damage || complaint.damage_type || 'Road damage'} </div>
                                    <div className="text-sm text-slate-500">ID: RD-{complaint.id} • {complaint.location}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">{complaint.status}</span>
                                    <button
                                        onClick={() => handleDownload(complaint.id)}
                                        className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                        disabled={downloadingId === complaint.id}
                                    >
                                        {downloadingId === complaint.id ? 'Preparing…' : 'Download report'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminReportsPage;
