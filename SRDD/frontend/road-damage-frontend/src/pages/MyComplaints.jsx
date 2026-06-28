import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { ROUTES } from '../constants/routes';
import { getMediaUrl } from '../services/api';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                setIsLoading(true);
                const response = await complaintService.getMyList();
                setComplaints(response.data || []);
                setFilteredComplaints(response.data || []);
            } catch (err) {
                console.error('Error fetching complaints:', err);
                setError('Failed to load complaint history. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    // Filter complaints when search term or selected status changes
    useEffect(() => {
        let result = complaints;

        if (selectedStatus !== 'All') {
            const statusMap = {
                'Pending': 'Pending',
                'In Progress': 'In Progress',
                'Resolved': 'Completed',
                'Escalated': 'Escalated'
            };
            result = result.filter(c => c.status === statusMap[selectedStatus]);
        }

        if (searchTerm.trim() !== '') {
            const query = searchTerm.toLowerCase();
            result = result.filter(c => 
                c.id.toString().includes(query) || 
                c.location.toLowerCase().includes(query) || 
                (c.detected_damage && c.detected_damage.toLowerCase().includes(query)) ||
                (c.damage_type && c.damage_type.toLowerCase().includes(query))
            );
        }

        setFilteredComplaints(result);
    }, [searchTerm, selectedStatus, complaints]);

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
    };

    return (
        <div className="space-y-lg animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                <div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Complaint History</h2>
                    <p className="font-body-md text-on-surface-variant">Review and track the status of your reported infrastructure issues.</p>
                </div>
                <Link 
                    to={ROUTES.REPORT} 
                    className="bg-primary hover:bg-primary-container text-white px-lg py-3 rounded-xl flex items-center justify-center gap-sm transition-all shadow-md active:scale-95 w-full md:w-auto font-label-md font-bold"
                >
                    <span className="material-symbols-outlined">add</span>
                    Report New Issue
                </Link>
            </div>

            {error && (
                <div className="text-error font-label-sm p-3 bg-error-container/20 rounded-xl border border-error/20 flex gap-sm items-center">
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Sticky Search & Filter Controls */}
            <div className="bg-[#F8FAFC]/90 backdrop-blur-sm py-sm space-y-md">
                {/* Search Bar */}
                <div className="relative w-full max-w-2xl group focus-within:scale-[1.01] transition-transform">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-body-md shadow-sm transition-all" 
                        placeholder="Search by ID, location, or issue type..." 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Filter Chips */}
                <div className="flex flex-wrap gap-sm">
                    {['All', 'Pending', 'In Progress', 'Resolved', 'Escalated'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusFilter(status)}
                            className={`px-md py-2 rounded-full font-label-md transition-all text-xs font-semibold ${
                                selectedStatus === status 
                                ? 'bg-primary text-white shadow-sm' 
                                : 'bg-white border border-slate-200 text-on-surface-variant hover:bg-slate-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Complaint List Container */}
            {isLoading ? (
                <div className="space-y-md py-8">
                    <div className="h-28 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
                    <div className="h-28 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
                    <div className="h-28 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
                </div>
            ) : filteredComplaints.length === 0 ? (
                <div className="py-3xl flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200/50 p-xl shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-md text-outline">
                        <span className="material-symbols-outlined text-3xl">history</span>
                    </div>
                    <h3 className="font-headline-md text-xl mb-sm font-bold text-on-surface">No complaints found</h3>
                    <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mb-lg">
                        {searchTerm || selectedStatus !== 'All' 
                            ? 'No reports match your current search queries or status filters.' 
                            : 'It looks like your history is clean! If you spot a hazard on the road, let us know.'}
                    </p>
                    <Link 
                        to={ROUTES.REPORT}
                        className="bg-primary text-white px-xl py-3 rounded-xl font-label-md font-bold shadow-md hover:scale-[1.02] transition-all active:scale-95"
                    >
                        Report Road Hazard
                    </Link>
                </div>
            ) : (
                <div className="space-y-md">
                    {filteredComplaints.map((complaint) => {
                        const devImgUrl = getMediaUrl(complaint.image);
                        const dateStr = complaint.created_at 
                            ? new Date(complaint.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Date Unknown';

                        return (
                            <div 
                                key={complaint.id}
                                className="premium-card bg-white border border-slate-200/60 rounded-2xl p-lg flex flex-col md:flex-row gap-lg group shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
                            >
                                <div className="w-full md:w-48 h-32 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center text-slate-300">
                                    {devImgUrl ? (
                                        <img 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            alt="road damage" 
                                            src={devImgUrl}
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl">image</span>
                                    )}
                                </div>
                                <div className="flex-grow flex flex-col justify-between space-y-md md:space-y-0">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-xs">
                                            <div className="flex items-center gap-sm">
                                                <span className="font-label-sm text-outline uppercase tracking-wider text-xs font-bold">REF: RD-{complaint.id}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="font-label-sm text-outline text-xs">{dateStr}</span>
                                            </div>
                                            <h3 className="font-headline-md text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                                                {complaint.detected_damage || complaint.damage_type || 'Road Damage'}
                                            </h3>
                                            <div className="flex items-center gap-xs text-on-surface-variant font-body-sm text-body-sm">
                                                <span className="material-symbols-outlined text-md">location_on</span>
                                                <span>{complaint.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className={`status-badge px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                complaint.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                complaint.status === 'Escalated' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {complaint.status === 'Completed' ? 'Resolved' : complaint.status}
                                            </span>
                                            {complaint.confidence > 0 && (
                                                <div className="ai-glass-card border border-primary/10 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                                                    <span className="font-label-sm text-[10px] text-primary uppercase font-bold">Accuracy</span>
                                                    <span className="font-headline-md text-primary text-sm font-bold">{complaint.confidence}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-md border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[11px] text-outline-variant font-medium">Damage Severity: {complaint.severity_level || 'Low'}</span>
                                        <Link 
                                            to={`${ROUTES.TRACK}?id=${complaint.id}`}
                                            className="text-primary font-label-md flex items-center gap-1 hover:underline font-bold text-xs"
                                        >
                                            View details
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyComplaints;
