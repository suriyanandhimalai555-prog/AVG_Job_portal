import React, { useState, useEffect } from 'react';
import {
    FaSearch, FaBriefcase, FaMapMarkerAlt, FaStar, FaTh, FaList, FaTimes, FaUsers, FaClock, FaClipboardList, FaFileAlt, FaCheck
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Shimmer from '../../ui/Shimmer';

const UserJobsCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Jobs');
    const [viewMode, setViewMode] = useState('grid');
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    const [filterOptions, setFilterOptions] = useState(['All Jobs']);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedJob, setSelectedJob] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({ resumeLink: '', coverLetter: '' });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchJobsAndApplications = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            const jobRes = await fetch(`${apiUrl}/api/jobs`);
            if (jobRes.ok) {
                const data = await jobRes.json();
                const activeJobs = data.filter(job => job.status === 'Active');
                setJobs(activeJobs);
                const uniqueTypes = [...new Set(activeJobs.map(job => job.type))];
                setFilterOptions(['All Jobs', ...uniqueTypes]);
            }

            if (token) {
                const appRes = await fetch(`${apiUrl}/api/applications/my-applications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (appRes.ok) {
                    const appsData = await appRes.json();
                    setMyApplications(appsData);
                    setAppliedJobIds(new Set(appsData.map(app => app.job_id)));
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobsAndApplications();
    }, [apiUrl]);

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = activeFilter === 'All Jobs' || job.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleViewDetails = (job) => {
        setSelectedJob(job);
        setIsDetailsModalOpen(true);
    };

    const handleProceedToApply = () => {
        setIsDetailsModalOpen(false);
        setIsApplyModalOpen(true);
    };

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const getDaysAgo = (dateString) => {
        if (!dateString) return 'Just now';
        const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Reviewed': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Interview Scheduled': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
            case 'Hired': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!formData.resumeLink) {
            toast.error("Please provide a link to your resume.");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Submitting application...');
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error("You must be logged in to apply.", { id: loadingToast });
            setIsSubmitting(false);
            return;
        }

        try {
            const userStr = localStorage.getItem('user');
            let applicantName = 'Applicant';
            let applicantEmail = 'applicant@email.com';

            if (userStr) {
                const user = JSON.parse(userStr);
                applicantName = user.fullName || user.name || applicantName;
                applicantEmail = user.email || applicantEmail;
            } else if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                applicantName = payload.fullName || payload.name || applicantName;
                applicantEmail = payload.email || applicantEmail;
            }

            const payload = {
                jobId: selectedJob.id,
                jobTitle: selectedJob.title,
                companyName: selectedJob.company,
                companyEmail: selectedJob.contact_email || 'hr@company.com',
                applicantName,
                applicantEmail,
                resumeLink: formData.resumeLink,
                coverLetter: formData.coverLetter
            };

            const res = await fetch(`${apiUrl}/api/applications/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to apply');

            toast.success('Successfully applied!', { id: loadingToast });
            setIsApplyModalOpen(false);
            setFormData({ resumeLink: '', coverLetter: '' });
            fetchJobsAndApplications();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit application.', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-2.5 p-2 md:p-3 rounded-2xl bg-[#F5F6FC]">
            <Toaster position="top-right" />

            <div className="relative overflow-hidden rounded-2xl px-4 py-4 md:px-6 md:py-4 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0]">
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="pointer-events-none absolute -right-14 -top-14 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

                <div className="relative flex flex-col md:flex-row md:items-center gap-2.5">
                    <div className="flex items-center gap-2 shrink-0 md:mr-1">
                        <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                            <FaBriefcase className="text-white" size={14} />
                        </div>
                        <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight whitespace-nowrap">Job Openings</h1>
                    </div>

                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={14} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search job title, company, or location..."
                            className="w-full pl-10 pr-3 py-2 bg-white/95 backdrop-blur border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 text-sm font-medium shadow-[0_8px_24px_rgba(20,27,60,0.2)]"
                        />
                    </div>
                    <Button
                        onClick={() => setIsStatusModalOpen(true)}
                        className="py-2 px-4 border-0 font-bold rounded-lg flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(20,27,60,0.2)] hover:bg-gray-50 hover:text-[#2A45C2] transition-all whitespace-nowrap text-sm"
                    >
                        <FaClipboardList size={14} /> Application Status
                        {myApplications.length > 0 && (
                            <span className="bg-[#EEF1FE] text-[#2A45C2] text-[10px] px-2 py-0.5 rounded-full ml-0.5">
                                {myApplications.length}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex gap-1.5 pb-1 overflow-x-auto custom-scrollbar">
                {!isLoading ? (
                    filterOptions.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm ${activeFilter === filter
                                ? 'bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0'
                                : 'bg-white border border-[#E7E9F7] text-gray-600 hover:border-[#2A45C2]/30 hover:bg-[#F8F9FE]'
                                }`}
                        >
                            {filter}
                        </button>
                    ))
                ) : (
                    Array(4).fill(0).map((_, idx) => (
                        <Shimmer key={idx} className="w-24 h-8 rounded-lg shrink-0" />
                    ))
                )}
            </div>

            <div>
                <div className="flex justify-between items-center mb-2.5 px-0.5">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Featured Jobs</h2>
                        <Badge variant="primary" className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-[#2A45C2] border border-[#E4E7F2] font-bold">
                            {isLoading ? '...' : filteredJobs.length} open
                        </Badge>
                    </div>

                    <div className="flex items-center gap-0.5 bg-white border border-[#E7E9F7] p-0.5 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#EEF1FE] text-[#2A45C2]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FaTh size={13} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#EEF1FE] text-[#2A45C2]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FaList size={13} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-2.5" : "flex flex-col gap-2.5"}>
                        {Array(4).fill(0).map((_, idx) => (
                            <div key={idx} className="bg-white border border-[#E7E9F7] rounded-2xl p-4 h-40 shadow-[0_2px_16px_rgba(30,41,89,0.02)]">
                                <Shimmer className="w-full h-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-3 gap-2.5" : "flex flex-col gap-2.5"}>
                        {filteredJobs.map((job) => {
                            const isApplied = appliedJobIds.has(job.id);
                            return (
                                <div key={job.id} className={`bg-white border border-[#E7E9F7] rounded-2xl p-4 shadow-[0_2px_16px_rgba(30,41,89,0.04)] hover:shadow-[0_10px_28px_rgba(42,69,194,0.12)] hover:border-[#2A45C2]/30 hover:-translate-y-0.5 transition-all duration-200 group ${viewMode === 'grid' ? 'flex flex-col justify-between h-full' : 'flex flex-col md:flex-row md:items-center justify-between gap-3'}`}>
                                    <div className={`flex ${viewMode === 'grid' ? 'justify-between items-start mb-3.5' : 'items-center gap-4 flex-1'}`}>
                                        <div className="flex gap-3 w-full">
                                            <div className="w-11 h-11 bg-gradient-to-br from-[#EEF1FE] to-white text-[#2A45C2] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#E7E9F7] shadow-sm group-hover:scale-105 transition-transform">
                                                <FaBriefcase size={17} />
                                            </div>
                                            <div className="w-full">
                                                <div className="flex justify-between items-start w-full">
                                                    <h3 className="text-[15px] font-extrabold text-gray-900 leading-tight mb-0.5 me-3 truncate group-hover:text-[#2A45C2] transition-colors">{job.title}</h3>
                                                    {viewMode === 'list' && (
                                                        <Badge variant="default" className="bg-[#F8F9FE] text-gray-600 border border-[#E7E9F7] px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-widest hidden md:block">
                                                            {job.type}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[13px] font-bold text-[#2A45C2] mb-1.5">{job.company}</p>

                                                <div className="flex flex-wrap items-center text-[11px] font-bold text-gray-500 gap-2.5">
                                                    <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-gray-400" /> {job.location || 'Remote'}</span>
                                                    <span className="flex items-center gap-1.5"><FaBriefcase className="text-gray-400" size={10} /> {job.experience || 'Entry Level'}</span>
                                                    <span className="flex items-center gap-1.5"><FaClock className="text-gray-400" /> {getDaysAgo(job.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {viewMode === 'grid' && (
                                            <Badge variant="default" className="bg-[#F8F9FE] text-gray-600 border border-[#E7E9F7] px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-widest shrink-0">
                                                {job.type}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className={`${viewMode === 'grid' ? 'mt-3 pt-3 border-t border-[#E7E9F7] flex items-center justify-between flex-wrap gap-3' : 'flex items-center flex-wrap gap-3 md:gap-5 justify-between md:justify-end border-t md:border-t-0 border-[#E7E9F7] pt-3 md:pt-0 mt-2.5 md:mt-0'}`}>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                                            <div>
                                                <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Openings</span>
                                                <span className="font-bold text-gray-800">{job.openings || 1}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Applicants</span>
                                                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                                                    <FaUsers className="text-[#2A45C2]" size={12} /> {job.applicants > 100 ? '100+' : (job.applicants || 0)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex items-center gap-1.5 font-black text-sm text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-[#E7E9F7]">
                                                <FaStar className="text-yellow-400" size={13} />
                                                <span>{job.salary || 'Negotiable'}</span>
                                            </div>

                                            {isApplied ? (
                                                <Button disabled variant='secondary' className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm px-5 py-2 rounded-xl cursor-not-allowed">
                                                    Applied <FaCheck className="inline ml-1" size={10} />
                                                </Button>
                                            ) : (
                                                <Button onClick={() => handleViewDetails(job)} className="rounded-xl px-6 py-2 bg-[#141B3C] text-white border-0 font-bold text-sm shadow-md hover:bg-[#2A45C2] transition-colors">
                                                    Apply
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white border border-[#E7E9F7] rounded-2xl shadow-sm">
                        <p className="text-gray-500 font-medium text-sm mb-3">No positions found matching your criteria.</p>
                        <Button variant="outline" className="rounded-xl border-[#E7E9F7] text-gray-700 font-bold px-5 py-2 shadow-sm hover:bg-gray-50" onClick={() => { setSearchTerm(''); setActiveFilter('All Jobs'); }}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {isDetailsModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141B3C]/40 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-white/20 flex flex-col max-h-[88vh]">
                        <div className="flex justify-between items-start p-4 md:p-5 border-b border-[#E7E9F7] bg-gradient-to-br from-[#F5F6FC] to-white shrink-0">
                            <div className="flex gap-3.5 items-center">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#2A45C2] to-[#5B4FE0] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <FaBriefcase size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">{selectedJob.title}</h3>
                                    <p className="text-sm font-bold text-[#2A45C2] mt-0.5">{selectedJob.company}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-xl hover:bg-gray-100 bg-white border border-[#E7E9F7] shadow-sm">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="p-4 md:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-white">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 p-4 bg-[#F8F9FE] rounded-2xl border border-[#E7E9F7] shadow-inner">
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider"><FaMapMarkerAlt className="text-[#2A45C2]" /> Location</span>
                                    <span className="text-sm font-extrabold text-gray-900">{selectedJob.location}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider"><FaBriefcase className="text-[#2A45C2]" /> Experience</span>
                                    <span className="text-sm font-extrabold text-gray-900">{selectedJob.experience}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider"><FaStar className="text-yellow-500" /> Salary</span>
                                    <span className="text-sm font-extrabold text-[#2A45C2]">{selectedJob.salary}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider"><FaClock className="text-[#2A45C2]" /> Job Type</span>
                                    <span className="text-sm font-extrabold text-gray-900">{selectedJob.type}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-md font-black text-gray-900 mb-3 flex items-center gap-2 border-b border-[#E7E9F7] pb-2.5"><FaFileAlt className="text-[#2A45C2]" /> About the Role</h4>
                                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedJob.description || 'No detailed description provided.'}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-[#E7E9F7] bg-gray-50 flex items-center justify-end gap-3 shrink-0">
                            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} className="rounded-xl border-[#E7E9F7] text-gray-700 bg-white shadow-sm hover:bg-gray-50 font-bold px-6 py-2.5">Close</Button>
                            {appliedJobIds.has(selectedJob.id) ? (
                                <Button disabled className="rounded-xl px-6 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm cursor-not-allowed">Already Applied ✓</Button>
                            ) : (
                                <Button onClick={handleProceedToApply} className="rounded-xl px-8 py-2.5 bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">Proceed to Apply</Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isApplyModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141B3C]/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
                        <div className="flex justify-between items-center p-5 border-b border-[#E7E9F7] bg-[#F8F9FE]">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Submit Application</h3>
                                <p className="text-xs font-bold text-[#2A45C2] mt-1">{selectedJob.title} @ {selectedJob.company}</p>
                            </div>
                            <button onClick={() => setIsApplyModalOpen(false)} className="text-gray-400 hover:text-gray-800 p-2 rounded-xl bg-white shadow-sm border border-[#E7E9F7]"><FaTimes size={16} /></button>
                        </div>
                        <form onSubmit={submitApplication} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-1.5">Resume URL Link *</label>
                                <input type="url" name="resumeLink" required value={formData.resumeLink} onChange={handleFormChange} placeholder="https://drive.google.com/..." className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-[#E7E9F7] rounded-xl focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] transition-all text-sm font-medium shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-1.5">Cover Letter (Optional)</label>
                                <textarea name="coverLetter" rows="4" value={formData.coverLetter} onChange={handleFormChange} placeholder="Why are you a great fit?" className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-[#E7E9F7] rounded-xl focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] transition-all resize-none text-sm font-medium shadow-sm"></textarea>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => { setIsApplyModalOpen(false); setIsDetailsModalOpen(true); }} className="flex-1 rounded-xl border-[#E7E9F7] text-gray-700 font-bold py-2.5 shadow-sm bg-white" disabled={isSubmitting}>Back</Button>
                                <Button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0 font-bold py-2.5 shadow-lg" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Submit Application'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141B3C]/40 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20 max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center p-5 md:p-6 border-b border-[#E7E9F7] bg-[#F8F9FE]">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#2A45C2] shadow-sm border border-[#E7E9F7]"><FaClipboardList /></div>
                                    My Applications
                                </h3>
                            </div>
                            <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-800 p-2 rounded-xl bg-white shadow-sm border border-[#E7E9F7]"><FaTimes size={16} /></button>
                        </div>

                        <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
                            {myApplications.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-2xl border border-[#E7E9F7] shadow-sm">
                                    <p className="text-gray-500 font-medium text-sm">You haven't applied to any jobs yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {myApplications.map(app => (
                                        <div key={app.application_id} className="bg-white p-4 rounded-2xl border border-[#E7E9F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_2px_16px_rgba(30,41,89,0.04)] hover:shadow-md transition-shadow">
                                            <div>
                                                <h4 className="font-extrabold text-gray-900 text-[15px] leading-tight mb-0.5">{app.title}</h4>
                                                <p className="text-sm font-bold text-[#2A45C2]">{app.company} <span className="text-gray-400 font-medium">• {app.location}</span></p>
                                                <p className="text-[11px] font-bold text-gray-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                                                    <FaClock size={10} /> Applied {getDaysAgo(app.applied_date)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                                <Badge variant="default" className={`border text-xs px-3.5 py-1.5 font-bold rounded-full shadow-sm ${getStatusColor(app.application_status)}`}>
                                                    {app.application_status}
                                                </Badge>
                                                <Badge variant="default" className="bg-[#F8F9FE] text-gray-500 border border-[#E7E9F7] text-[10px] uppercase tracking-widest font-bold">
                                                    {app.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserJobsCom;