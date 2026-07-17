import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaSignOutAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Badge from '../../ui/Badge';

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
            if (!token) {
                throw new Error("No authentication token found.");
            }

            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            const userId = decodedPayload.id;

            const res = await fetch(`${apiUrl}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

        setTimeout(() => {
            navigate('/user-login');
        }, 800);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
                Loading profile details...
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#2A45C2] text-white rounded-2xl flex items-center justify-center text-3xl font-extrabold mb-4 shadow-sm border border-[#EBEBEB]">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>

                {!isEditing ? (
                    <>
                        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">{profile.name}</h2>
                        <p className="text-sm text-gray-500 font-medium mb-1">{profile.email}</p>
                        <p className="text-sm text-gray-400 font-medium mb-4">{profile.phone}</p>
                        <Badge variant="success" className="px-3 py-1.5 text-xs font-bold gap-1.5 bg-blue-50 text-[#2A45C2] border border-[#EBEBEB]">
                            <FaCheck size={10} /> Profile {profile.status}
                        </Badge>
                    </>
                ) : (
                    <div className="w-full max-w-sm space-y-4 text-left mt-3">
                        <Input
                            label="Full Name"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] rounded-lg focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm py-2.5"
                        />
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={profile.email}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] rounded-lg focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm py-2.5"
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] rounded-lg focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm py-2.5"
                        />
                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1 rounded-lg bg-[#2A45C2] text-white border-0 font-bold text-sm" onClick={handleSave}>
                                Save Changes
                            </Button>
                            <Button variant="outline" className="flex-1 rounded-lg border-[#EBEBEB] text-gray-700 hover:bg-gray-50 text-sm font-bold" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 text-center shadow-sm">
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-1">0</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applied</p>
                </div>
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 text-center shadow-sm">
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-1">0</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Courses</p>
                </div>
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 text-center shadow-sm">
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-1">0</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saved</p>
                </div>
            </div>

            {!isEditing && (
                <div className="space-y-3 pt-3 max-w-xs mx-auto">
                    <Button
                        className="w-full py-3.5 text-sm font-bold rounded-xl bg-[#2A45C2] text-white border-0 shadow-sm"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full py-3.5 text-sm font-bold rounded-xl text-red-500 border-[#EBEBEB] bg-white hover:bg-red-50 hover:border-red-100 flex items-center justify-center gap-2"
                    >
                        <FaSignOutAlt /> Log out
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserProfileCom;