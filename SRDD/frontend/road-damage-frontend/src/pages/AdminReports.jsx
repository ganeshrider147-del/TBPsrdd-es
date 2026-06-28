import React, { useEffect, useState } from 'react';
import { complaintService } from '../services/complaintService';

const AdminReports = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [reportType, setReportType] = useState('complaint_report');

    useEffect(() => {
        fetchComplaints();
    }, []);

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

    // Filter application
    useEffect(() => {
        let result = [...complaints];

        if (statusFilter !== 'All') {
            result = result.filter(c => c.status === statusFilter);
        }

        if (departmentFilter !== 'All') {
            result = result.filter(c => c.assigned_team && c.assigned_team.toLowerCase().includes(departmentFilter.toLowerCase()));
        }

        if (startDate) {
            const start = new Date(startDate);
            result = result.filter(c => new Date(c.created_at) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            // End date includes the entire day
            end.setHours(23, 59, 59, 999);
            result = result.filter(c => new Date(c.created_at) <= end);
        }

        setFilteredComplaints(result);
    }, [startDate, endDate, departmentFilter, statusFilter, complaints]);

    const handleExportExcel = () => {
        if (filteredComplaints.length === 0) {
            setError('No matching complaints found to export.');
            return;
        }

        // Construct CSV content
        const headers = ['Complaint ID', 'Reporter', 'Phone', 'Location', 'Damage Type', 'Accuracy (%)', 'Severity', 'Status', 'Assigned Officer', 'Assigned Team', 'Created At'];
        const rows = filteredComplaints.map(c => [
            `RD-${c.id}`,
            c.user_username || 'Anonymous',
            c.phone_number || 'N/A',
            `"${c.location.replace(/"/g, '""')}"`,
            c.detected_damage || c.damage_type || 'Unknown',
            c.confidence || 0,
            c.severity_level || 'Low',
            c.status,
            c.assigned_officer || 'None',
            c.assigned_team || 'None',
            new Date(c.created_at).toLocaleString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `road_reports_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (filteredComplaints.length === 0) {
            setError('No matching complaints found to generate PDF.');
            return;
        }

        const printWindow = window.open('', '_blank');
        const rowsHTML = filteredComplaints.map(c => `
            <tr>
                <td>RD-${c.id}</td>
                <td>${c.location}</td>
                <td>${c.detected_damage || 'Pothole'}</td>
                <td>${c.confidence}%</td>
                <td>${c.severity_level || 'Low'}</td>
                <td>${c.status}</td>
                <td>${c.assigned_team || 'None'}</td>
                <td>${new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Report - Road Damage Audit</title>
                    <style>
                        body { font-family: system-ui, sans-serif; color: #1e293b; padding: 30px; }
                        h1 { color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 5px; }
                        h2 { font-size: 14px; color: #64748b; margin-top: 0; margin-bottom: 20px; }
                        .meta { margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-size: 12px; }
                        table { w-full; width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; font-size: 11px; text-align: left; }
                        th { background: #f1f5f9; font-weight: bold; color: #334155; }
                        tr:nth-child(even) { background: #f8fafc; }
                    </style>
                </head>
                <body onload="window.print();">
                    <h1>ROAD DETECTOR - ROAD INFRASTRUCTURE AUDIT REPORT</h1>
                    <h2>Municipal Infrastructure Oversight & Resolution Report</h2>
                    <div class="meta">
                        <strong>Report Type:</strong> ${reportType.toUpperCase().replace('_', ' ')}<br/>
                        <strong>Generated At:</strong> ${new Date().toLocaleString()}<br/>
                        <strong>Filtered Parameters:</strong> Zonal Team: ${departmentFilter} | Status: ${statusFilter}<br/>
                        <strong>Match Count:</strong> ${filteredComplaints.length} issue(s) reported
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Location</th>
                                <th>Damage</th>
                                <th>Accuracy</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Assigned Team</th>
                                <th>Reported Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHTML}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-lg animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex justify-between items-center border-b border-slate-100 pb-md">
                <div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">Operations Reports</h2>
                    <p className="text-on-surface-variant font-body-md">Generate, filter, preview, and export CSV/PDF format reports.</p>
                </div>
            </header>

            {error && (
                <div className="text-error font-label-sm p-3 bg-error-container/20 rounded-xl border border-error/20 flex gap-sm items-center">
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg items-start">
                {/* Control Panel */}
                <section className="bg-white p-lg rounded-[20px] shadow-sm border border-slate-200/50 space-y-md">
                    <h3 className="font-headline-md text-base font-bold text-on-surface border-b border-slate-100 pb-sm">Filter Options</h3>
                    
                    <div className="space-y-sm text-xs">
                        <div className="space-y-xs">
                            <label className="block text-outline font-semibold">Report Category</label>
                            <select 
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 text-xs outline-none"
                            >
                                <option value="complaint_report">Complaint Report</option>
                                <option value="monthly_report">Monthly Progress Audit</option>
                                <option value="analytics_report">Operations Analytics Audit</option>
                                <option value="department_report">Department Performance Report</option>
                            </select>
                        </div>

                        <div className="space-y-xs">
                            <label className="block text-outline font-semibold">Start Date</label>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 text-xs outline-none"
                            />
                        </div>

                        <div className="space-y-xs">
                            <label className="block text-outline font-semibold">End Date</label>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 text-xs outline-none"
                            />
                        </div>

                        <div className="space-y-xs">
                            <label className="block text-outline font-semibold">Zonal Department Team</label>
                            <select 
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 text-xs outline-none"
                            >
                                <option value="All">All Departments</option>
                                <option value="Alpha">Crew Alpha</option>
                                <option value="Beta">Crew Beta</option>
                                <option value="Zonal">Zonal Inspectors</option>
                            </select>
                        </div>

                        <div className="space-y-xs">
                            <label className="block text-outline font-semibold">Status Stage</label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-sm py-2 text-xs outline-none"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Closed">Closed</option>
                                <option value="Escalated">Escalated</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-xs pt-sm border-t border-slate-100">
                        <button 
                            onClick={handleExportPDF}
                            className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl text-xs font-bold shadow transition-all flex items-center justify-center gap-xs cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                            Export PDF Report
                        </button>
                        <button 
                            onClick={handleExportExcel}
                            className="w-full border border-slate-200 text-on-surface hover:bg-slate-50 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-xs cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">table_view</span>
                            Export Excel (CSV)
                        </button>
                    </div>
                </section>

                {/* Report Preview Panel */}
                <section className="lg:col-span-3 bg-white rounded-[20px] shadow-sm border border-slate-200/50 p-lg space-y-md">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
                        <div>
                            <h3 className="font-headline-md text-base font-bold text-on-surface">Data Preview</h3>
                            <p className="text-[10px] text-outline">Showing records matching configuration criteria ({filteredComplaints.length} matches)</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-sm">
                            <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                            <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                            <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="text-center text-outline font-body-md py-12 text-xs">
                            No records found matching filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-[9px] text-outline uppercase font-bold tracking-wider border-b border-slate-100">
                                        <th className="px-md py-2">ID</th>
                                        <th className="px-md py-2">Location</th>
                                        <th className="px-md py-2">Damage</th>
                                        <th className="px-md py-2">Severity</th>
                                        <th className="px-md py-2">Status</th>
                                        <th className="px-md py-2">Assigned Team</th>
                                        <th className="px-md py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredComplaints.slice(0, 10).map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/30">
                                            <td className="px-md py-2.5 font-bold">RD-{c.id}</td>
                                            <td className="px-md py-2.5 max-w-[150px] truncate font-medium">{c.location}</td>
                                            <td className="px-md py-2.5 font-semibold text-primary">{c.detected_damage || 'Pothole'}</td>
                                            <td className="px-md py-2.5 font-semibold">{c.severity_level}</td>
                                            <td className="px-md py-2.5 font-semibold">{c.status}</td>
                                            <td className="px-md py-2.5">{c.assigned_team || 'N/A'}</td>
                                            <td className="px-md py-2.5">{new Date(c.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredComplaints.length > 10 && (
                                <p className="text-[10px] text-center text-outline pt-sm">
                                    Preview limited to first 10 rows. Export report to view all {filteredComplaints.length} records.
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminReports;
