import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaStar, FaCheckCircle, FaEye, FaMousePointer, FaMapMarkerAlt, FaGlobe, FaEnvelope, FaPhone } from 'react-icons/fa';
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
        if (window.confirm('Are you sure you want to delete this business?')) {
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
        biz.category.toLowerCase().includes(searchTerm.toLowerCase())
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
                        placeholder="Search businesses or categories..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm text-gray-700"
                    />
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#2A45C2] text-white px-5 py-2.5 border-0 hover:opacity-90 w-full sm:w-auto text-sm font-bold shadow-sm"
                >
                    <FaPlus size={12} /> Add New Business
                </Button>
            </div>

            <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden p-2 md:p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#EBEBEB]">
                            <tr>
                                <th className="px-4 py-3">Business Identity</th>
                                <th className="px-4 py-3">Contact & Links</th>
                                <th className="px-4 py-3">Analytics</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        Loading businesses...
                                    </td>
                                </tr>
                            ) : filteredBusinesses.length > 0 ? (
                                filteredBusinesses.map((biz) => (
                                    <tr key={biz.id} className="hover:bg-blue-50 transition-colors">

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {biz.logo_url ? (
                                                    <img src={biz.logo_url} alt="logo" className="w-10 h-10 rounded-lg object-cover border border-[#EBEBEB]" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-[#EBEBEB]">
                                                        {biz.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                                                        {biz.name}
                                                        {biz.is_verified && <FaCheckCircle className="text-blue-500" title="Verified Business" size={12} />}
                                                        {biz.is_featured && <FaStar className="text-yellow-400" title="Featured Business" size={12} />}
                                                    </p>
                                                    <p className="text-xs text-[#2A45C2] font-medium">{biz.category}</p>
                                                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><FaMapMarkerAlt size={9} /> {biz.location}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-xs space-y-1 text-gray-500">
                                            {biz.contact_person && <div className="font-medium text-gray-700">{biz.contact_person}</div>}
                                            {biz.phone && <div className="flex items-center gap-1.5"><FaPhone size={10} /> {biz.phone}</div>}
                                            {biz.website && <div className="flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer"><FaGlobe size={10} /> Website</div>}
                                            {biz.email && <div className="flex items-center gap-1.5"><FaEnvelope size={10} /> {biz.email}</div>}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                                <div className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg border border-[#EBEBEB] min-w-[50px]">
                                                    <FaEye className="text-blue-500 mb-0.5" size={12} />
                                                    <span className="text-[10px] text-gray-900 font-bold">{biz.views}</span>
                                                </div>
                                                <div className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg border border-[#EBEBEB] min-w-[50px]">
                                                    <FaMousePointer className="text-green-500 mb-0.5" size={10} />
                                                    <span className="text-[10px] text-gray-900 font-bold">{biz.clicks}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <Badge variant={biz.status === 'Active' ? 'success' : biz.status === 'Pending' ? 'default' : 'default'} className={`rounded border text-[10px] ${biz.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-white border-[#EBEBEB]'}`}>
                                                {biz.status}
                                            </Badge>
                                        </td>

                                        <td className="px-4 py-3 flex justify-end gap-3 mt-1.5">
                                            <button onClick={() => handleOpenEdit(biz)} className="text-[#2A45C2] hover:bg-blue-50 p-1.5 rounded" title="Edit">
                                                <FaEdit size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(biz.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded" title="Delete">
                                                <FaTrash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        No businesses found matching your search.
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
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[#EBEBEB] ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB] bg-gray-50 shrink-0">
                    <h3 className="text-lg font-extrabold text-gray-900">
                        {editingId ? 'Edit Business Details' : 'Add New Business'}
                    </h3>
                    <button onClick={handleClosePanel} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-[#EBEBEB]">
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                    <form id="businessForm" onSubmit={handleSubmit} className="space-y-5">

                        {/* Highlights Toggle Group */}
                        <div className="flex gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-[#2A45C2] rounded focus:ring-[#2A45C2]" />
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><FaStar className="text-yellow-500" /> Featured Business</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer ml-4">
                                <input type="checkbox" name="is_verified" checked={formData.is_verified} onChange={handleChange} className="w-4 h-4 text-[#2A45C2] rounded focus:ring-[#2A45C2]" />
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><FaCheckCircle className="text-blue-500" /> Verified Badge</span>
                            </label>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Business Name *" name="name" type="text" placeholder="e.g. ABC IT Solutions" value={formData.name} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" required />
                            <Input label="Category *" name="category" type="text" placeholder="e.g. IT Services" value={formData.category} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" required />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">Logo Image URL</label>
                            <input name="logo_url" type="url" placeholder="https://example.com/logo.png" value={formData.logo_url} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm" />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">Business Description</label>
                            <textarea name="description" rows="3" placeholder="Describe the business services..." value={formData.description} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm resize-y"></textarea>
                        </div>

                        {/* Contact & Location Info */}
                        <h4 className="text-xs font-extrabold text-gray-900 border-b border-[#EBEBEB] pb-2 uppercase tracking-wider">Contact & Location</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Contact Person" name="contact_person" type="text" placeholder="e.g. Jane Doe" value={formData.contact_person} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                            <Input label="Phone Number" name="phone" type="text" placeholder="e.g. +1 234 567 8900" value={formData.phone} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Email Address" name="email" type="email" placeholder="e.g. contact@business.com" value={formData.email} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                            <Input label="Website URL" name="website" type="url" placeholder="https://www.business.com" value={formData.website} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Location Address *" name="location" type="text" placeholder="e.g. Dubai, UAE" value={formData.location} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" required />
                            <Input label="Google Maps Link" name="google_maps_url" type="url" placeholder="https://maps.google.com/..." value={formData.google_maps_url} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">Social Media Links (Comma separated)</label>
                            <input name="social_links" type="text" placeholder="LinkedIn, Twitter, Facebook" value={formData.social_links} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm" />
                        </div>

                        {/* Admin Config */}
                        <h4 className="text-xs font-extrabold text-gray-900 border-b border-[#EBEBEB] pb-2 uppercase tracking-wider">Admin Configurations</h4>

                        <div className="grid grid-cols-3 gap-4 items-end">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-1.5 text-xs font-bold text-gray-700">Status *</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm" required>
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <Input label="Manual Views" name="views" type="number" min="0" value={formData.views} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                            <Input label="Manual Clicks" name="clicks" type="number" min="0" value={formData.clicks} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                        </div>

                    </form>
                </div>

                <div className="p-5 border-t border-[#EBEBEB] bg-gray-50 flex items-center justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={handleClosePanel} type="button" className="rounded-lg px-5 py-2.5 bg-white border-[#EBEBEB] text-gray-700 hover:bg-gray-100 text-sm font-bold">
                        Cancel
                    </Button>
                    <Button type="submit" form="businessForm" className="rounded-lg px-5 py-2.5 bg-[#2A45C2] text-white border-0 hover:opacity-90 text-sm font-bold shadow-sm">
                        {editingId ? 'Save Details' : 'Add Business'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminDirectoryCom;