import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { ROUTES } from '../constants/routes';
import { getMediaUrl } from '../services/api';

const ReportDamage = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedComplaint, setSubmittedComplaint] = useState(null);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef(null);

    const handleFiles = (selectedFiles) => {
        if (selectedFiles.length === 0) return;
        const selectedFile = selectedFiles[0];
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const removePreview = () => {
        setFile(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate Indian mobile number
        const phoneRegex = /^(\+91|91)?[6789]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            setError('Please enter a valid Indian mobile number.');
            return;
        }
        
        if (!file) {
            setError("Please upload an image of the road damage.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('location', location || 'Unknown Location');
        formData.append('phone_number', phone);
        formData.append('damage_type', 'Pothole'); // default serializer placeholder

        try {
            const response = await complaintService.create(formData);
            setSubmittedComplaint(response.data);
        } catch (err) {
            setError("Failed to submit the report. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // If report is submitted, display the premium AI Analysis report screen
    if (submittedComplaint) {
        const devImgUrl = getMediaUrl(submittedComplaint.image) || preview;

        const severity = submittedComplaint.severity_level || 'Low';
        const isCritical = severity === 'Critical' || severity === 'High';
        const repairPriority = severity === 'Critical' ? 'Urgent (Within 24 Hours)' : severity === 'High' ? 'High (Within 48 Hours)' : 'Standard (Within 7 Days)';

        return (
            <div className="max-w-2xl mx-auto space-y-lg animate-in fade-in duration-500">
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg md:p-xl text-center space-y-md">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Report Submitted Successfully</h2>
                    <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                        Your report has been successfully registered in the platform registry. Reference ID: <span className="font-bold text-primary">#RD-{submittedComplaint.id}</span>
                    </p>
                </div>

                {/* Damage Report Card */}
                <section className="bg-surface-container rounded-[20px] p-lg border border-primary-container/10 relative overflow-hidden space-y-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>summarize</span>
                            <h3 className="font-headline-md text-[18px] text-primary font-bold">DAMAGE REPORT</h3>
                        </div>
                        <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-bold text-primary border border-primary-container/20">VERIFIED STATUS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                        <div className="bg-white rounded-xl p-md flex items-center gap-sm shadow-sm border border-slate-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                            <span className="font-label-sm uppercase text-on-surface-variant">Detected Damage: {submittedComplaint.detected_damage || 'Surface Hazard'}</span>
                        </div>
                        <div className="bg-white rounded-xl p-md flex items-center gap-sm shadow-sm border border-slate-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <span className="font-label-sm uppercase text-on-surface-variant">Detection Accuracy: {submittedComplaint.confidence || '0'}%</span>
                        </div>
                    </div>

                    {/* Image Preview with overlay */}
                    <div className="relative rounded-xl overflow-hidden h-64 border border-primary-container/20 bg-black/5 flex items-center justify-center">
                        <img className="w-full h-full object-cover" alt="Damage analysis" src={devImgUrl} />
                        {/* Simulated bounding box for display */}
                        <div className="bounding-box" style={{ top: '25%', left: '25%', width: '50%', height: '50%' }}>
                            <span className="absolute -top-6 left-0 bg-primary text-[8px] text-white px-2 py-0.5 rounded font-bold uppercase">
                                {submittedComplaint.detected_damage || 'HAZARD'} ACCURACY {submittedComplaint.confidence || '0'}%
                            </span>
                        </div>
                    </div>

                    {/* Details Breakdown */}
                    <div className="bg-white rounded-xl p-lg border border-slate-100 space-y-md text-left">
                        <div className="grid grid-cols-2 gap-md border-b border-slate-100 pb-md">
                            <div>
                                <span className="text-[10px] text-outline uppercase font-bold">Damage Severity</span>
                                <p className={`font-headline-md text-lg font-bold ${isCritical ? 'text-error' : 'text-amber-600'}`}>
                                    {severity}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] text-outline uppercase font-bold">Repair Priority</span>
                                <p className={`font-headline-md text-lg font-bold ${isCritical ? 'text-error' : 'text-primary'}`}>
                                    {repairPriority}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-xs">
                            <span className="text-[10px] text-outline uppercase font-bold">Damage Assessment</span>
                            <p className="text-body-sm text-on-surface-variant leading-relaxed">
                                An automated analysis evaluated this hazard as a <span className="font-bold text-on-surface">{submittedComplaint.detected_damage || 'road surface issue'}</span>. Based on the detection accuracy of {submittedComplaint.confidence}%, regional public works maintenance dispatch is assigned.
                            </p>
                        </div>

                        <div className="space-y-xs">
                            <span className="text-[10px] text-outline uppercase font-bold">Suggested Actions</span>
                            <p className="text-body-sm text-on-surface-variant leading-relaxed">
                                Route to Zone Maintenance Crew. Deploy mobile team for pothole repair or asphalt sealing.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="flex gap-md pt-md">
                    <Link to={ROUTES.HISTORY} className="flex-1 bg-primary text-on-primary py-4 rounded-xl font-label-md font-bold shadow-md hover:bg-primary-container text-center transition-transform active:scale-95">
                        View My Complaints
                    </Link>
                    <button onClick={() => setSubmittedComplaint(null)} className="flex-1 border border-slate-300 text-on-surface-variant py-4 rounded-xl font-label-md font-bold hover:bg-slate-50 transition-transform active:scale-95">
                        Report Another Issue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-lg animate-in fade-in duration-300">
            <div className="space-y-xs">
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">Report Road Damage</h2>
                <p className="text-on-surface-variant font-body-md">Submit photo evidence of road infrastructure hazards. Our system analyzes and identifies road damage automatically.</p>
                {error && (
                    <div className="text-error font-label-sm p-3 bg-error-container/20 rounded-xl border border-error/20 flex gap-sm items-center mt-md">
                        <span className="material-symbols-outlined">error</span>
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <form className="space-y-lg" onSubmit={handleSubmit}>
                {/* Visual Evidence Section */}
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                    <label className="block font-label-md text-on-surface font-bold">Visual Evidence</label>
                    <div 
                        className={`border-2 border-dashed rounded-xl p-lg flex flex-col items-center justify-center space-y-md transition-all cursor-pointer ${
                            isDragOver ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary hover:bg-slate-50/50'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            handleFiles(e.dataTransfer.files);
                        }}
                    >
                        <input 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            type="file" 
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                        <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                        <div className="text-center">
                            <p className="font-label-md text-primary font-bold">Click to upload or drag &amp; drop</p>
                            <p className="text-label-sm text-outline mt-xs uppercase">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                    
                    {preview && (
                        <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-100 max-h-48 flex justify-center">
                            <img src={preview} className="w-full h-full object-cover" alt="visual preview" />
                            <button 
                                type="button" 
                                className="absolute top-2 right-2 bg-white/95 rounded-full p-1.5 shadow-md flex items-center justify-center hover:bg-slate-100 transition-colors"
                                onClick={removePreview}
                            >
                                <span className="material-symbols-outlined text-error text-[18px]">close</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Location Details Section */}
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                    <label className="block font-label-md text-on-surface font-bold" htmlFor="location">Manual Location Input</label>
                    <div className="relative group focus-within:scale-[1.01] transition-transform">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                        <input 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline-variant text-body-md" 
                            id="location"
                            placeholder="Enter street address manually (e.g. 500 Market St, Zone 2)" 
                            type="text" 
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>

                {/* Phone details and Description */}
                <div className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                    <div className="space-y-xs">
                        <label className="block font-label-md text-on-surface font-bold" htmlFor="phone">Phone Number (For SMS Updates)</label>
                        <div className="relative group focus-within:scale-[1.01] transition-transform">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">phone</span>
                            <input 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline-variant text-body-md" 
                                id="phone"
                                placeholder="+19516292515" 
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-xs pt-sm">
                        <label className="block font-label-md text-on-surface font-bold" htmlFor="desc">Description</label>
                        <textarea 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-body-sm outline-none resize-none" 
                            id="desc"
                            placeholder="Enter any additional hazard details (e.g., depth, width, impact on vehicle flow)..." 
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* CTA / Submit */}
                <div className="pt-md">
                    <button 
                        className="w-full bg-primary text-on-primary font-headline-md py-4 rounded-xl shadow-lg shadow-primary/15 transition-all transform active:scale-[0.98] flex items-center justify-center gap-sm disabled:opacity-75"
                        type="submit" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Analyzing Road Damage...
                            </>
                        ) : (
                            <>
                                Submit Report
                                <span className="material-symbols-outlined">send</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-outline font-label-sm mt-md uppercase tracking-wider">
                        BY SUBMITTING, YOU AGREE TO OFFICIAL INFRASTRUCTURE DATA TERMS
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ReportDamage;
