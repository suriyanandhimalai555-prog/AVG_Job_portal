import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaStar, FaCheckCircle, FaEye, FaMousePointer, FaMapMarkerAlt, FaGlobe, FaEnvelope, FaPhone, FaBuilding } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';

const AdminDirectoryCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [businesses, setBusinesses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/businesses`);
            if (res.ok) {
                const data = await res.json();
                setBusinesses(data);
            }
        } catch (error) {
            toast.error('Failed to fetch businesses.');
        } finally {
            setIsLoading(false);
        }
    };

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Expanded form state
    const [formData, setFormData] = useState({
        name: '', category: '', location: '', status: 'Active',
        logo_url: '', description: '', contact_person: '', phone: '',
        email: '', website: '', google_maps_url: '', social_links: '',
        is_featured: false, is_verified: false, views: 0, clicks: 0
    });

    const handleOpenAdd = () => {
        setFormData({
            name: '', category: '', location: '', status: 'Active',
            logo_url: '', description: '', contact_person: '', phone: '',
            email: '', website: '', google_maps_url: '', social_links: '',
            is_featured: false, is_verified: false, views: 0, clicks: 0
        });
        setEditingId(null);
        setIsPanelOpen(true);
    };

    const handleOpenEdit = (biz) => {
        setFormData({
            name: biz.name, category: biz.category, location: biz.location, status: biz.status,
            logo_url: biz.logo_url || '', description: biz.description || '', contact_person: biz.contact_person || '',
            phone: biz.phone || '', email: biz.email || '', website: biz.website || '',
            google_maps_url: biz.google_maps_url || '', social_links: biz.social_links || '',
            is_featured: biz.is_featured || false, is_verified: biz.is_verified || false,
            views: biz.views || 0, clicks: biz.clicks || 0
        });
        setEditingId(biz.id);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingId ? 'Updating business...' : 'Adding new business...');

        try {
            if (editingId) {
                const res = await fetch(`${apiUrl}/api/businesses/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    const updatedBiz = await res.json();
                    setBusinesses(businesses.map(b => b.id === editingId ? updatedBiz : b));
                    toast.success('Business updated successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to update');
                }
            } else {
                const res = await fetch(`${apiUrl}/api/businesses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    const newBiz = await res.json();
                    setBusinesses([newBiz, ...businesses]);
                    toast.success('Business added successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to add');
                }
            }
            setIsPanelOpen(false);
        } catch (error) {
            toast.error(editingId ? 'Failed to update business.' : 'Failed to add business.', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this business?')) {
            const loadingToast = toast.loading('Deleting business...');
            try {
                const res = await fetch(`${apiUrl}/api/businesses/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    setBusinesses(businesses.filter(b => b.id !== id));
                    toast.success('Business deleted successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to delete');
                }
            } catch (error) {
                toast.error('Failed to delete business.', { id: loadingToast });
            }
        }
    };

    const filteredBusinesses = businesses.filter((biz) =>
        biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (biz.location && biz.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 rounded-[32px] bg-[#F5F6FC] min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#0B0F19] tracking-tight">Business Directory</h2>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Manage and monitor ecosystem business profiles</p>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:max-w-md">
                    <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#4353FF]" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, category, or location..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-0 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#4353FF]/20 text-sm font-medium text-gray-700 transition-shadow"
                    />
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2.5 rounded-2xl bg-[#0B0F19] text-white px-6 py-3.5 border-0 hover:bg-gray-800 hover:-translate-y-0.5 transition-all w-full sm:w-auto text-sm font-bold shadow-lg"
                >
                    <FaPlus size={14} /> Add New Business
                </Button>
            </div>

            {/* Data Table Container */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                        <thead className="bg-[#F8F9FA] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-3xl">Business Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact & Links</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Analytics</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right rounded-tr-3xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 font-bold animate-pulse">
                                        Loading directory data...
                                    </td>
                                </tr>
                            ) : filteredBusinesses.length > 0 ? (
                                filteredBusinesses.map((biz) => (
                                    <tr key={biz.id} className="hover:bg-[#F8F9FE] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {biz.logo_url ? (
                                                    <img src={biz.logo_url} alt="logo" className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4353FF] to-[#8B5CF6] flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                                                        {biz.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-[200px]">
                                                    <p className="font-black text-[#0B0F19] text-base flex items-center gap-2 group-hover:text-[#4353FF] transition-colors">
                                                        {biz.name}
                                                        {biz.is_verified && <FaCheckCircle className="text-[#4353FF]" title="Verified Business" size={14} />}
                                                        {biz.is_featured && <FaStar className="text-yellow-400" title="Featured Business" size={14} />}
                                                    </p>
                                                    <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">{biz.category}</p>
                                                    <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-1.5">
                                                        <FaMapMarkerAlt size={10} className="text-gray-300" /> {biz.location || 'Location Pending'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-xs space-y-1.5 text-gray-500 min-w-[200px]">
                                            {biz.contact_person && <div className="font-bold text-[#0B0F19]">{biz.contact_person}</div>}
                                            {biz.phone && <div className="flex items-center gap-2 font-medium"><FaPhone size={10} className="text-gray-400" /> {biz.phone}</div>}
                                            {biz.email && <div className="flex items-center gap-2 font-medium"><FaEnvelope size={10} className="text-gray-400" /> {biz.email}</div>}
                                            {biz.website && <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#4353FF] font-bold hover:underline w-max"><FaGlobe size={10} /> View Website</a>}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3 text-xs font-medium text-gray-600">
                                                <div className="flex flex-col items-center p-2 bg-white rounded-xl border border-gray-100 shadow-sm min-w-[60px]">
                                                    <FaEye className="text-[#4353FF] mb-1" size={14} />
                                                    <span className="text-[11px] text-[#0B0F19] font-black">{biz.views}</span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 bg-white rounded-xl border border-gray-100 shadow-sm min-w-[60px]">
                                                    <FaMousePointer className="text-emerald-500 mb-1" size={12} />
                                                    <span className="text-[11px] text-[#0B0F19] font-black">{biz.clicks}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${biz.status === 'Active' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                                                    biz.status === 'Pending' ? 'border-yellow-100 bg-yellow-50 text-yellow-600' :
                                                        'border-gray-200 bg-gray-50 text-gray-500'
                                                }`}>
                                                {biz.status}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenEdit(biz)} className="w-9 h-9 bg-white border border-gray-100 text-[#0B0F19] rounded-xl flex items-center justify-center hover:bg-[#4353FF] hover:text-white hover:border-[#4353FF] transition-all shadow-sm" title="Edit">
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(biz.id)} className="w-9 h-9 bg-white border border-gray-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm" title="Delete">
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
                                                <FaBuilding size={24} />
                                            </div>
                                            <p className="text-base font-black text-[#0B0F19]">No businesses found</p>
                                            <p className="text-sm font-medium text-gray-500 mt-1">Adjust your search or add a new directory listing.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-out Drawer */}
            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-[#0B101E]/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={handleClosePanel}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col rounded-l-[32px] overflow-hidden ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white shrink-0 z-10">
                    <div>
                        <h3 className="text-2xl font-black text-[#0B0F19] tracking-tight">
                            {editingId ? 'Edit Business Details' : 'Add New Business'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-widest">Update Ecosystem Directory</p>
                    </div>
                    <button onClick={handleClosePanel} className="w-10 h-10 bg-[#F8F9FA] hover:bg-gray-100 text-[#0B0F19] rounded-full flex items-center justify-center transition-all shadow-sm">
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white relative">
                    <form id="businessForm" onSubmit={handleSubmit} className="space-y-6">

                        {/* Highlights Toggle Group */}
                        <div className="flex gap-6 p-5 bg-[#F8F9FE] rounded-2xl border border-blue-50/50">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="peer sr-only" />
                                    <div className="w-5 h-5 bg-white border-2 border-gray-200 rounded-md peer-checked:bg-[#4353FF] peer-checked:border-[#4353FF] transition-colors"></div>
                                    <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span className="text-sm font-bold text-[#0B0F19] flex items-center gap-2 group-hover:text-[#4353FF] transition-colors"><FaStar className="text-yellow-400" /> Featured</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" name="is_verified" checked={formData.is_verified} onChange={handleChange} className="peer sr-only" />
                                    <div className="w-5 h-5 bg-white border-2 border-gray-200 rounded-md peer-checked:bg-[#4353FF] peer-checked:border-[#4353FF] transition-colors"></div>
                                    <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span className="text-sm font-bold text-[#0B0F19] flex items-center gap-2 group-hover:text-[#4353FF] transition-colors"><FaCheckCircle className="text-[#4353FF]" /> Verified</span>
                            </label>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Name *</label>
                                <input name="name" type="text" placeholder="e.g. ABC IT Solutions" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" required />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category *</label>
                                <input name="category" type="text" placeholder="e.g. IT Services" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" required />
                            </div>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo Image URL</label>
                            <input name="logo_url" type="url" placeholder="https://example.com/logo.png" value={formData.logo_url} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Description</label>
                            <textarea name="description" rows="4" placeholder="Describe the business services..." value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] resize-y"></textarea>
                        </div>

                        {/* Contact & Location Info */}
                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <h4 className="text-sm font-black text-[#0B0F19] mb-5">Contact & Location Information</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Person</label>
                                <input name="contact_person" type="text" placeholder="e.g. Jane Doe" value={formData.contact_person} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                <input name="phone" type="text" placeholder="e.g. +1 234 567 8900" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                <input name="email" type="email" placeholder="e.g. contact@business.com" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Website URL</label>
                                <input name="website" type="url" placeholder="https://www.business.com" value={formData.website} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location Address *</label>
                                <input name="location" type="text" placeholder="e.g. Dubai, UAE" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" required />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Google Maps Link</label>
                                <input name="google_maps_url" type="url" placeholder="https://maps.google.com/..." value={formData.google_maps_url} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Social Media Links (Comma separated)</label>
                            <input name="social_links" type="text" placeholder="LinkedIn, Twitter, Facebook" value={formData.social_links} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                        </div>

                        {/* Admin Config */}
                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <h4 className="text-sm font-black text-[#0B0F19] mb-5">Admin Configurations</h4>
                        </div>

                        <div className="grid grid-cols-3 gap-5 items-start">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status *</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] appearance-none" required>
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual Views</label>
                                <input name="views" type="number" min="0" value={formData.views} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual Clicks</label>
                                <input name="clicks" type="number" min="0" value={formData.clicks} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                    </form>
                </div>

                {/* Drawer Footer */}
                <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-end gap-4 shrink-0 z-10">
                    <Button variant="outline" onClick={handleClosePanel} type="button" className="rounded-xl px-6 py-3.5 bg-white border-2 border-gray-200 text-[#0B0F19] hover:bg-gray-50 text-sm font-black transition-all">
                        Cancel
                    </Button>
                    <Button type="submit" form="businessForm" className="rounded-xl px-6 py-3.5 bg-[#0B0F19] text-white border-0 hover:bg-gray-800 text-sm font-black shadow-lg transition-all">
                        {editingId ? 'Save Details' : 'Publish Business'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminDirectoryCom;