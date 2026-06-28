import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { getMediaUrl } from '../services/api';

const TrackComplaint = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchId, setSearchId] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Feedback submission states
    const [rating, setRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');
    const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState('');

    const queryId = searchParams.get('id');

    useEffect(() => {
        if (queryId) {
            fetchComplaintDetails(queryId);
        } else {
            setComplaint(null);
        }
        setFeedbackSuccess('');
    }, [queryId]);

    const fetchComplaintDetails = async (id) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await complaintService.getTrack(id);
            setComplaint(response.data);
            setSearchId(id);
        } catch (err) {
            console.error('Error tracking complaint:', err);
            setComplaint(null);
            const errorMsg = err.response?.data?.error || 'Complaint not found. Please verify the ID and try again.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchId.trim()) {
            const numericId = searchId.replace(/\D/g, '');
            if (numericId) {
                setSearchParams({ id: numericId });
            } else {
                setSearchParams({ id: searchId });
            }
        }
    };

    const handleDownloadReport = async () => {
        if (!complaint) return;
        try {
            const blob = await complaintService.downloadReport(complaint.id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `road_report_RD-${complaint.id}.txt`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Error downloading report:', err);
            setError('Failed to download report.');
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!complaint) return;
        setIsFeedbackSubmitting(true);
        try {
            const res = await complaintService.submitFeedback(complaint.id, rating, feedbackText);
            setComplaint(res.data);
            setFeedbackSuccess('Thank you! Your feedback has been registered.');
            setFeedbackText('');
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError('Failed to submit feedback.');
        } finally {
            setIsFeedbackSubmitting(false);
        }
    };

    // Date formatting helper
    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const beforeImg = getMediaUrl(complaint?.image);
    const afterImg = getMediaUrl(complaint?.after_image);

    return (
        <div className="max-w-2xl mx-auto space-y-lg animate-in fade-in duration-300">
            {/* Search Header Section */}
            <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                <div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Track Complaint</h2>
                    <p className="font-body-md text-on-surface-variant">Enter a numeric reference ID to check the repair timeline status.</p>
                </div>
                <form onSubmit={handleSearchSubmit} className="relative group focus-within:scale-[1.01] transition-transform">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input 
                        className="w-full pl-12 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-body-md shadow-sm" 
                        placeholder="e.g. 1" 
                        type="text"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        required
                    />
                    <button 
                        type="submit" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-container text-white px-lg py-2 rounded-lg font-label-md font-bold transition-all"
                    >
                        Search
                    </button>
                </form>
            </section>

            {error && (
                <div className="text-error font-label-sm p-3 bg-error-container/20 rounded-xl border border-error/20 flex gap-sm items-center">
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                </div>
            )}

            {isLoading && (
                <div className="bg-white rounded-[20px] p-xl border border-slate-200/50 flex flex-col items-center justify-center space-y-md shadow-sm py-16 animate-pulse">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    <span className="font-label-md text-outline">Retrieving complaint status...</span>
                </div>
            )}

            {/* Tracking Result View */}
            {complaint && !isLoading && (
                <div className="space-y-lg">
                    {/* Status Info Card */}
                    <div className="bg-white rounded-[20px] p-lg border border-slate-200/50 shadow-sm space-y-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Reference ID</span>
                                <h3 className="font-headline-md text-primary font-bold">#RD-{complaint.id}</h3>
                            </div>
                            <div className="flex items-center gap-sm">
                                <button 
                                    onClick={handleDownloadReport}
                                    className="px-3 py-1.5 border border-slate-200 text-on-surface-variant rounded-lg font-label-sm text-xs font-semibold hover:bg-slate-50 flex items-center gap-xs transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">download</span>
                                    Report TXT
                                </button>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    complaint.status === 'Completed' || complaint.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' :
                                    complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                    complaint.status === 'Escalated' ? 'bg-rose-100 text-rose-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {complaint.status === 'Completed' ? 'Resolved' : complaint.status}
                                </span>
                            </div>
                        </div>

                        {/* Image Previews */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            {/* Before Image */}
                            <div className="space-y-xs">
                                <span className="text-[10px] text-outline uppercase font-bold">Reported Damage</span>
                                <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50">
                                    {beforeImg ? (
                                        <img className="w-full h-full object-cover" alt="original report" src={beforeImg} />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
                                    )}
                                </div>
                            </div>
                            {/* After Image */}
                            <div className="space-y-xs">
                                <span className="text-[10px] text-outline uppercase font-bold">Verification Proof (After Repair)</span>
                                <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50">
                                    {afterImg ? (
                                        <img className="w-full h-full object-cover" alt="repaired verify" src={afterImg} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center p-sm space-y-1">
                                            <span className="material-symbols-outlined text-3xl text-slate-300">verified</span>
                                            <span className="text-[10px] font-bold text-outline uppercase">Awaiting Completion</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="bg-slate-50 rounded-xl p-md grid grid-cols-2 gap-sm text-left border border-slate-100">
                            <div>
                                <span className="text-[10px] text-outline uppercase font-bold">Location</span>
                                <p className="text-body-sm font-bold text-on-surface truncate">{complaint.location}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-outline uppercase font-bold">Damage Type</span>
                                <p className="text-body-sm font-bold text-on-surface">{complaint.detected_damage || complaint.damage_type || 'Unknown'}</p>
                            </div>
                            <div className="pt-xs">
                                <span className="text-[10px] text-outline uppercase font-bold">Detection Accuracy</span>
                                <p className="text-body-sm font-bold text-primary">{complaint.confidence}%</p>
                            </div>
                            <div className="pt-xs">
                                <span className="text-[10px] text-outline uppercase font-bold">Damage Severity</span>
                                <p className="text-body-sm font-bold text-on-surface">{complaint.severity_level || 'Low'}</p>
                            </div>
                        </div>

                        {/* Timeline Tracker */}
                        <div className="border-t border-slate-100 pt-md text-left">
                            <h4 className="font-label-md text-on-surface font-bold uppercase tracking-wider mb-md">Timeline Log</h4>
                            
                            {(!complaint.timeline || complaint.timeline.length === 0) ? (
                                <p className="text-body-sm text-on-surface-variant italic">No status timeline logged in database.</p>
                            ) : (
                                <div className="relative pl-8 space-y-lg">
                                    {/* Line background */}
                                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200"></div>

                                    {complaint.timeline.map((entry, idx) => {
                                        const isLast = idx === complaint.timeline.length - 1;
                                        return (
                                            <div key={entry.id} className="relative">
                                                {/* Icon container */}
                                                <div className={`absolute -left-[26px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                    isLast ? 'border-primary bg-primary shadow-sm' : 'border-slate-400 bg-slate-400'
                                                }`}>
                                                    {isLast ? (
                                                        <span className="material-symbols-outlined text-[12px] text-white" style={{ fontVariationSettings: '"FILL" 1' }}>adjust</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[10px] text-white">check</span>
                                                    )}
                                                </div>
                                                <div className="space-y-xs">
                                                    <div className="flex justify-between items-center">
                                                        <p className={`font-label-md text-sm ${isLast ? 'text-primary font-bold' : 'text-on-surface font-semibold'}`}>
                                                            {entry.status}
                                                        </p>
                                                        <span className="text-[10px] text-outline font-medium">{formatDate(entry.created_at)}</span>
                                                    </div>
                                                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{entry.remarks}</p>
                                                    <p className="text-[9px] text-outline font-bold uppercase">Officer: {entry.officer || 'Inspector'}</p>
                                                    {entry.estimated_completion && (
                                                        <p className="text-[10px] text-primary font-semibold">Estimated Completion: {formatDate(entry.estimated_completion)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feedback Form (Visible when status is Completed or Closed and feedback hasn't been submitted) */}
                    {(complaint.status === 'Completed' || complaint.status === 'Closed') && (
                        <div className="bg-white rounded-[20px] p-lg border border-emerald-100 shadow-sm space-y-md text-left">
                            <div className="flex items-center gap-sm">
                                <span className="material-symbols-outlined text-emerald-700">rate_review</span>
                                <h3 className="font-headline-md text-lg text-emerald-800 font-bold">RATE COMPLETED WORK</h3>
                            </div>
                            
                            {feedbackSuccess && (
                                <div className="text-emerald-700 font-label-sm p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                    {feedbackSuccess}
                                </div>
                            )}

                            {complaint.rating ? (
                                <div className="space-y-xs bg-slate-50 p-md rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span 
                                                key={star} 
                                                className={`material-symbols-outlined ${
                                                    star <= complaint.rating ? 'text-amber-500' : 'text-slate-200'
                                                }`}
                                                style={{ fontVariationSettings: "'FILL' 1" }}
                                            >
                                                star
                                            </span>
                                        ))}
                                    </div>
                                    <p className="font-label-md text-on-surface font-semibold">Your Review Comments:</p>
                                    <p className="text-body-sm text-on-surface-variant italic">"{complaint.feedback_text || 'No comments provided'}"</p>
                                </div>
                            ) : (
                                <form onSubmit={handleFeedbackSubmit} className="space-y-md">
                                    <div className="space-y-xs">
                                        <p className="font-label-md text-on-surface">Asphalt Restoring Rating</p>
                                        <div className="flex items-center gap-sm">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className="focus:outline-none transition-transform active:scale-90"
                                                >
                                                    <span 
                                                        className={`material-symbols-outlined text-3xl ${
                                                            star <= rating ? 'text-amber-400' : 'text-slate-200'
                                                        }`}
                                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                                    >
                                                        star
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-xs">
                                        <label className="block font-label-md text-on-surface" htmlFor="feedback-comment">Feedback Comments</label>
                                        <textarea
                                            id="feedback-comment"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-body-sm"
                                            placeholder="Write your feedback regarding the repair quality..."
                                            rows="3"
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isFeedbackSubmitting}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-label-md font-bold px-lg py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-70"
                                    >
                                        {isFeedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrackComplaint;
