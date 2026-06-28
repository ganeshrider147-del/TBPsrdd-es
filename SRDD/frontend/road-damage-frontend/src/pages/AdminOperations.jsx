import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { complaintService } from '../services/complaintService';
import { ROUTES } from '../constants/routes';

const AdminOperations = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0, escalated: 0 });
    const [severity, setSeverity] = useState({ low: 0, medium: 0, high: 0, critical: 0 });
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter] = useState('All');
    const [severityFilter] = useState('All');
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Status update & upload states
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [afterImageFile, setAfterImageFile] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Detailed timeline parameters
    const [timelineStatus, setTimelineStatus] = useState('');
    const [officer, setOfficer] = useState('');
    const [remarks, setRemarks] = useState('');
    const [workDate, setWorkDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [assignedTeam, setAssignedTeam] = useState('');
    const [progress, setProgress] = useState(50);
    const [estimatedCompletion, setEstimatedCompletion] = useState('');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const statsRes = await dashboardService.getStats();
            setStats(statsRes.data);

            const severityRes = await dashboardService.getSeverity();
            setSeverity(severityRes.data);

            const listRes = await complaintService.getAll();
            setComplaints(listRes.data || []);
            setFilteredComplaints(listRes.data || []);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError('Failed to retrieve system operations data.');
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side search and filters
    useEffect(() => {
        let result = complaints;

        if (statusFilter !== 'All') {
            result = result.filter(c => c.status === statusFilter);
        }

        if (severityFilter !== 'All') {
            result = result.filter(c => c.severity_level === severityFilter);
        }

        if (searchTerm.trim() !== '') {
            const query = searchTerm.toLowerCase();
            result = result.filter(c => 
                c.id.toString().includes(query) ||
                c.location.toLowerCase().includes(query) ||
                (c.detected_damage && c.detected_damage.toLowerCase().includes(query)) ||
                (c.user && c.user.username && c.user.username.toLowerCase().includes(query))
            );
        }

        setFilteredComplaints(result);
    }, [searchTerm, statusFilter, severityFilter, complaints]);

    const handleUpdateStatusSubmit = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;

        setIsActionLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            // Post general and timeline metadata
            await complaintService.updateStatus(selectedComplaint.id, newStatus, {
                timeline_status: timelineStatus,
                officer: officer,
                remarks: remarks,
                work_date: workDate,
                scheduled_time: scheduledTime,
                assigned_team: assignedTeam,
                progress: progress,
                estimated_completion: estimatedCompletion
            });
            
            // If Completed and verification image is attached
            if ((newStatus === 'Completed' || timelineStatus === 'Completed') && afterImageFile) {
                const formData = new FormData();
                formData.append('after_image', afterImageFile);
                await complaintService.uploadAfterImage(selectedComplaint.id, formData);
            }

            setSuccessMessage(`Complaint #RD-${selectedComplaint.id} operations status saved.`);
            setSelectedComplaint(null);
            setAfterImageFile(null);
            fetchAdminData();
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update complaint status.');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Severity mapping colors
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
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Escalated': return 'bg-rose-100 text-rose-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    return (
        <div className="space-y-lg animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Operations Dashboard</h2>
                    <p className="text-on-surface-variant font-body-md">Real-time municipal road maintenance oversight.</p>
                </div>
            </header>

            {successMessage && (
                <div className="text-emerald-700 font-label-sm p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex gap-sm items-center">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{successMessage}</span>
                </div>
            )}

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
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">{stats.total}</h3>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                        <div className="bg-amber-100/50 text-amber-700 p-2 rounded-xl">
                            <span className="material-symbols-outlined">pending_actions</span>
                        </div>
                        <span className="text-label-sm text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">Review</span>
                    </div>
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">Pending</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">{stats.pending}</h3>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                        <div className="bg-blue-100/50 text-blue-700 p-2 rounded-xl">
                            <span className="material-symbols-outlined">engineering</span>
                        </div>
                        <span className="text-label-sm text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[10px]">Active</span>
                    </div>
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">In Progress</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">{stats.in_progress}</h3>
                </div>
                
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                        <div className="bg-emerald-100/50 text-emerald-700 p-2 rounded-xl">
                            <span className="material-symbols-outlined">task_alt</span>
                        </div>
                        <span className="text-label-sm text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Fixed</span>
                    </div>
                    <p className="text-label-sm text-outline uppercase font-bold tracking-wider">Resolved</p>
                    <h3 className="font-headline-lg text-headline-lg-mobile font-bold mt-1 text-on-surface">{stats.completed}</h3>
                </div>
            </section>

            {/* Bento Grid: Weekly Volume & Severity Mix */}
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
                            <span className="text-2xl font-bold text-rose-800 mt-xs">{severity.critical}</span>
                        </div>
                        <div className="p-md rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col">
                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">High</span>
                            <span className="text-2xl font-bold text-amber-800 mt-xs">{severity.high}</span>
                        </div>
                        <div className="p-md rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col">
                            <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Medium</span>
                            <span className="text-2xl font-bold text-blue-800 mt-xs">{severity.medium}</span>
                        </div>
                        <div className="p-md rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col">
                            <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">Low</span>
                            <span className="text-2xl font-bold text-slate-800 mt-xs">{severity.low}</span>
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

            {/* Detailed Incident List and Operations Section */}
            <section className="bg-white rounded-[20px] shadow-sm border border-slate-200/50 overflow-hidden">
                <div className="p-lg border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-md">
                    <div>
                        <h3 className="font-headline-md text-on-surface font-bold">Recent Complaints</h3>
                        <p className="text-body-sm text-on-surface-variant">Perform status updates and upload repair verifications.</p>
                    </div>
                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-xs">
                        <input 
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary placeholder:text-outline"
                            placeholder="Search location or ID..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-xl space-y-md">
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                    </div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="p-xl text-center text-on-surface-variant font-body-md py-12">
                        No reports logged match your search and filter criteria.
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
                                {filteredComplaints.map((complaint) => {
                                    const devImgUrl = complaint.image 
                                        ? (complaint.image.startsWith('http') ? complaint.image : `http://localhost:8000${complaint.image}`)
                                        : null;

                                    return (
                                        <tr key={complaint.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-lg py-md">
                                                <div className="flex items-center gap-md">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 flex items-center justify-center text-slate-300">
                                                        {devImgUrl ? (
                                                            <img className="w-full h-full object-cover" alt="hazard" src={devImgUrl} />
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
                                                <div className="flex items-center justify-end gap-xs">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedComplaint(complaint);
                                                            setNewStatus(complaint.status);
                                                            setTimelineStatus(complaint.status === 'Pending' ? 'Submitted' : complaint.status);
                                                            setOfficer('Zonal Inspector');
                                                            setRemarks(`Status updated to ${complaint.status}`);
                                                            setWorkDate('');
                                                            setScheduledTime('');
                                                            setAssignedTeam('');
                                                            setProgress(50);
                                                            setEstimatedCompletion('');
                                                        }}
                                                        className="p-1.5 text-primary hover:bg-primary/5 rounded-lg inline-flex items-center"
                                                        title="Update Operations Status"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                                    </button>
                                                    <Link 
                                                        to={`${ROUTES.TRACK}?id=${complaint.id}`}
                                                        className="p-1.5 text-outline hover:bg-slate-50 rounded-lg inline-flex items-center"
                                                        title="Track View"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Status Update Modal Overlay */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-md">
                    <div className="bg-white rounded-[20px] max-w-md w-full p-lg md:p-xl border border-slate-200 shadow-2xl space-y-lg animate-in zoom-in duration-200 text-left">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] text-outline uppercase font-bold">Update Complaint Status</span>
                                <h3 className="font-headline-md text-lg font-bold">ID: #RD-{selectedComplaint.id}</h3>
                            </div>
                            <button 
                                onClick={() => { setSelectedComplaint(null); setAfterImageFile(null); }}
                                className="p-1 hover:bg-slate-50 rounded-full"
                            >
                                <span className="material-symbols-outlined text-outline">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatusSubmit} className="space-y-md overflow-y-auto max-h-[75vh] pr-1">
                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold" htmlFor="modal-status">Operations Status</label>
                                <select 
                                    id="modal-status"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 text-body-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none cursor-pointer"
                                    value={newStatus}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNewStatus(val);
                                        // Auto map timeline default status
                                        setTimelineStatus(val === 'Pending' ? 'Submitted' : val);
                                    }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed (Resolved)</option>
                                    <option value="Escalated">Escalated</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold" htmlFor="modal-timeline-status">Timeline Event Status</label>
                                <select 
                                    id="modal-timeline-status"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2.5 text-body-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none cursor-pointer"
                                    value={timelineStatus}
                                    onChange={(e) => setTimelineStatus(e.target.value)}
                                >
                                    <option value="Submitted">Complaint Submitted</option>
                                    <option value="Complaint Assigned">Complaint Assigned</option>
                                    <option value="Work Scheduled">Work Scheduled</option>
                                    <option value="Work Started">Work Started</option>
                                    <option value="Work In Progress">Work In Progress</option>
                                    <option value="Completed">Repair Verification (Completed)</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold" htmlFor="modal-officer">Assigned Officer / Crew</label>
                                <input
                                    id="modal-officer"
                                    type="text"
                                    placeholder="e.g. Operations Crew Alpha"
                                    value={officer}
                                    onChange={(e) => setOfficer(e.target.value)}
                                    className="w-full px-sm py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none"
                                />
                            </div>

                            {/* Conditional Work Scheduled Details */}
                            {timelineStatus === 'Work Scheduled' && (
                                <div className="p-md bg-slate-50 border border-slate-200 rounded-xl space-y-md">
                                    <p className="font-label-sm text-primary uppercase font-bold text-[10px]">Schedule Repair Details</p>
                                    <div className="grid grid-cols-2 gap-sm">
                                        <div className="space-y-xs">
                                            <label className="block text-[11px] font-semibold text-outline" htmlFor="work-date">Work Date</label>
                                            <input 
                                                id="work-date"
                                                type="date"
                                                value={workDate}
                                                onChange={(e) => setWorkDate(e.target.value)}
                                                className="w-full px-sm py-2 bg-white border border-slate-200 rounded-lg text-body-sm"
                                            />
                                        </div>
                                        <div className="space-y-xs">
                                            <label className="block text-[11px] font-semibold text-outline" htmlFor="work-time">Scheduled Time</label>
                                            <input 
                                                id="work-time"
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full px-sm py-2 bg-white border border-slate-200 rounded-lg text-body-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-xs">
                                        <label className="block text-[11px] font-semibold text-outline" htmlFor="assigned-team">Assigned Maintenance Team</label>
                                        <input 
                                            id="assigned-team"
                                            type="text"
                                            placeholder="Crew Alpha 14"
                                            value={assignedTeam}
                                            onChange={(e) => setAssignedTeam(e.target.value)}
                                            className="w-full px-sm py-2 bg-white border border-slate-200 rounded-lg text-body-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Conditional Work In Progress slider */}
                            {timelineStatus === 'Work In Progress' && (
                                <div className="p-md bg-slate-50 border border-slate-200 rounded-xl space-y-xs">
                                    <div className="flex justify-between text-label-sm font-semibold">
                                        <span>Current Repair Progress</span>
                                        <span className="text-primary font-bold">{progress}%</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progress}
                                        onChange={(e) => setProgress(e.target.value)}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            )}

                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold" htmlFor="modal-est-completion">Estimated Completion Date</label>
                                <input
                                    id="modal-est-completion"
                                    type="datetime-local"
                                    value={estimatedCompletion}
                                    onChange={(e) => setEstimatedCompletion(e.target.value)}
                                    className="w-full px-sm py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold" htmlFor="modal-remarks">Progress Remarks</label>
                                <textarea
                                    id="modal-remarks"
                                    rows="2"
                                    placeholder="Enter timeline update remarks..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full px-sm py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none resize-none"
                                ></textarea>
                            </div>

                            {/* Show image upload verified field only if status is Completed */}
                            {(newStatus === 'Completed' || timelineStatus === 'Completed') && (
                                <div className="space-y-xs p-md bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <label className="block font-label-md text-emerald-800 font-bold text-xs" htmlFor="modal-after-image">
                                        Upload Verification Proof (After Repair Image)
                                    </label>
                                    <input 
                                        id="modal-after-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAfterImageFile(e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-md file:py-2 file:px-lg file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer"
                                    />
                                    <p className="text-[9px] text-emerald-600 uppercase font-semibold">
                                        Mandatory proof photo of restored road surface
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-md pt-sm border-t border-slate-100">
                                <button 
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="flex-1 bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-label-md font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-xs cursor-pointer"
                                >
                                    {isActionLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                    Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setSelectedComplaint(null); setAfterImageFile(null); }}
                                    className="flex-1 border border-slate-200 text-on-surface-variant py-3 rounded-xl font-label-md font-bold hover:bg-slate-50 transition-transform active:scale-95 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOperations;
