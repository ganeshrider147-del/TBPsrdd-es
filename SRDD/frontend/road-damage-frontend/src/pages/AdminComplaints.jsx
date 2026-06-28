import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { complaintService } from '../services/complaintService';

const AdminComplaints = () => {
    const [searchParams] = useSearchParams();
    const targetId = searchParams.get('id');

    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Filters and sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, severity, confidence

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Complaint selection for details modal/update status modal
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Status update & upload form states
    const [newStatus, setNewStatus] = useState('');
    const [timelineStatus, setTimelineStatus] = useState('');
    const [officer, setOfficer] = useState('');
    const [department, setDepartment] = useState('');
    const [remarks, setRemarks] = useState('');
    const [workDate, setWorkDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [assignedTeam, setAssignedTeam] = useState('');
    const [progress, setProgress] = useState(50);
    const [estimatedCompletion, setEstimatedCompletion] = useState('');
    const [afterImageFile, setAfterImageFile] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        if (complaints.length > 0 && targetId) {
            const match = complaints.find(c => c.id.toString() === targetId);
            if (match) {
                setSelectedComplaint(match);
            }
        }
    }, [complaints, targetId]);

    const fetchComplaints = async () => {
        setIsLoading(true);
        setError('');
        try {
            const listRes = await complaintService.getAll();
            setComplaints(listRes.data || []);
            setFilteredComplaints(listRes.data || []);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setError('Failed to retrieve system operations data.');
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side search, filters, sorting
    useEffect(() => {
        let result = [...complaints];

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
                (c.user_username && c.user_username.toLowerCase().includes(query)) ||
                (c.description && c.description.toLowerCase().includes(query))
            );
        }

        // Sorting
        if (sortBy === 'newest') {
            result.sort((a, b) => b.id - a.id);
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => a.id - b.id);
        } else if (sortBy === 'severity') {
            const priority = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
            result.sort((a, b) => (priority[b.severity_level] || 0) - (priority[a.severity_level] || 0));
        } else if (sortBy === 'confidence') {
            result.sort((a, b) => b.confidence - a.confidence);
        }

        setFilteredComplaints(result);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, severityFilter, sortBy, complaints]);

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
                department: department,
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
            setIsUpdatingStatus(false);
            setAfterImageFile(null);
            
            // Re-fetch to get updated details
            const listRes = await complaintService.getAll();
            setComplaints(listRes.data || []);
            const updated = (listRes.data || []).find(c => c.id === selectedComplaint.id);
            if (updated) {
                setSelectedComplaint(updated);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update complaint status.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDownloadReport = async (id) => {
        try {
            const blobData = await complaintService.downloadReport(id);
            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `road_report_RD-${id}.txt`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Error downloading report:', err);
            setError('Could not download text report.');
        }
    };

    const handlePrintReport = (complaint) => {
        const printWindow = window.open('', '_blank');
        const formattedTimeline = (complaint.timeline || []).map(t => `
            <div style="margin-bottom: 12px; padding-left: 8px; border-left: 2px solid #3d4cad;">
                <strong>[${new Date(t.created_at).toLocaleString()}] ${t.status}</strong>
                ${t.officer ? `<br/><span style="font-size: 11px; color:#555;">Officer: ${t.officer}</span>` : ''}
                ${t.remarks ? `<br/><span style="font-size: 12px;">Remarks: ${t.remarks}</span>` : ''}
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Report - #RD-${complaint.id}</title>
                    <style>
                        body { font-family: system-ui, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
                        h1 { color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                        .card { border: 1px solid #e2e8f0; padding: 15px; rounded: 12px; background: #f8fafc; }
                        .header-tag { display: inline-block; background: #3d4cad; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
                    </style>
                </head>
                <body onload="window.print();">
                    <h1>ROAD DETECTOR - MUNICIPAL HAZARD REPORT</h1>
                    <div style="margin-bottom: 20px;">
                        <span class="header-tag">RD-${complaint.id}</span>
                        <strong style="margin-left: 10px; font-size: 18px;">Status: ${complaint.status}</strong>
                    </div>
                    <div class="grid">
                        <div class="card">
                            <h3>General Details</h3>
                            <p><strong>Citizen Username:</strong> ${complaint.user_username || 'Anonymous'}</p>
                            <p><strong>Phone Number:</strong> ${complaint.phone_number || 'N/A'}</p>
                            <p><strong>Location:</strong> ${complaint.location}</p>
                            <p><strong>Description:</strong> ${complaint.description || 'N/A'}</p>
                            <p><strong>Reported Time:</strong> ${new Date(complaint.created_at).toLocaleString()}</p>
                        </div>
                        <div class="card">
                            <h3>AI Inspection Metrics</h3>
                            <p><strong>Damage Classification:</strong> ${complaint.detected_damage || 'Pothole'}</p>
                            <p><strong>Inspection Accuracy:</strong> ${complaint.confidence}%</p>
                            <p><strong>Damage Severity:</strong> ${complaint.severity_level || 'Low'}</p>
                            <p><strong>Suggested Action:</strong> ${complaint.ai_summary || 'Manual review required'}</p>
                        </div>
                    </div>
                    <div class="card" style="margin-bottom: 20px;">
                        <h3>Timeline Events</h3>
                        ${formattedTimeline || '<p>No timeline events log recorded.</p>'}
                    </div>
                    <div style="font-size: 11px; text-align: center; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        Report generated by Road Detector System on ${new Date().toLocaleString()}.
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Pagination helper
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentComplaints = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

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
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Manage Complaints</h2>
                    <p className="text-on-surface-variant font-body-md">Inspect citizen reports, run status updates, assign crews, and audit timelines.</p>
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

            {/* Filter toolbar */}
            <section className="bg-white p-md md:p-lg rounded-[20px] shadow-sm border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-md">
                <div className="flex flex-1 flex-col sm:flex-row gap-xs items-stretch sm:items-center">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">search</span>
                        <input 
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary placeholder:text-outline"
                            placeholder="Search by ID, Location, Damage, Citizen..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-md py-2 text-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Work Scheduled">Work Scheduled</option>
                        <option value="Work Started">Work Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Repair Verification">Repair Verification</option>
                        <option value="Completed">Completed</option>
                        <option value="Closed">Closed</option>
                        <option value="Escalated">Escalated</option>
                    </select>

                    {/* Severity Filter */}
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-md py-2 text-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                        <option value="All">All Severities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>

                    {/* Sorting */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-md py-2 text-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="severity">Highest Severity</option>
                        <option value="confidence">Highest Accuracy</option>
                    </select>
                </div>
            </section>

            {/* Complaints list and detail view layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
                {/* List Pane */}
                <section className="lg:col-span-2 bg-white rounded-[20px] shadow-sm border border-slate-200/50 overflow-hidden">
                    {isLoading ? (
                        <div className="p-xl space-y-md">
                            <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                            <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                            <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                        </div>
                    ) : currentComplaints.length === 0 ? (
                        <div className="p-xl text-center text-on-surface-variant font-body-md py-12">
                            No reports logged match your search and filter criteria.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-[10px] text-outline uppercase font-bold tracking-wider border-b border-slate-100">
                                            <th className="px-lg py-md">Details</th>
                                            <th className="px-lg py-md">Location</th>
                                            <th className="px-lg py-md">Severity</th>
                                            <th className="px-lg py-md">Status</th>
                                            <th className="px-lg py-md text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-body-sm">
                                        {currentComplaints.map((complaint) => (
                                            <tr 
                                                key={complaint.id} 
                                                onClick={() => setSelectedComplaint(complaint)}
                                                className={`cursor-pointer transition-colors ${
                                                    selectedComplaint?.id === complaint.id ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50/50'
                                                }`}
                                            >
                                                <td className="px-lg py-md">
                                                    <div className="flex items-center gap-md">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 flex items-center justify-center text-slate-300">
                                                            {complaint.image ? (
                                                                <img className="w-full h-full object-cover" alt="hazard" src={complaint.image} />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-lg">image</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-on-surface">{complaint.detected_damage || complaint.damage_type || 'Road Damage'}</p>
                                                            <p className="text-[9px] text-outline">ID: #RD-{complaint.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-lg py-md font-medium max-w-[150px] truncate">{complaint.location}</td>
                                                <td className="px-lg py-md">
                                                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getSeverityColor(complaint.severity_level)}`}>
                                                        {complaint.severity_level || 'Low'}
                                                    </span>
                                                </td>
                                                <td className="px-lg py-md">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(complaint.status)}`}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                                <td className="px-lg py-md text-right">
                                                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="p-md bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs">
                                    <span className="text-on-surface-variant font-medium">
                                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredComplaints.length)} of {filteredComplaints.length}
                                    </span>
                                    <div className="flex gap-xs">
                                        <button 
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 font-bold transition-all"
                                        >
                                            Previous
                                        </button>
                                        <button 
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 font-bold transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Detail View Pane */}
                <section className="bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg space-y-lg">
                    {selectedComplaint ? (
                        <>
                            <div className="flex justify-between items-start border-b border-slate-100 pb-sm">
                                <div>
                                    <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Complaint Inspector</span>
                                    <h3 className="font-headline-md text-lg font-bold text-on-surface">Reference: #RD-{selectedComplaint.id}</h3>
                                </div>
                                <div className="flex gap-xs">
                                    <button 
                                        onClick={() => handleDownloadReport(selectedComplaint.id)}
                                        className="p-1.5 text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg"
                                        title="Download TXT Report"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                    </button>
                                    <button 
                                        onClick={() => handlePrintReport(selectedComplaint)}
                                        className="p-1.5 text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg"
                                        title="Print Report"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">print</span>
                                    </button>
                                </div>
                            </div>

                            {/* Images Comparison */}
                            <div className="grid grid-cols-2 gap-sm">
                                <div className="space-y-xs">
                                    <span className="text-[10px] text-outline font-bold uppercase">Before Repair</span>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                        {selectedComplaint.image ? (
                                            <a href={selectedComplaint.image} target="_blank" rel="noreferrer">
                                                <img className="w-full h-full object-cover hover:scale-105 transition-transform" alt="before" src={selectedComplaint.image} />
                                            </a>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image uploaded</div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-xs">
                                    <span className="text-[10px] text-outline font-bold uppercase">After Repair</span>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                                        {selectedComplaint.after_image ? (
                                            <a href={selectedComplaint.after_image} target="_blank" rel="noreferrer">
                                                <img className="w-full h-full object-cover hover:scale-105 transition-transform" alt="after" src={selectedComplaint.after_image} />
                                            </a>
                                        ) : (
                                            <span className="text-outline text-[11px] font-medium text-center px-xs">Awaiting Completion Verification</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Details */}
                            <div className="space-y-md text-xs border-b border-slate-100 pb-md">
                                <div className="grid grid-cols-2 gap-md">
                                    <div>
                                        <span className="text-[10px] text-outline font-bold uppercase">Citizen Reporter</span>
                                        <p className="font-bold text-on-surface mt-0.5">{selectedComplaint.user_username || 'Anonymous Citizen'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-outline font-bold uppercase">Phone Number</span>
                                        <p className="font-bold text-on-surface mt-0.5">{selectedComplaint.phone_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-outline font-bold uppercase">Location</span>
                                        <p className="font-semibold text-on-surface mt-0.5 truncate" title={selectedComplaint.location}>{selectedComplaint.location}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-outline font-bold uppercase">Report Date</span>
                                        <p className="font-semibold text-on-surface mt-0.5">{new Date(selectedComplaint.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-outline font-bold uppercase">Inspection Match</span>
                                        <p className="font-bold text-primary mt-0.5">{selectedComplaint.detected_damage || 'No Damage'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-outline font-bold uppercase">Inspection Accuracy</span>
                                        <p className="font-bold text-on-surface mt-0.5">{selectedComplaint.confidence}%</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-outline font-bold uppercase">Damage Severity</span>
                                        <p className="font-bold text-rose-700 mt-0.5">{selectedComplaint.severity_level || 'Low'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-outline font-bold uppercase">Assigned Officer / Crew</span>
                                        <p className="font-semibold text-on-surface mt-0.5">{selectedComplaint.assigned_officer || 'None Assigned'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Log */}
                            <div className="space-y-sm text-xs">
                                <h4 className="text-[10px] text-outline font-bold uppercase tracking-wider">Complaint Timeline</h4>
                                <div className="space-y-md border-l-2 border-slate-100 pl-4 py-2 ml-2">
                                    {(selectedComplaint.timeline || []).map((t, idx) => (
                                        <div key={idx} className="relative space-y-0.5">
                                            <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-white" />
                                            <p className="font-bold text-on-surface">{t.status}</p>
                                            <p className="text-[9px] text-outline">{new Date(t.created_at).toLocaleString()}</p>
                                            {t.remarks && <p className="text-on-surface-variant text-[11px] leading-relaxed italic">{t.remarks}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Action button */}
                            <button 
                                onClick={() => {
                                    setNewStatus(selectedComplaint.status);
                                    setTimelineStatus(selectedComplaint.status === 'Pending' ? 'Submitted' : selectedComplaint.status);
                                    setOfficer(selectedComplaint.assigned_officer || 'Zonal Inspector');
                                    setDepartment(selectedComplaint.assigned_team || 'Municipal Roads Dept');
                                    setRemarks(`Timeline update for complaint #RD-${selectedComplaint.id}`);
                                    setWorkDate('');
                                    setScheduledTime('');
                                    setAssignedTeam(selectedComplaint.assigned_team || '');
                                    setProgress(selectedComplaint.timeline?.[selectedComplaint.timeline.length - 1]?.progress || 50);
                                    setEstimatedCompletion(selectedComplaint.estimated_completion ? selectedComplaint.estimated_completion.slice(0, 16) : '');
                                    setIsUpdatingStatus(true);
                                }}
                                className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-label-md font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-xs cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">edit_note</span>
                                Update Status & Timelines
                            </button>
                        </>
                    ) : (
                        <div className="text-center text-outline font-body-md py-12">
                            Select a complaint from the list to display details and trigger actions.
                        </div>
                    )}
                </section>
            </div>

            {/* Status Update Modal */}
            {isUpdatingStatus && selectedComplaint && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-md">
                    <div className="bg-white rounded-[20px] max-w-md w-full p-lg md:p-xl border border-slate-200 shadow-2xl space-y-lg animate-in zoom-in duration-200 text-left">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] text-outline uppercase font-bold">Update Complaint Status</span>
                                <h3 className="font-headline-md text-lg font-bold">ID: #RD-{selectedComplaint.id}</h3>
                            </div>
                            <button 
                                onClick={() => { setIsUpdatingStatus(false); setAfterImageFile(null); }}
                                className="p-1 hover:bg-slate-50 rounded-full"
                            >
                                <span className="material-symbols-outlined text-outline">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatusSubmit} className="space-y-md overflow-y-auto max-h-[70vh] pr-1">
                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold text-xs" htmlFor="modal-status">Operations Status</label>
                                <select 
                                    id="modal-status"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 text-xs focus:ring-4 focus:ring-primary/10 outline-none cursor-pointer"
                                    value={newStatus}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNewStatus(val);
                                        setTimelineStatus(val === 'Pending' ? 'Submitted' : val);
                                    }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="Work Scheduled">Work Scheduled</option>
                                    <option value="Work Started">Work Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Repair Verification">Repair Verification</option>
                                    <option value="Completed">Completed (Resolved)</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Escalated">Escalated</option>
                                </select>
                            </div>

                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold text-xs" htmlFor="modal-timeline-status">Timeline Event Status</label>
                                <select 
                                    id="modal-timeline-status"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 text-xs focus:ring-4 focus:ring-primary/10 outline-none cursor-pointer"
                                    value={timelineStatus}
                                    onChange={(e) => setTimelineStatus(e.target.value)}
                                >
                                    <option value="Submitted">Complaint Submitted</option>
                                    <option value="Complaint Assigned">Complaint Assigned</option>
                                    <option value="Work Scheduled">Work Scheduled</option>
                                    <option value="Work Started">Work Started</option>
                                    <option value="Work In Progress">Work In Progress</option>
                                    <option value="Repair Verification">Repair Verification</option>
                                    <option value="Completed">Repair Verification (Completed)</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-sm">
                                <div className="space-y-xs">
                                    <label className="block font-label-md text-on-surface font-semibold text-xs" htmlFor="modal-officer">Assigned Officer / Lead</label>
                                    <input
                                        id="modal-officer"
                                        type="text"
                                        placeholder="e.g. Officer Alpha"
                                        value={officer}
                                        onChange={(e) => setOfficer(e.target.value)}
                                        className="w-full px-sm py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-primary/10 outline-none"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="block font-label-md text-on-surface font-semibold text-xs" htmlFor="modal-dept">Department</label>
                                    <input
                                        id="modal-dept"
                                        type="text"
                                        placeholder="e.g. Zone 1 Maintenance"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full px-sm py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-primary/10 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Scheduled parameters */}
                            {timelineStatus === 'Work Scheduled' && (
                                <div className="p-sm bg-slate-50 border border-slate-200 rounded-xl space-y-md">
                                    <span className="text-[9px] text-primary uppercase font-bold">Scheduled Timings</span>
                                    <div className="grid grid-cols-2 gap-xs">
                                        <div className="space-y-xs">
                                            <label className="block text-[10px] text-outline font-semibold" htmlFor="work-date">Work Date</label>
                                            <input 
                                                id="work-date"
                                                type="date"
                                                value={workDate}
                                                onChange={(e) => setWorkDate(e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                            />
                                        </div>
                                        <div className="space-y-xs">
                                            <label className="block text-[10px] text-outline font-semibold" htmlFor="work-time">Work Time</label>
                                            <input 
                                                id="work-time"
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-xs">
                                        <label className="block text-[10px] text-outline font-semibold" htmlFor="assigned-team">Assigned Maintenance Team</label>
                                        <input 
                                            id="assigned-team"
                                            type="text"
                                            placeholder="Crew Unit 4"
                                            value={assignedTeam}
                                            onChange={(e) => setAssignedTeam(e.target.value)}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Work In Progress percentage slider */}
                            {timelineStatus === 'Work In Progress' && (
                                <div className="p-sm bg-slate-50 border border-slate-200 rounded-xl space-y-xs">
                                    <div className="flex justify-between text-[11px] font-semibold text-on-surface">
                                        <span>Current Repair Progress</span>
                                        <span className="text-primary font-bold">{progress}%</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progress}
                                        onChange={(e) => setProgress(e.target.value)}
                                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            )}

                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold text-xs" htmlFor="modal-est-completion">Expected Completion Date</label>
                                <input
                                    id="modal-est-completion"
                                    type="datetime-local"
                                    value={estimatedCompletion}
                                    onChange={(e) => setEstimatedCompletion(e.target.value)}
                                    className="w-full px-sm py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-primary/10 outline-none"
                                />
                            </div>

                            <div className="space-y-xs">
                                <label className="block font-label-md text-on-surface font-semibold text-xs" htmlFor="modal-remarks">Timeline Remarks</label>
                                <textarea
                                    id="modal-remarks"
                                    rows="2"
                                    placeholder="Brief timeline update details..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full px-sm py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-primary/10 outline-none resize-none"
                                ></textarea>
                            </div>

                            {/* Repair completed verifications image upload */}
                            {(newStatus === 'Completed' || timelineStatus === 'Completed') && (
                                <div className="space-y-xs p-md bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <label className="block font-label-md text-emerald-800 font-bold text-[11px]" htmlFor="modal-after-image">
                                        Upload Verification Image (Post Repair Photo)
                                    </label>
                                    <input 
                                        id="modal-after-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAfterImageFile(e.target.files[0])}
                                        className="w-full text-[10px] text-slate-500 file:mr-md file:py-1.5 file:px-md file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer"
                                    />
                                    <p className="text-[9px] text-emerald-600 uppercase font-semibold">
                                        Restored road surface visual audit verification proof
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-md pt-sm border-t border-slate-100">
                                <button 
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="flex-1 bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl font-label-md font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-xs cursor-pointer text-xs"
                                >
                                    {isActionLoading && <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>}
                                    Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setIsUpdatingStatus(false); setAfterImageFile(null); }}
                                    className="flex-1 border border-slate-200 text-on-surface-variant py-2.5 rounded-xl font-label-md font-bold hover:bg-slate-50 transition-transform active:scale-95 cursor-pointer text-xs"
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

export default AdminComplaints;
