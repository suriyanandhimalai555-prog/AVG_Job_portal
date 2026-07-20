import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaTimes, FaUser, FaEnvelope, FaPhone, FaShieldAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const ProfileListCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'User',
        status: 'Active'
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || '';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const token = getAuthToken();
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${apiUrl}/api/users`, {
                method: 'GET',
                headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`Server returned status: ${res.status}`);
            }

            const data = await res.json();

            if (Array.isArray(data)) {
                const formattedData = data.map(u => ({
                    id: u.id,
                    name: u.full_name || u.name || 'Unknown',
                    email: u.email,
                    phone: u.phone || 'N/A',
                    role: u.role || 'User',
                    status: u.status || 'Active'
                }));
                setUsers(formattedData);
            } else {
                console.error("Expected an array of users but received:", data);
                setUsers([]);
                toast.error('Invalid data format received from server.');
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            if (error.name === 'AbortError') {
                toast.error('Request timed out. The backend server is not responding.');
            } else {
                toast.error('Failed to fetch users. Is the server running?');
            }

            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEdit = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
        });
        setEditingId(user.id);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Updating user profile...');

        try {
            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const res = await fetch(`${apiUrl}/api/users/${editingId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    full_name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    status: formData.status
                })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === editingId ? { ...u, ...formData } : u));
                toast.success('User profile updated successfully!', { id: loadingToast });
                setIsPanelOpen(false);
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to update user profile.', { id: loadingToast });
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const loadingToast = toast.loading('Deleting user...');

            try {
                const token = getAuthToken();
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                };

                const res = await fetch(`${apiUrl}/api/users/${id}`, {
                    method: 'DELETE',
                    headers
                });

                if (res.ok) {
                    setUsers(users.filter(u => u.id !== id));
                    toast.success('User deleted successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to delete');
                }
            } catch (error) {
                toast.error('Failed to delete user.', { id: loadingToast });
                console.error(error);
            }
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 rounded-[32px] bg-[#F5F6FC] min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#0B0F19] tracking-tight">User Directory</h2>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Manage platform members and permissions</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:max-w-md">
                    <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#4353FF]" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users by name, email, or role..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-0 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#4353FF]/20 text-sm font-medium text-gray-700 transition-shadow"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="bg-white border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-[#4353FF] px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2">
                        <FaUser size={14} />
                        {filteredUsers.length} Members Found
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                        <thead className="bg-[#F8F9FA] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-3xl">Identity & Profile</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Information</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right rounded-tr-3xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 font-bold animate-pulse">
                                        Loading user directory...
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#F8F9FE] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4353FF] to-[#8B5CF6] flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                                                    {getInitials(user.name)}
                                                </div>
                                                <span className="font-black text-[#0B0F19] text-base group-hover:text-[#4353FF] transition-colors">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <FaEnvelope className="text-gray-400 shrink-0" size={12} />
                                                <span className="text-sm font-bold text-gray-600">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaPhone className="text-gray-400 shrink-0" size={12} />
                                                <span className="text-xs font-bold text-gray-400 tracking-wider">{user.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'Admin' ? <FaShieldAlt className="text-purple-500" size={12} /> : <FaUser className="text-gray-400" size={12} />}
                                                <span className={`font-black text-[11px] uppercase tracking-widest ${user.role === 'Admin' ? 'text-purple-600' : 'text-gray-500'}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${user.status === 'Active' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                                                    user.status === 'Pending' ? 'border-yellow-100 bg-yellow-50 text-yellow-600' :
                                                        'border-gray-200 bg-gray-50 text-gray-500'
                                                }`}>
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="w-9 h-9 bg-white border border-gray-100 text-[#0B0F19] rounded-xl flex items-center justify-center hover:bg-[#4353FF] hover:text-white hover:border-[#4353FF] transition-all shadow-sm"
                                                    title="Edit User"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="w-9 h-9 bg-white border border-gray-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                                    title="Delete User"
                                                >
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
                                                <FaUser size={24} />
                                            </div>
                                            <p className="text-base font-black text-[#0B0F19]">No members found</p>
                                            <p className="text-sm font-medium text-gray-500 mt-1">Try adjusting your search criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-[#0B101E]/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={handleClosePanel}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col rounded-l-[32px] overflow-hidden ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white shrink-0 z-10">
                    <div>
                        <h3 className="text-2xl font-black text-[#0B0F19] tracking-tight">
                            Edit Profile
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-widest">Update Member Permissions</p>
                    </div>
                    <button
                        onClick={handleClosePanel}
                        className="w-10 h-10 bg-[#F8F9FA] hover:bg-gray-100 text-[#0B0F19] rounded-full flex items-center justify-center transition-all shadow-sm"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white relative">
                    <form id="editUserForm" onSubmit={handleSubmit} className="space-y-5">

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name *</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]"
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address *</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]"
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number *</label>
                            <input
                                name="phone"
                                type="text"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]"
                                required
                            />
                        </div>

                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Role *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] appearance-none"
                                    required
                                >
                                    <option value="User">Standard User</option>
                                    <option value="Distributor">Distributor</option>
                                    <option value="Admin">Administrator</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] appearance-none"
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Inactive">Inactive / Suspended</option>
                            </select>
                        </div>

                    </form>
                </div>

                <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-end gap-4 shrink-0 z-10">
                    <Button
                        variant="outline"
                        onClick={handleClosePanel}
                        type="button"
                        className="rounded-xl px-6 py-3.5 bg-white border-2 border-gray-200 text-[#0B0F19] hover:bg-gray-50 text-sm font-black transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="editUserForm"
                        className="rounded-xl px-6 py-3.5 bg-[#0B0F19] text-white border-0 hover:bg-gray-800 text-sm font-black shadow-lg transition-all"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileListCom;