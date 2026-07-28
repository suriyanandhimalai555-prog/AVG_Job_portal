import React, { useState, useEffect } from 'react';
import {
    FaUserPlus, FaTimes, FaSearch,
    FaFilter, FaUserFriends, FaGlobe, FaEllipsisH,
    FaUserCheck, FaUsers
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';

const MyNetworkCom = () => {
    const [activeTab, setActiveTab] = useState('discover');
    const [isLoading, setIsLoading] = useState(true);

    // Dynamic State for Network Data
    const [discoverUsers, setDiscoverUsers] = useState([]);
    const [followersData, setFollowersData] = useState([]);
    const [followingData, setFollowingData] = useState([]);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken') || '';

    useEffect(() => {
        fetchNetworkData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchNetworkData = async () => {
        setIsLoading(true);
        try {
            const token = getAuthToken();
            if (!token) return;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;
            const headers = { 'Authorization': `Bearer ${token}` };

            // 1. Fetch Follow Stats
            const statsRes = await fetch(`${apiUrl}/api/users/${userId}/follow-stats`, { headers }).catch(() => null);
            let followingIds = [];
            let followerIds = [];

            if (statsRes && statsRes.ok) {
                const statsData = await statsRes.json();
                followingIds = statsData.following_ids || [];
                followerIds = statsData.follower_ids || [];
            }

            // 2. Fetch all users to map the details
            const usersRes = await fetch(`${apiUrl}/api/users`, { headers }).catch(() => null);
            if (usersRes && usersRes.ok) {
                const usersList = await usersRes.json();

                // Filter out current user and admins
                const validUsers = usersList.filter(u => u.id !== userId && u.role?.toLowerCase() !== 'admin');

                // Categorize users based on follow data
                const fetchedFollowing = validUsers.filter(u => followingIds.includes(u.id));
                const fetchedFollowers = validUsers.filter(u => followerIds.includes(u.id));
                const fetchedDiscover = validUsers.filter(u => !followingIds.includes(u.id));

                setFollowingData(fetchedFollowing);
                setFollowersData(fetchedFollowers);
                setDiscoverUsers(fetchedDiscover);
            }
        } catch (error) {
            console.error("Failed to fetch network data:", error);
            toast.error("Failed to load network data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleFollow = async (targetUser) => {
        try {
            const token = getAuthToken();
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = payload.id;

            const res = await fetch(`${apiUrl}/api/users/${targetUser.id}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ followerId: currentUserId })
            });

            if (res.ok) {
                const data = await res.json();

                if (data.followed) {
                    toast.success(`You are now following ${getDisplayName(targetUser)}`);
                    // Optimistic UI Update: Add to Following, Remove from Discover
                    setFollowingData(prev => [...prev, targetUser]);
                    setDiscoverUsers(prev => prev.filter(u => u.id !== targetUser.id));
                } else {
                    toast.success(`You unfollowed ${getDisplayName(targetUser)}`);
                    // Optimistic UI Update: Remove from Following, Add to Discover
                    setFollowingData(prev => prev.filter(u => u.id !== targetUser.id));
                    setDiscoverUsers(prev => {
                        if (!prev.some(u => u.id === targetUser.id)) {
                            return [...prev, targetUser];
                        }
                        return prev;
                    });
                }
            } else {
                throw new Error("Failed to toggle follow");
            }
        } catch (error) {
            console.error("Follow error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    // Helper to extract the display name
    const getDisplayName = (user) => user.full_name || user.name || 'Unknown User';

    // Helper to check if we are already following a specific user
    const isFollowingUser = (userId) => followingData.some(u => u.id === userId);

    return (
        <div className="max-w-[1400px] mx-auto p-2 md:p-3 rounded-2xl bg-[#F5F6FC] min-h-screen">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#1f2937',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                        border: '1px solid #f3f4f6',
                        fontSize: '14px',
                        fontWeight: '600'
                    }
                }}
            />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">

                {/* Left Sidebar - Navigation & Filters */}
                <div className="w-full lg:w-72 shrink-0 space-y-3">
                    {/* Manage Network Card */}
                    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E7E9F7]">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Manage Network</h2>
                        <ul className="space-y-1.5">
                            <li>
                                <button
                                    onClick={() => setActiveTab('discover')}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all font-medium ${activeTab === 'discover' ? 'bg-[#EEF1FE] text-[#2A45C2]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaGlobe size={16} />
                                        <span className="text-sm">Discover</span>
                                    </div>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('followers')}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all font-medium ${activeTab === 'followers' ? 'bg-[#EEF1FE] text-[#2A45C2]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaUsers size={16} />
                                        <span className="text-sm">Followers</span>
                                    </div>
                                    <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold border border-[#E7E9F7]">{followersData.length}</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('following')}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all font-medium ${activeTab === 'following' ? 'bg-[#EEF1FE] text-[#2A45C2]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaUserCheck size={16} />
                                        <span className="text-sm">Following</span>
                                    </div>
                                    <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold border border-[#E7E9F7]">{followingData.length}</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Stats or Promo Card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] rounded-2xl p-4 text-white shadow-[0_10px_20px_rgba(42,69,194,0.2)]">
                        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        <div className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/5 blur-2xl" />
                        <h3 className="font-bold text-base mb-1.5 relative">Expand Your Reach</h3>
                        <p className="text-white/80 text-sm mb-3 relative">Connecting with peers opens up new opportunities and collaborations.</p>
                        <button className="w-full bg-white text-[#2A45C2] font-bold py-2 rounded-xl hover:shadow-lg transition-all text-sm relative">
                            Sync Contacts
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-3">

                    {/* Header / Search Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E7E9F7]">
                        <div className="relative w-full sm:w-96">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder={activeTab === 'discover' ? "Search by name, role, or company..." : `Search in ${activeTab}...`}
                                className="w-full bg-[#F5F6FC] border-none rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#2A45C2]/20 outline-none transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#2A45C2] transition-colors px-2">
                            <FaFilter /> Filters
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 text-[#2A45C2]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A45C2]"></div>
                        </div>
                    ) : (
                        <>
                            {/* --- TAB: DISCOVER --- */}
                            {activeTab === 'discover' && (
                                <div>
                                    <div className="flex justify-between items-center mb-2.5 mt-6">
                                        <h2 className="text-lg font-bold text-gray-900">Discover People</h2>
                                        <p className="text-sm text-gray-500 font-medium">Based on your profile</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {discoverUsers.map(user => (
                                            <div key={user.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#E7E9F7] flex flex-col items-center text-center hover:-translate-y-1 hover:border-[#2A45C2]/30 hover:shadow-[0_10px_40px_rgba(42,69,194,0.1)] transition-all duration-300 group">
                                                <div className="w-full flex justify-end mb-1">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <FaEllipsisH />
                                                    </button>
                                                </div>
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#5B4FE0] flex items-center justify-center text-white font-bold text-xl shadow-md mb-3 relative group-hover:scale-105 transition-transform overflow-hidden">
                                                    {user.profile_picture ? (
                                                        <img src={user.profile_picture} alt={getDisplayName(user)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        getDisplayName(user).charAt(0).toUpperCase()
                                                    )}
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-base leading-tight mb-1">{getDisplayName(user)}</h4>
                                                <p className="text-xs text-gray-500 font-medium mb-2 h-8 line-clamp-2 px-2">{user.role || 'Member'}</p>
                                                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-3.5 bg-gray-50 px-3 py-1 rounded-full">
                                                    <FaUserFriends size={10} />
                                                    <span>0 mutual connections</span>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleFollow(user)}
                                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm border-2 border-[#2A45C2] text-[#2A45C2] hover:bg-[#2A45C2] hover:text-white transition-colors"
                                                >
                                                    <FaUserPlus size={14} />
                                                    Follow
                                                </button>
                                            </div>
                                        ))}
                                        {discoverUsers.length === 0 && (
                                            <p className="text-sm text-gray-400 font-medium col-span-full text-center py-8">No new users found to discover.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: FOLLOWERS --- */}
                            {activeTab === 'followers' && (
                                <div className="mt-4">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Your Followers</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {followersData.map(user => {
                                            const isFollowingBack = isFollowingUser(user.id);

                                            return (
                                                <div key={user.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#E7E9F7] hover:border-[#2A45C2]/30 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden">
                                                            {user.profile_picture ? (
                                                                <img src={user.profile_picture} alt={getDisplayName(user)} className="w-full h-full object-cover" />
                                                            ) : (
                                                                getDisplayName(user).charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-sm">{getDisplayName(user)}</h4>
                                                            <p className="text-xs text-gray-500 font-medium">{user.role || 'Member'}</p>
                                                        </div>
                                                    </div>

                                                    {isFollowingBack ? (
                                                        <button
                                                            onClick={() => handleToggleFollow(user)}
                                                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs bg-[#2A45C2] text-white hover:bg-red-50 hover:text-red-600 hover:border-red-100 hover:shadow-inner border border-transparent transition-all group"
                                                        >
                                                            <FaUserCheck size={12} className="group-hover:hidden" />
                                                            <FaTimes size={12} className="hidden group-hover:block" />
                                                            <span className="group-hover:hidden">Following</span>
                                                            <span className="hidden group-hover:block">Unfollow</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleToggleFollow(user)}
                                                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs border border-[#2A45C2] text-[#2A45C2] hover:bg-[#2A45C2] hover:text-white transition-colors"
                                                        >
                                                            <FaUserPlus size={12} />
                                                            Follow Back
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {followersData.length === 0 && (
                                            <p className="text-sm text-gray-400 font-medium col-span-full py-8 text-center w-full">You don't have any followers yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: FOLLOWING --- */}
                            {activeTab === 'following' && (
                                <div className="mt-4">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">People You Follow</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {followingData.map(user => (
                                            <div key={user.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#E7E9F7] hover:border-[#2A45C2]/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#5B4FE0] flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden">
                                                        {user.profile_picture ? (
                                                            <img src={user.profile_picture} alt={getDisplayName(user)} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getDisplayName(user).charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm">{getDisplayName(user)}</h4>
                                                        <p className="text-xs text-gray-500 font-medium">{user.role || 'Member'}</p>
                                                    </div>
                                                </div>
                                                {/* Filled button to indicate active following state */}
                                                <button
                                                    onClick={() => handleToggleFollow(user)}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs bg-[#2A45C2] text-white hover:bg-red-50 hover:text-red-600 hover:border-red-100 hover:shadow-inner border border-transparent transition-all group"
                                                >
                                                    <FaUserCheck size={12} className="group-hover:hidden" />
                                                    <FaTimes size={12} className="hidden group-hover:block" />
                                                    <span className="group-hover:hidden">Following</span>
                                                    <span className="hidden group-hover:block">Unfollow</span>
                                                </button>
                                            </div>
                                        ))}
                                        {followingData.length === 0 && (
                                            <p className="text-sm text-gray-400 font-medium col-span-full py-8 text-center w-full">You aren't following anyone yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MyNetworkCom;