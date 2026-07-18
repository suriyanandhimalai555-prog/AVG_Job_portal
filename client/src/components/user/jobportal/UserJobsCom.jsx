import React, { useState, useEffect } from 'react';
import {
    FaSearch, FaBriefcase, FaMapMarkerAlt, FaStar, FaTh, FaList, FaTimes, FaUsers, FaClock, FaClipboardList, FaFileAlt
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

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

    const [formData, setFormData] = useState({
        resumeLink: '',
        coverLetter: ''
    });

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

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getDaysAgo = (dateString) => {
        if (!dateString) return 'Just now';
        const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    };

    // NEW: Function to dynamically colorize statuses updated by Admin
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Reviewed':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Interview Scheduled':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'Hired':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to apply');

            toast.success('Successfully applied!', { id: loadingToast });
            setIsApplyModalOpen(false);
            setFormData({ resumeLink: '', coverLetter: '' });

            fetchJobsAndApplications();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit application. Please try again.', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl shadow-sm bg-[#EEF2FF]">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:flex-1">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search job title, company, or location..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#EBEBEB] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-gray-700 placeholder-gray-400 font-medium"
                    />
                </div>
                <Button
                    onClick={() => setIsStatusModalOpen(true)}
                    className="w-full md:w-auto py-3 px-5 border border-[#2A45C2]/20 hover:bg-blue-50 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                >
                    <FaClipboardList size={16} /> Application Status
                    {myApplications.length > 0 && (
                        <span className="bg-white text-[#2A45C2] text-[10px] px-2 py-0.5 rounded-full ml-1">
                            {myApplications.length}
                        </span>
                    )}
                </Button>
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
                {!isLoading && filterOptions.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-bold transition-all ${activeFilter === filter
                            ? 'bg-blue-50 text-[#2A45C2] border border-[#2A45C2]/20'
                            : 'bg-white border border-[#EBEBEB] text-gray-500'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-lg font-extrabold text-gray-900">Featured Jobs</h2>

                    <div className="flex items-center gap-3">
                        <span className="text-[#2A45C2] font-bold text-xs hidden sm:block bg-blue-50 border border-[#EBEBEB] px-2.5 py-1 rounded-md">
                            {filteredJobs.length} open
                        </span>
                        <div className="flex bg-white border border-[#EBEBEB] p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`}
                            >
                                <FaTh size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`}
                            >
                                <FaList size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl">
                        <p className="text-gray-500 font-medium">Loading jobs...</p>
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3"}>
                        {filteredJobs.map((job) => {
                            const isApplied = appliedJobIds.has(job.id);

                            return (
                                <div key={job.id} className={`bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-sm ${viewMode === 'grid' ? 'flex flex-col justify-between h-full' : 'flex flex-col md:flex-row md:items-center justify-between gap-4'}`}>
                                    <div className={`flex ${viewMode === 'grid' ? 'justify-between items-start mb-4' : 'items-center gap-4 flex-1'}`}>
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 bg-blue-50 text-[#2A45C2] rounded-lg flex items-center justify-center flex-shrink-0 border border-[#EBEBEB]">
                                                <FaBriefcase size={18} />
                                            </div>
                                            <div className="w-full">
                                                <div className="flex justify-between items-start w-full">
                                                    <h3 className="text-md font-bold text-gray-900 leading-tight mb-0.5 me-4">{job.title}</h3>
                                                    {viewMode === 'list' && (
                                                        <Badge variant="default" className="bg-white text-gray-500 border border-[#EBEBEB] px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider hidden md:block">
                                                            {job.type}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs font-medium text-gray-500 mb-2">{job.company}</p>

                                                <div className="flex flex-wrap items-center text-[11px] font-bold text-gray-400 gap-2.5">
                                                    <span className="flex items-center gap-1">
                                                        <FaMapMarkerAlt className="text-[#2A45C2]" />
                                                        {job.location || 'Location upon request'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaBriefcase className="text-[#2A45C2]" size={10} />
                                                        {job.experience || 'Not specified'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaClock className="text-[#2A45C2]" />
                                                        {getDaysAgo(job.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {viewMode === 'grid' && (
                                            <Badge variant="default" className="bg-white text-gray-500 border border-[#EBEBEB] px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider">
                                                {job.type}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className={`${viewMode === 'grid' ? 'mt-3 pt-4 border-t border-[#EBEBEB] flex items-center justify-between flex-wrap gap-3' : 'flex items-center flex-wrap gap-3 md:gap-6 justify-between md:justify-end border-t md:border-t-0 border-[#EBEBEB] pt-4 md:pt-0 mt-3 md:mt-0'}`}>

                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                                            <div>
                                                <span className="block text-gray-400 text-[10px] uppercase">Openings</span>
                                                {job.openings || 1}
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-[10px] uppercase">Applicants</span>
                                                <div className="flex items-center gap-1">
                                                    <FaUsers className="text-[#2A45C2]" size={12} /> {job.applicants > 100 ? '100+' : (job.applicants || 0)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex items-center gap-1 font-bold text-sm">
                                                <FaStar className="text-yellow-400" size={14} />
                                                <span className="text-[#2A45C2]">{job.salary || 'Negotiable'}</span>
                                            </div>

                                            {isApplied ? (
                                                <Button
                                                    disabled
                                                    className="bg-green-600 hover:bg-green-600 font-bold text-sm cursor-not-allowed"
                                                >
                                                    Applied ✓
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleViewDetails(job)}
                                                    className="rounded-lg px-5 py-2 bg-[#2A45C2] text-white border-0 font-bold text-sm"
                                                >
                                                    View & Apply
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl">
                        <p className="text-gray-500 font-medium">No jobs found matching your criteria.</p>
                        <Button
                            variant="outline"
                            className="mt-3 rounded-lg border-[#EBEBEB] text-gray-700 text-sm"
                            onClick={() => {
                                setSearchTerm('');
                                setActiveFilter('All Jobs');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Job Details Modal */}
            {isDetailsModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-[#EBEBEB] flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-start p-6 border-b border-[#EBEBEB] bg-blue-50/30 shrink-0">
                            <div className="flex gap-4 items-center">
                                <div className="w-14 h-14 bg-blue-50 text-[#2A45C2] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#EBEBEB]">
                                    <FaBriefcase size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900">{selectedJob.title}</h3>
                                    <p className="text-sm font-bold text-[#2A45C2] mt-1">{selectedJob.company}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-md hover:bg-gray-100 border border-[#EBEBEB]">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-white">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-xl border border-[#EBEBEB]">
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wide"><FaMapMarkerAlt className="text-[#2A45C2]" /> Location</span>
                                    <span className="text-sm font-semibold text-gray-900">{selectedJob.location}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wide"><FaBriefcase className="text-[#2A45C2]" /> Experience</span>
                                    <span className="text-sm font-semibold text-gray-900">{selectedJob.experience}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wide"><FaStar className="text-yellow-500" /> Salary</span>
                                    <span className="text-sm font-semibold text-gray-900">{selectedJob.salary}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wide"><FaClock className="text-[#2A45C2]" /> Job Type</span>
                                    <span className="text-sm font-semibold text-gray-900">{selectedJob.type}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2 border-b border-[#EBEBEB] pb-2"><FaFileAlt className="text-[#2A45C2]" /> About the Role</h4>
                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedJob.description ? selectedJob.description : 'No detailed job description has been provided by the company.'}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-[#EBEBEB] bg-gray-50 flex items-center justify-end gap-3 shrink-0">
                            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} className="rounded-lg border-[#EBEBEB] text-gray-700 hover:bg-gray-200 text-sm font-bold px-6 py-2.5">Close</Button>
                            {appliedJobIds.has(selectedJob.id) ? (
                                <Button disabled className="rounded-lg px-6 py-2.5 bg-green-50 text-green-700 border border-green-200 font-bold text-sm cursor-not-allowed">Already Applied ✓</Button>
                            ) : (
                                <Button onClick={handleProceedToApply} className="rounded-lg px-8 py-2.5 bg-[#2A45C2] text-white border-0 font-bold text-sm shadow-sm hover:opacity-90 transition-opacity">Apply Now</Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Application Submit Modal */}
            {isApplyModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-[#EBEBEB]">
                        <div className="flex justify-between items-center p-5 border-b border-[#EBEBEB] bg-blue-50/50">
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900">Apply for Role</h3>
                                <p className="text-xs font-medium text-[#2A45C2] mt-0.5">{selectedJob.title} @ {selectedJob.company}</p>
                            </div>
                            <button onClick={() => setIsApplyModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100 border border-[#EBEBEB]"><FaTimes size={16} /></button>
                        </div>
                        <form onSubmit={submitApplication} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Resume URL Link *</label>
                                <input type="url" name="resumeLink" required value={formData.resumeLink} onChange={handleFormChange} placeholder="https://drive.google.com/... or portfolio link" className="w-full px-3 py-2.5 bg-white border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Cover Letter (Optional)</label>
                                <textarea name="coverLetter" rows="4" value={formData.coverLetter} onChange={handleFormChange} placeholder="Tell the company why you are a great fit..." className="w-full px-3 py-2.5 bg-white border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] transition-all resize-none text-sm"></textarea>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => { setIsApplyModalOpen(false); setIsDetailsModalOpen(true); }} className="flex-1 rounded-lg border-[#EBEBEB] text-gray-700 text-sm font-bold" disabled={isSubmitting}>Back</Button>
                                <Button type="submit" className="flex-1 rounded-lg bg-[#2A45C2] text-white border-0 font-bold text-sm" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Submit Application'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Application Status Drawer/Modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-[#EBEBEB] max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b border-[#EBEBEB] bg-blue-50/50">
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                                    <FaClipboardList className="text-[#2A45C2]" /> My Applications
                                </h3>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">Track the status of roles you've applied for.</p>
                            </div>
                            <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100 border border-[#EBEBEB]">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
                            {myApplications.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 font-medium text-sm">You haven't applied to any jobs yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myApplications.map(app => (
                                        <div key={app.application_id} className="bg-white p-4 rounded-xl border border-[#EBEBEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm mb-0.5">{app.title}</h4>
                                                <p className="text-xs font-medium text-gray-600">{app.company} • {app.location}</p>
                                                <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                                    <FaClock size={10} /> Applied {getDaysAgo(app.applied_date)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-2">
                                                {/* NEW: Applying dynamic status color logic */}
                                                <Badge variant="default" className={`border text-xs px-3 py-1 font-bold ${getStatusColor(app.application_status)}`}>
                                                    {app.application_status}
                                                </Badge>
                                                <Badge variant="default" className="bg-gray-50 text-gray-500 border border-[#EBEBEB] text-[10px]">
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