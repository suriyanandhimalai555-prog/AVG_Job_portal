import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input'; // Assuming Input is located in the same UI folder

const AdminDirectoryCom = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Changed to state so the table updates dynamically when adding/editing/deleting
    const [businesses, setBusinesses] = useState([
        { id: 1, name: 'ABC IT Solutions', category: 'IT Services', location: 'Dubai, UAE', status: 'Active' },
        { id: 2, name: 'BuildTech Contracting', category: 'Construction', location: 'Sharjah, UAE', status: 'Active' },
        { id: 3, name: 'Digital Marketers Hub', category: 'Marketing', location: 'Dubai, UAE', status: 'Pending' },
        { id: 4, name: 'Apex Consulting', category: 'Consulting', location: 'Abu Dhabi, UAE', status: 'Active' },
    ]);

    // Slide-in Panel State
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        location: '',
        status: 'Active'
    });

    // Form Handlers
    const handleOpenAdd = () => {
        setFormData({ name: '', category: '', location: '', status: 'Active' });
        setEditingId(null);
        setIsPanelOpen(true);
    };

    const handleOpenEdit = (biz) => {
        setFormData({ name: biz.name, category: biz.category, location: biz.location, status: biz.status });
        setEditingId(biz.id);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            // Update existing business
            setBusinesses(businesses.map(b => b.id === editingId ? { ...b, ...formData } : b));
        } else {
            // Add new business
            setBusinesses([...businesses, { id: Date.now(), ...formData }]);
        }
        setIsPanelOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this business?')) {
            setBusinesses(businesses.filter(b => b.id !== id));
        }
    };

    // Simple search filter logic
    const filteredBusinesses = businesses.filter((biz) =>
        biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 relative">

            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search businesses..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm text-gray-700"
                    />
                </div>
                <Button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 rounded-md">
                    <FaPlus size={12} /> Add New Business
                </Button>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Business Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBusinesses.length > 0 ? (
                                filteredBusinesses.map((biz) => (
                                    <tr key={biz.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{biz.name}</td>
                                        <td className="px-6 py-4">{biz.category}</td>
                                        <td className="px-6 py-4">{biz.location}</td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={biz.status === 'Active' ? 'success' : 'default'}
                                                className="rounded-md"
                                            >
                                                {biz.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-3">
                                            <button
                                                onClick={() => handleOpenEdit(biz)}
                                                className="text-gray-400 hover:text-[#2A45C2] transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(biz.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No businesses found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing {filteredBusinesses.length > 0 ? 1 : 0} to {filteredBusinesses.length} of {businesses.length} entries</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1 bg-[#2A45C2] text-white border border-[#2A45C2] rounded-md shadow-sm">1</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Slide-in Overlay */}
            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={handleClosePanel}
                ></div>
            )}

            {/* Right-to-Left Slide-in Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {editingId ? 'Edit Business' : 'Add New Business'}
                    </h3>
                    <button
                        onClick={handleClosePanel}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Panel Body (Form) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="businessForm" onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Business Name"
                            name="name"
                            type="text"
                            placeholder="e.g. ABC IT Solutions"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Category"
                            name="category"
                            type="text"
                            placeholder="e.g. IT Services"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Location"
                            name="location"
                            type="text"
                            placeholder="e.g. Dubai, UAE"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-sm font-bold text-gray-700">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-1 focus:ring-[#2A45C2] transition-all text-gray-700"
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* Panel Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClosePanel}
                        className="rounded-md px-6 bg-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="businessForm"
                        className="rounded-md px-6"
                    >
                        {editingId ? 'Save Changes' : 'Add Business'}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default AdminDirectoryCom;