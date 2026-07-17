import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaUsers, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';

const AdminJobsCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
        applicants: 0
    });

    const handleOpenAdd = () => {
        setFormData({
            title: '',
            company: '',
            location: '',
            type: 'Full Time',
            status: 'Active',
            experience: '2 - 7 years',
            salary: 'Not Disclosed',
            openings: 1,
            applicants: 0
        });
        setEditingId(null);
        setIsPanelOpen(true);
    };

    const handleOpenEdit = (job) => {
        setFormData({
            title: job.title,
            company: job.company,
            location: job.location || '',
            type: job.type,
            status: job.status,
            experience: job.experience || 'Not specified',
            salary: job.salary || 'Not Disclosed',
            openings: job.openings || 1,
            applicants: job.applicants || 0
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
            if (editingId) {
                const res = await fetch(`${apiUrl}/api/jobs/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    const updatedJob = await res.json();
                    setJobs(jobs.map(j => j.id === editingId ? updatedJob : j));
                    toast.success('Job updated successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to update');
                }
            } else {
                const res = await fetch(`${apiUrl}/api/jobs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    const newJob = await res.json();
                    setJobs([newJob, ...jobs]);
                    toast.success('Job added successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to add');
                }
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
                const res = await fetch(`${apiUrl}/api/jobs/${id}`, {
                    method: 'DELETE'
                });

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
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl">

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
                                                <div>
                                                    <span className="block text-gray-400 text-[9px] uppercase">Applicants</span>
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers className="text-[#2A45C2]" size={10} /> {job.applicants > 100 ? '100+' : job.applicants}
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
                                            <button
                                                onClick={() => handleOpenEdit(job)}
                                                className="text-[#2A45C2] hover:bg-blue-50 p-1.5 rounded"
                                                title="Edit"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                                                title="Delete"
                                            >
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
                    <button
                        onClick={handleClosePanel}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-[#EBEBEB]"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Job Title"
                            name="title"
                            type="text"
                            placeholder="e.g. Marketing Executive"
                            value={formData.title}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2"
                            required
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Company Name"
                                name="company"
                                type="text"
                                placeholder="e.g. ABC Corp"
                                value={formData.company}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2"
                                required
                            />

                            <Input
                                label="Location"
                                name="location"
                                type="text"
                                placeholder="e.g. Remote, City"
                                value={formData.location}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Experience Required"
                                name="experience"
                                type="text"
                                placeholder="e.g. 2 - 7 years"
                                value={formData.experience}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2"
                            />

                            <Input
                                label="Salary Details"
                                name="salary"
                                type="text"
                                placeholder="e.g. Not Disclosed"
                                value={formData.salary}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="No. of Openings"
                                name="openings"
                                type="number"
                                min="1"
                                value={formData.openings}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2"
                            />

                            <Input
                                label="Initial Applicants"
                                name="applicants"
                                type="number"
                                min="0"
                                value={formData.applicants}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-1 text-xs font-bold text-gray-700">
                                    Job Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm"
                                    required
                                >
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>

                            <div className="flex flex-col w-full relative">
                                <label className="mb-1 text-xs font-bold text-gray-700">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm"
                                    required
                                >
                                    <option value="Active">Active</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-[#EBEBEB] bg-gray-50 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClosePanel}
                        type="button"
                        className="rounded-lg px-5 py-2.5 bg-white border-[#EBEBEB] text-gray-700 hover:bg-gray-100 text-sm font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="jobForm"
                        className="rounded-lg px-5 py-2.5 bg-[#2A45C2] text-white border-0 hover:opacity-90 text-sm font-bold"
                    >
                        {editingId ? 'Save Changes' : 'Add Job'}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default AdminJobsCom;