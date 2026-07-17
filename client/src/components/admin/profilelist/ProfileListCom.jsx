import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaTimes, FaUser } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';

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

    // Fallback to whichever token is available (Admin or User)
    const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || '';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);

        // 1. Create an AbortController to prevent infinite hanging
        const controller = new AbortController();
        // 2. Set a 10-second timeout limit
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
                signal: controller.signal // 👈 Attach the timeout signal
            });

            clearTimeout(timeoutId); // Clear the timeout if the request succeeds

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

            // Check if the error was caused by our timeout abort
            if (error.name === 'AbortError') {
                toast.error('Request timed out. The backend server is not responding.');
            } else {
                toast.error('Failed to fetch users. Is the server running?');
            }

            setUsers([]); // Reset to empty array on failure
        } finally {
            setIsLoading(false); // Guarantees the loading spinner stops
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
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={14} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users by name, email, or role..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm text-gray-700"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Badge variant="primary" className="text-xs px-3 py-1.5 rounded bg-blue-50 text-[#2A45C2] border border-[#EBEBEB] font-bold">
                        {filteredUsers.length} Users Found
                    </Badge>
                </div>
            </div>

            <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden p-2 md:p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#EBEBEB]">
                            <tr>
                                <th className="px-4 py-3">User Profile</th>
                                <th className="px-4 py-3">Contact Info</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        Loading users... Please wait.
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#2A45C2] text-white flex items-center justify-center font-bold text-[10px] shadow-sm flex-shrink-0">
                                                    {getInitials(user.name)}
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 font-medium text-xs">{user.email}</span>
                                                <span className="text-[10px] text-gray-500 mt-0.5">{user.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-gray-700 text-xs">{user.role}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={user.status === 'Active' ? 'success' : user.status === 'Pending' ? 'warning' : 'default'}
                                                className="rounded bg-white border border-[#EBEBEB] text-[10px]"
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 flex justify-end gap-3 items-center">
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                className="text-[#2A45C2] hover:bg-blue-50 p-1.5 rounded transition-colors"
                                                title="Edit User"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                title="Delete User"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        No users found matching your search.
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
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[#EBEBEB] ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-[#2A45C2] border border-[#EBEBEB] rounded-lg flex items-center justify-center">
                            <FaUser size={12} />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900">
                            Edit User
                        </h3>
                    </div>
                    <button
                        onClick={handleClosePanel}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-[#EBEBEB]"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <form id="editUserForm" onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2.5"
                            required
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2.5"
                            required
                        />

                        <Input
                            label="Phone Number"
                            name="phone"
                            type="text"
                            value={formData.phone}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2.5"
                            required
                        />

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">
                                User Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm"
                                required
                            >
                                <option value="User">User</option>
                                <option value="Distributor">Distributor</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">
                                Account Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm"
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Inactive">Inactive</option>
                            </select>
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
                        form="editUserForm"
                        className="rounded-lg px-5 py-2.5 bg-[#2A45C2] text-white border-0 hover:opacity-90 text-sm font-bold"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileListCom;