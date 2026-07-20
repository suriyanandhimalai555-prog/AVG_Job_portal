import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaUsers, FaClock, FaMapMarkerAlt, FaFileAlt, FaBriefcase, FaBuilding, FaEnvelope } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';

const AdminJobsCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
    const [jobApplicants, setJobApplicants] = useState([]);
    const [isFetchingApplicants, setIsFetchingApplicants] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || '';

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/jobs`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (error) {
            toast.error('Failed to fetch jobs.');
        } finally {
            setIsLoading(false);
        }
    };

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full Time',
        status: 'Active',
        experience: '2 - 7 years',
        salary: 'Not Disclosed',
        openings: 1,
        description: ''
    });

    const handleOpenAdd = () => {
        setFormData({
            title: '', company: '', location: '', type: 'Full Time', status: 'Active',
            experience: '2 - 7 years', salary: 'Not Disclosed', openings: 1, description: ''
        });
        setEditingId(null);
        setIsPanelOpen(true);
    };

    const handleOpenEdit = (job) => {
        setFormData({
            title: job.title, company: job.company, location: job.location || '',
            type: job.type, status: job.status, experience: job.experience || 'Not specified',
            salary: job.salary || 'Not Disclosed', openings: job.openings || 1, description: job.description || ''
        });
        setEditingId(job.id);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingId ? 'Updating job...' : 'Publishing new job...');

        try {
            const endpoint = editingId ? `${apiUrl}/api/jobs/${editingId}` : `${apiUrl}/api/jobs`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const returnedJob = await res.json();
                if (editingId) {
                    setJobs(jobs.map(j => j.id === editingId ? returnedJob : j));
                    toast.success('Job listing updated successfully!', { id: loadingToast });
                } else {
                    setJobs([returnedJob, ...jobs]);
                    toast.success('Job listing published successfully!', { id: loadingToast });
                }
            } else {
                throw new Error('Failed to process job');
            }
            setIsPanelOpen(false);
        } catch (error) {
            toast.error(editingId ? 'Failed to update job.' : 'Failed to publish job.', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this job listing?')) {
            const loadingToast = toast.loading('Deleting listing...');
            try {
                const res = await fetch(`${apiUrl}/api/jobs/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
                });
                if (res.ok) {
                    setJobs(jobs.filter(j => j.id !== id));
                    toast.success('Job listing deleted successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to delete');
                }
            } catch (error) {
                toast.error('Failed to delete job listing.', { id: loadingToast });
            }
        }
    };

    const handleViewApplicants = async (job) => {
        setSelectedJobForApplicants(job);
        setIsApplicantsModalOpen(true);
        setIsFetchingApplicants(true);
        setJobApplicants([]);

        try {
            const res = await fetch(`${apiUrl}/api/applications/job/${job.id}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                const applicantsList = Array.isArray(data) ? data : (data.data || data.applications || []);
                setJobApplicants(applicantsList);
            } else {
                toast.error('Failed to fetch applicants. Ensure endpoint exists.');
            }
        } catch (error) {
            toast.error('Network error while fetching applicants');
        } finally {
            setIsFetchingApplicants(false);
        }
    };

    const handleApplicantStatusChange = async (applicationId, newStatus) => {
        try {
            const res = await fetch(`${apiUrl}/api/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedApp = await res.json();
                setJobApplicants(prev => prev.map(app =>
                    app.id === applicationId ? { ...app, status: updatedApp.status || newStatus } : app
                ));
                toast.success('Applicant status updated!');
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const getDaysAgo = (dateString) => {
        if (!dateString) return 'Just now';
        const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    };

    const filteredJobs = jobs.filter((job) =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 rounded-[32px] bg-[#F5F6FC] min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#0B0F19] tracking-tight">Career Portal</h2>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Manage active listings and review applicants</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:max-w-md">
                    <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#4353FF]" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by job title, company, or location..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-0 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#4353FF]/20 text-sm font-medium text-gray-700 transition-shadow"
                    />
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2.5 rounded-2xl bg-[#0B0F19] text-white px-6 py-3.5 border-0 hover:bg-gray-800 hover:-translate-y-0.5 transition-all w-full sm:w-auto text-sm font-bold shadow-lg"
                >
                    <FaPlus size={14} /> Add New Listing
                </Button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                        <thead className="bg-[#F8F9FA] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-3xl">Job Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidates</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right rounded-tr-3xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 font-bold animate-pulse">
                                        Loading listings...
                                    </td>
                                </tr>
                            ) : filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-[#F8F9FE] transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#0B0F19] text-base group-hover:text-[#4353FF] transition-colors line-clamp-1">{job.title}</p>
                                            <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1.5"><FaBuilding size={10} className="text-gray-400" /> {job.company}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    <FaMapMarkerAlt size={9} /> {job.location || 'Remote'}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    <FaClock size={9} /> {getDaysAgo(job.created_at)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[11px] font-black text-[#0B0F19]">{job.experience}</p>
                                            <p className="text-[11px] font-medium text-gray-500 mt-1">{job.salary}</p>
                                            <Badge variant="outline" className="mt-2 bg-white border border-gray-200 text-gray-600 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md uppercase">
                                                {job.type}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    Openings: <span className="font-black text-[#0B0F19]">{job.openings}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleViewApplicants(job)}
                                                    className="flex items-center gap-1.5 bg-[#F8F9FE] text-[#4353FF] hover:bg-[#4353FF] hover:text-white transition-colors px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest border border-blue-50 hover:border-[#4353FF] shadow-sm cursor-pointer z-10 relative"
                                                    title="View Candidates"
                                                >
                                                    <FaUsers size={12} />
                                                    {job.applicants > 100 ? '100+' : job.applicants || 0} Candidates
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${job.status === 'Active' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                                                    job.status === 'Draft' ? 'border-yellow-100 bg-yellow-50 text-yellow-600' :
                                                        'border-gray-200 bg-gray-50 text-gray-500'
                                                }`}>
                                                {job.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenEdit(job)} className="w-9 h-9 bg-white border border-gray-100 text-[#0B0F19] rounded-xl flex items-center justify-center hover:bg-[#4353FF] hover:text-white hover:border-[#4353FF] transition-all shadow-sm" title="Edit">
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(job.id)} className="w-9 h-9 bg-white border border-gray-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm" title="Delete">
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-[#F8F9FE] rounded-2xl flex items-center justify-center text-[#4353FF] mb-4">
                                                <FaBriefcase size={24} />
                                            </div>
                                            <p className="text-base font-black text-[#0B0F19]">No job listings found</p>
                                            <p className="text-sm font-medium text-gray-500 mt-1">Adjust your search or add a new job listing.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isApplicantsModalOpen && selectedJobForApplicants && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-[#0B101E]/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="flex justify-between items-center px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100 bg-white shrink-0">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-[#0B0F19] flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#F8F9FE] text-[#4353FF] rounded-xl flex items-center justify-center">
                                        <FaUsers size={18} />
                                    </div>
                                    Candidate Pipeline
                                </h3>
                                <p className="text-xs sm:text-sm font-bold text-gray-500 mt-1.5 flex items-center gap-1.5">
                                    <FaBriefcase className="text-gray-400" /> {selectedJobForApplicants.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsApplicantsModalOpen(false)}
                                className="w-10 h-10 bg-[#F8F9FA] hover:bg-gray-100 text-[#0B0F19] rounded-full flex items-center justify-center transition-all shadow-sm"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#F5F6FC]">
                            {isFetchingApplicants ? (
                                <div className="text-center py-16 text-gray-500 font-bold animate-pulse">Loading candidates...</div>
                            ) : Array.isArray(jobApplicants) && jobApplicants.length === 0 ? (
                                <div className="text-center py-16 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 mb-4 shadow-sm border border-gray-100">
                                        <FaUsers size={24} />
                                    </div>
                                    <p className="text-base font-black text-[#0B0F19]">No Candidates Yet</p>
                                    <p className="text-sm font-medium text-gray-500 mt-1">Applications for this role will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Array.isArray(jobApplicants) && jobApplicants.map((app) => (
                                        <div key={app.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-5 justify-between items-start md:items-center hover:shadow-[0_4px_20px_rgba(67,83,255,0.08)] transition-all">

                                            <div className="flex-1">
                                                <h4 className="font-black text-[#0B0F19] text-base mb-1">{app.applicant_name || app.name || 'Candidate'}</h4>
                                                <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5"><FaEnvelope className="text-gray-400" /> {app.applicant_email || app.email || 'No email provided'}</p>

                                                <div className="flex items-center gap-4">
                                                    {app.resume_link ? (
                                                        <a href={app.resume_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-[#4353FF] flex items-center gap-1.5 bg-[#F8F9FE] hover:bg-[#4353FF] hover:text-white px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest border border-blue-50">
                                                            <FaFileAlt size={12} /> View Resume
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 uppercase tracking-widest">No Resume</span>
                                                    )}

                                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                                                        <FaClock size={10} /> Applied {getDaysAgo(app.created_at)}
                                                    </span>
                                                </div>

                                                {app.cover_letter && (
                                                    <div className="mt-4 p-3 bg-[#F8F9FA] rounded-xl border border-gray-100 relative">
                                                        <span className="absolute -top-2 left-3 bg-[#F8F9FA] px-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">Cover Letter</span>
                                                        <p className="text-xs text-gray-600 italic font-medium leading-relaxed">"{app.cover_letter}"</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-full md:w-auto shrink-0 border-t border-gray-100 md:border-0 pt-4 md:pt-0">
                                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                                    Candidate Status
                                                </label>
                                                <select
                                                    value={app.status || 'Pending'}
                                                    onChange={(e) => handleApplicantStatusChange(app.id, e.target.value)}
                                                    className={`px-4 py-2 border-2 border-transparent rounded-xl text-xs font-black focus:outline-none transition-all w-full md:w-44 shadow-sm cursor-pointer appearance-none
                                                        ${app.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 hover:border-yellow-200' :
                                                            app.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 hover:border-blue-200' :
                                                                app.status === 'Interview Scheduled' ? 'bg-purple-50 text-purple-700 hover:border-purple-200' :
                                                                    app.status === 'Rejected' ? 'bg-red-50 text-red-700 hover:border-red-200' :
                                                                        app.status === 'Hired' ? 'bg-emerald-50 text-emerald-700 hover:border-emerald-200' :
                                                                            'bg-yellow-50 text-yellow-700 hover:border-yellow-200'
                                                        }
                                                    `}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Reviewed">Reviewed</option>
                                                    <option value="Interview Scheduled">Interview Scheduled</option>
                                                    <option value="Rejected">Rejected</option>
                                                    <option value="Hired">Hired</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-[#0B101E]/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={handleClosePanel}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col rounded-l-[32px] overflow-hidden ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white shrink-0 z-10">
                    <div>
                        <h3 className="text-2xl font-black text-[#0B0F19] tracking-tight">
                            {editingId ? 'Edit Job Listing' : 'Publish New Role'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-widest">Update Portal Database</p>
                    </div>
                    <button onClick={handleClosePanel} className="w-10 h-10 bg-[#F8F9FA] hover:bg-gray-100 text-[#0B0F19] rounded-full flex items-center justify-center transition-all shadow-sm">
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white relative">
                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-5">

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Title *</label>
                            <input name="title" type="text" placeholder="e.g. Senior Frontend Developer" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" required />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Name *</label>
                                <input name="company" type="text" placeholder="e.g. ABC Corp" value={formData.company} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" required />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                                <input name="location" type="text" placeholder="e.g. Remote, NY" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience Required</label>
                                <input name="experience" type="text" placeholder="e.g. 2 - 5 Years" value={formData.experience} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Salary Bracket</label>
                                <input name="salary" type="text" placeholder="e.g. $80k - $120k" value={formData.salary} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Openings</label>
                                <input name="openings" type="number" min="1" value={formData.openings} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] appearance-none" required>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Description</label>
                            <textarea name="description" rows="5" placeholder="Describe the role, responsibilities, and requirements..." value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] resize-y"></textarea>
                        </div>

                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Listing Status *</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] appearance-none" required>
                                    <option value="Active">Active / Public</option>
                                    <option value="Draft">Draft / Hidden</option>
                                    <option value="Closed">Closed / Filled</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-end gap-4 shrink-0 z-10">
                    <Button variant="outline" onClick={handleClosePanel} type="button" className="rounded-xl px-6 py-3.5 bg-white border-2 border-gray-200 text-[#0B0F19] hover:bg-gray-50 text-sm font-black transition-all">
                        Cancel
                    </Button>
                    <Button type="submit" form="jobForm" className="rounded-xl px-6 py-3.5 bg-[#0B0F19] text-white border-0 hover:bg-gray-800 text-sm font-black shadow-lg transition-all">
                        {editingId ? 'Save Changes' : 'Publish Listing'}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default AdminJobsCom;