import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaUsers, FaClock, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';

const AdminJobsCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // New state for applicants modal
    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
    const [jobApplicants, setJobApplicants] = useState([]);
    const [isFetchingApplicants, setIsFetchingApplicants] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/jobs`);
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
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
        const loadingToast = toast.loading(editingId ? 'Updating job...' : 'Adding new job...');

        try {
            const endpoint = editingId ? `${apiUrl}/api/jobs/${editingId}` : `${apiUrl}/api/jobs`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const returnedJob = await res.json();
                if (editingId) {
                    setJobs(jobs.map(j => j.id === editingId ? returnedJob : j));
                    toast.success('Job updated successfully!', { id: loadingToast });
                } else {
                    setJobs([returnedJob, ...jobs]);
                    toast.success('Job added successfully!', { id: loadingToast });
                }
            } else {
                throw new Error('Failed to process job');
            }
            setIsPanelOpen(false);
        } catch (error) {
            toast.error(editingId ? 'Failed to update job.' : 'Failed to add job.', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            const loadingToast = toast.loading('Deleting job...');
            try {
                const res = await fetch(`${apiUrl}/api/jobs/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setJobs(jobs.filter(j => j.id !== id));
                    toast.success('Job deleted successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to delete');
                }
            } catch (error) {
                toast.error('Failed to delete job.', { id: loadingToast });
            }
        }
    };

    // NEW: Handle opening the applicants viewer
    const handleViewApplicants = async (job) => {
        setSelectedJobForApplicants(job);
        setIsApplicantsModalOpen(true);
        setIsFetchingApplicants(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/applications/job/${job.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setJobApplicants(data);
            } else {
                toast.error('Failed to fetch applicants');
            }
        } catch (error) {
            console.error('Fetch applicants error:', error);
            toast.error('Network error while fetching applicants');
        } finally {
            setIsFetchingApplicants(false);
        }
    };

    // NEW: Handle status changes from the dropdown
    const handleApplicantStatusChange = async (applicationId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedApp = await res.json();
                // Update local state to reflect change instantly
                setJobApplicants(jobApplicants.map(app =>
                    app.id === applicationId ? { ...app, status: updatedApp.status } : app
                ));
                toast.success('Status updated!');
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
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl shadow-sm bg-[#EEF2FF]">

            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:max-w-sm">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={14} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search jobs or locations..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm text-gray-700"
                    />
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#2A45C2] text-white px-5 py-2.5 border-0 hover:opacity-90 w-full sm:w-auto text-sm font-bold shadow-sm"
                >
                    <FaPlus size={12} /> Add New Job
                </Button>
            </div>

            <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden p-2 md:p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#EBEBEB]">
                            <tr>
                                <th className="px-4 py-3">Job Info</th>
                                <th className="px-4 py-3">Details</th>
                                <th className="px-4 py-3">Metrics</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        Loading jobs...
                                    </td>
                                </tr>
                            ) : filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-gray-900 text-sm">{job.title}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">{job.company}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                                    <FaMapMarkerAlt className="text-gray-400" size={10} />
                                                    {job.location || 'Not specified'}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                                    <FaClock className="text-gray-400" size={10} />
                                                    {getDaysAgo(job.created_at)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-[11px] font-medium text-gray-700">{job.experience}</p>
                                            <p className="text-[11px] text-gray-500">{job.salary}</p>
                                            <Badge variant="default" className="mt-1 bg-white border border-[#EBEBEB] text-gray-500 text-[9px]">
                                                {job.type}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                                <div>
                                                    <span className="block text-gray-400 text-[9px] uppercase">Openings</span>
                                                    {job.openings}
                                                </div>
                                                {/* NEW: Clickable Applicants Section */}
                                                <div
                                                    onClick={() => handleViewApplicants(job)}
                                                    className="cursor-pointer hover:bg-white p-1 -m-1 rounded transition-colors group"
                                                    title="View Applicants"
                                                >
                                                    <span className="block text-gray-400 text-[9px] uppercase group-hover:text-[#2A45C2]">Applicants</span>
                                                    <div className="flex items-center gap-1 group-hover:text-[#2A45C2]">
                                                        <FaUsers className="text-[#2A45C2]" size={10} />
                                                        {job.applicants > 100 ? '100+' : job.applicants}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={job.status === 'Active' ? 'success' : 'default'} className="rounded bg-white border border-[#EBEBEB] text-[10px]">
                                                {job.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 flex justify-end gap-3 mt-1.5">
                                            <button onClick={() => handleOpenEdit(job)} className="text-[#2A45C2] hover:bg-blue-50 p-1.5 rounded" title="Edit">
                                                <FaEdit size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(job.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded" title="Delete">
                                                <FaTrash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        No jobs found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Drawer / Modal */}
            {isApplicantsModalOpen && selectedJobForApplicants && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden border border-[#EBEBEB] flex flex-col max-h-[90vh]">

                        <div className="flex justify-between items-start p-5 border-b border-[#EBEBEB] bg-blue-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                                    <FaUsers className="text-[#2A45C2]" /> Applicants Management
                                </h3>
                                <p className="text-xs font-medium text-[#2A45C2] mt-0.5">Role: {selectedJobForApplicants.title}</p>
                            </div>
                            <button
                                onClick={() => setIsApplicantsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100 border border-[#EBEBEB]"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
                            {isFetchingApplicants ? (
                                <div className="text-center py-10 text-gray-500 font-medium text-sm">Loading applicants...</div>
                            ) : jobApplicants.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 font-medium text-sm">No applicants for this role yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {jobApplicants.map((app) => (
                                        <div key={app.id} className="bg-white p-4 rounded-xl border border-[#EBEBEB] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-sm mb-0.5">{app.applicant_name}</h4>
                                                <p className="text-xs text-gray-600 mb-2">{app.applicant_email}</p>
                                                <div className="flex items-center gap-3">
                                                    <a href={app.resume_link} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#2A45C2] flex items-center gap-1 hover:underline bg-blue-50 px-2 py-1 rounded">
                                                        <FaFileAlt /> View Resume
                                                    </a>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <FaClock size={10} /> Applied {getDaysAgo(app.created_at)}
                                                    </span>
                                                </div>
                                                {app.cover_letter && (
                                                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-[#EBEBEB] italic">
                                                        "{app.cover_letter}"
                                                    </p>
                                                )}
                                            </div>

                                            <div className="w-full md:w-auto shrink-0 border-t border-[#EBEBEB] md:border-0 pt-3 md:pt-0 mt-2 md:mt-0">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                                                    Update Status
                                                </label>
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleApplicantStatusChange(app.id, e.target.value)}
                                                    className={`px-3 py-1.5 border rounded-lg text-xs font-bold focus:outline-none transition-colors w-full md:w-40 shadow-sm
                                                        ${app.status === 'Pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 focus:ring-2 focus:ring-yellow-200' :
                                                            app.status === 'Reviewed' ? 'bg-blue-50 border-blue-200 text-blue-700 focus:ring-2 focus:ring-blue-200' :
                                                                app.status === 'Interview Scheduled' ? 'bg-purple-50 border-purple-200 text-purple-700 focus:ring-2 focus:ring-purple-200' :
                                                                    app.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700 focus:ring-2 focus:ring-red-200' :
                                                                        app.status === 'Hired' ? 'bg-green-50 border-green-200 text-green-700 focus:ring-2 focus:ring-green-200' :
                                                                            'bg-white border-[#EBEBEB] text-gray-700 focus:border-[#2A45C2]'
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

            {/* Slide-out Panel for Add/Edit Jobs */}
            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={handleClosePanel}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[#EBEBEB] ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
                    <h3 className="text-lg font-extrabold text-gray-900">
                        {editingId ? 'Edit Job' : 'Add New Job'}
                    </h3>
                    <button onClick={handleClosePanel} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-[#EBEBEB]">
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Job Title" name="title" type="text" placeholder="e.g. Marketing Executive" value={formData.title} onChange={handleChange} className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2" required />

                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Company Name" name="company" type="text" placeholder="e.g. ABC Corp" value={formData.company} onChange={handleChange} className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2" required />
                            <Input label="Location" name="location" type="text" placeholder="e.g. Remote, City" value={formData.location} onChange={handleChange} className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Experience Required" name="experience" type="text" placeholder="e.g. 2 - 7 years" value={formData.experience} onChange={handleChange} className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2" />
                            <Input label="Salary Details" name="salary" type="text" placeholder="e.g. Not Disclosed" value={formData.salary} onChange={handleChange} className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input label="No. of Openings" name="openings" type="number" min="1" value={formData.openings} onChange={handleChange} className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2" />

                            <div className="flex flex-col w-full relative">
                                <label className="mb-1 text-xs font-bold text-gray-700">Job Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm" required>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1 text-xs font-bold text-gray-700">Job Description</label>
                            <textarea name="description" rows="4" placeholder="Describe the role, responsibilities, and requirements..." value={formData.description} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm resize-y"></textarea>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1 text-xs font-bold text-gray-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm" required>
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-[#EBEBEB] bg-gray-50 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={handleClosePanel} type="button" className="rounded-lg px-5 py-2.5 bg-white border-[#EBEBEB] text-gray-700 hover:bg-gray-100 text-sm font-bold">
                        Cancel
                    </Button>
                    <Button type="submit" form="jobForm" className="rounded-lg px-5 py-2.5 bg-[#2A45C2] text-white border-0 hover:opacity-90 text-sm font-bold">
                        {editingId ? 'Save Changes' : 'Add Job'}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default AdminJobsCom;