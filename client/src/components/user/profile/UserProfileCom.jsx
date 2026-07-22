import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Badge from '../../ui/Badge';
import Shimmer from '../../ui/Shimmer';

const UserProfileCom = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [profile, setProfile] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
        role: 'User',
        status: 'Active'
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken') || '';

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found.");

            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            const userId = decodedPayload.id;

            const res = await fetch(`${apiUrl}/api/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch user data.");

            const users = await res.json();
            const currentUser = users.find(u => u.id === userId);

            if (currentUser) {
                setProfile({
                    id: currentUser.id,
                    name: currentUser.full_name || currentUser.name || '',
                    email: currentUser.email || '',
                    phone: currentUser.phone || '',
                    role: currentUser.role || 'User',
                    status: currentUser.status || 'Active'
                });
            } else {
                toast.error("User profile not found.");
            }
        } catch (error) {
            console.error("Fetch profile error:", error);
            toast.error("Failed to load profile details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!profile.name || !profile.email || !profile.phone) {
            toast.error("All fields are required.");
            return;
        }

        const loadingToast = toast.loading('Updating profile...');

        try {
            const token = getAuthToken();
            const res = await fetch(`${apiUrl}/api/users/${profile.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    full_name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    role: profile.role,
                    status: profile.status
                })
            });

            if (!res.ok) throw new Error('Failed to update profile.');

            toast.success('Profile updated successfully!', { id: loadingToast });
            setIsEditing(false);

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                storedUser.fullName = profile.name;
                localStorage.setItem('user', JSON.stringify(storedUser));
            }

        } catch (error) {
            console.error("Update profile error:", error);
            toast.error("Failed to update profile.", { id: loadingToast });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        toast.success('Logged out successfully!');
        setTimeout(() => navigate('/login'), 800);
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-3 p-2 md:p-3 rounded-2xl bg-[#F5F6FC]">
                <Shimmer className="w-full h-64 rounded-2xl bg-gray-300" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <Shimmer className="h-28 rounded-2xl" />
                    <Shimmer className="h-28 rounded-2xl" />
                    <Shimmer className="h-28 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-3 p-2 md:p-3 rounded-2xl bg-[#F5F6FC]">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="bg-white border border-[#E7E9F7] rounded-2xl p-4 md:p-6 shadow-[0_2px_16px_rgba(30,41,89,0.05)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
                </div>

                <div className="relative flex flex-col items-center text-center pt-9">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white p-1.5 rounded-full shadow-xl mb-3.5 border border-white hover:scale-105 transition-transform duration-200">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center text-3xl font-extrabold text-white shadow-inner">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>

                    {!isEditing ? (
                        <>
                            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">{profile.name}</h2>
                            <p className="text-sm text-gray-500 font-medium mb-0.5">{profile.email}</p>
                            <p className="text-sm text-gray-400 font-medium mb-3.5">{profile.phone}</p>
                            <Badge variant="success" className="px-3.5 py-1.5 text-xs font-bold gap-2 bg-[#EEF1FE] text-[#2A45C2] border-0 rounded-full shadow-sm">
                                <FaCheck size={12} /> Profile {profile.status}
                            </Badge>
                        </>
                    ) : (
                        <div className="w-full max-w-md space-y-3 text-left mt-2.5 bg-gray-50/50 p-4 rounded-2xl border border-[#E7E9F7]">
                            <Input
                                label="Full Name"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] py-2.5 shadow-sm transition-all"
                            />
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={profile.email}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] py-2.5 shadow-sm transition-all"
                            />
                            <Input
                                label="Phone Number"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] py-2.5 shadow-sm transition-all"
                            />
                            <div className="flex gap-3 pt-2.5">
                                <Button className="flex-1 rounded-xl bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0 font-bold py-2.5 shadow-md hover:shadow-lg transition-all" onClick={handleSave}>
                                    Save Changes
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-xl border-[#E7E9F7] text-gray-700 bg-white hover:bg-gray-50 font-bold py-2.5 transition-all" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {[
                    { label: 'Applied', value: '0', bar: 'from-[#2A45C2] to-[#5B4FE0]' },
                    { label: 'Courses', value: '0', bar: 'from-[#5B4FE0] to-[#8B5CF6]' },
                    { label: 'Saved', value: '0', bar: 'from-[#D4A017] to-[#F2C14E]' }
                ].map((stat, idx) => (
                    <div key={idx} className="relative bg-white border border-[#E7E9F7] rounded-2xl p-4 text-center shadow-[0_2px_16px_rgba(30,41,89,0.05)] overflow-hidden group hover:shadow-[0_6px_24px_rgba(30,41,89,0.1)] hover:-translate-y-0.5 transition-all">
                        <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${stat.bar} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <h3 className="text-2xl font-black text-gray-900 mb-0.5">{stat.value}</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {!isEditing && (
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1 max-w-lg mx-auto">
                    <Button
                        className="flex-1 py-3 text-sm font-bold rounded-xl border border-[#E7E9F7] text-gray-800 shadow-sm hover:border-[#2A45C2] hover:text-[#2A45C2] transition-all flex items-center justify-center gap-2"
                        onClick={() => setIsEditing(true)}
                    >
                        <FaUserEdit /> Edit Profile
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="flex-1 py-3 text-sm font-bold rounded-xl text-red-500 border-[#E7E9F7] bg-white hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <FaSignOutAlt /> Log out
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserProfileCom;