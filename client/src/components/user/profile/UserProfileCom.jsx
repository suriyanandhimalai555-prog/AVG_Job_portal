import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCheck, FaSignOutAlt, FaUserEdit, FaUserPlus, FaUserCheck,
    FaEnvelope, FaTimes, FaPaperPlane, FaUsers, FaRegFileAlt,
    FaHeart, FaRegComment, FaThumbsUp, FaSignLanguage, FaHandHoldingHeart,
    FaLightbulb, FaLaughBeam, FaChevronLeft, FaChevronRight, FaRegCommentDots, FaShare
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Badge from '../../ui/Badge';
import Shimmer from '../../ui/Shimmer';

const UserProfileCom = () => {
    const navigate = useNavigate();
    const myPostsRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [profile, setProfile] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
        role: 'User',
        status: 'Active',
        followers: 0,
        following: 0
    });

    const [allUsers, setAllUsers] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [followingMap, setFollowingMap] = useState({});

    // Dynamic Stats State
    const [dashboardStats, setDashboardStats] = useState({ applied: 0, saved: 0 });

    // Theater Mode (Exact Post View) States
    const [expandedPost, setExpandedPost] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken') || '';

    // Reactions config for Theater Mode
    const reactions = [
        { type: 'like', Icon: FaThumbsUp, label: 'Like', color: 'text-blue-600', bgColor: 'bg-blue-600', textColor: 'text-white' },
        { type: 'celebrate', Icon: FaSignLanguage, label: 'Celebrate', color: 'text-green-600', bgColor: 'bg-green-600', textColor: 'text-white' },
        { type: 'support', Icon: FaHandHoldingHeart, label: 'Support', color: 'text-purple-500', bgColor: 'bg-purple-500', textColor: 'text-white' },
        { type: 'love', Icon: FaHeart, label: 'Love', color: 'text-red-500', bgColor: 'bg-red-500', textColor: 'text-white' },
        { type: 'insightful', Icon: FaLightbulb, label: 'Insightful', color: 'text-yellow-500', bgColor: 'bg-yellow-500', textColor: 'text-white' },
        { type: 'funny', Icon: FaLaughBeam, label: 'Funny', color: 'text-teal-500', bgColor: 'bg-teal-500', textColor: 'text-white' }
    ];

    const getReactionDetails = (reactionType) => {
        return reactions.find(r => r.type === reactionType) || reactions[0];
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Sync expanded post when userPosts updates (e.g., after commenting/liking)
    useEffect(() => {
        if (expandedPost) {
            const updated = userPosts.find(p => p.id === expandedPost.id);
            if (updated) setExpandedPost(updated);
        }
    }, [userPosts]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found.");

            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));

            // 1. ADMIN BLOCK (Prevent Admins from accessing User Dashboard)
            if (decodedPayload.role === 'Admin') {
                toast.error("Admins cannot access the User Dashboard.");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            const userId = decodedPayload.id;
            const headers = { 'Authorization': `Bearer ${token}` };

            const usersRes = await fetch(`${apiUrl}/api/users`, { headers }).catch(() => null);
            let currentUserName = '';

            if (usersRes && usersRes.ok) {
                const usersList = await usersRes.json();
                const currentUser = usersList.find(u => u.id === userId);

                if (currentUser) {
                    currentUserName = currentUser.full_name || currentUser.name || '';
                    setProfile(prev => ({
                        ...prev,
                        id: currentUser.id,
                        name: currentUserName,
                        email: currentUser.email || '',
                        phone: currentUser.phone || '',
                        role: currentUser.role || 'User',
                        status: currentUser.status || 'Active'
                    }));
                }
                setAllUsers(usersList.filter(u => u.id !== userId));
            }

            // Fetch Actual Follow Stats
            const statsRes = await fetch(`${apiUrl}/api/users/${userId}/follow-stats`, { headers }).catch(() => null);
            if (statsRes && statsRes.ok) {
                const statsData = await statsRes.json();
                setProfile(prev => ({
                    ...prev,
                    followers: statsData.followers_count || 0,
                    following: statsData.following_count || 0
                }));

                const fMap = {};
                if (statsData.following_ids) {
                    statsData.following_ids.forEach(id => fMap[id] = true);
                }
                setFollowingMap(fMap);
            }

            // 2. FETCH REAL COUNTS FOR JOBS
            try {
                const jobsRes = await fetch(`${apiUrl}/api/applications/my-applications`, { headers });
                let appliedCount = 0;
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    appliedCount = jobsData.length;
                }
                setDashboardStats({ applied: appliedCount, saved: 0 });
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }

            // Fetch User Posts
            fetchUserPostsOnly(userId, currentUserName, headers);

        } catch (error) {
            console.error("Fetch data error:", error);
            toast.error("Failed to load some profile details.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserPostsOnly = async (userId = profile.id, currentUserName = profile.name, headers = { 'Authorization': `Bearer ${getAuthToken()}` }) => {
        const postsRes = await fetch(`${apiUrl}/api/posts?userId=${userId}`, { headers }).catch(() => null);
        if (postsRes && postsRes.ok) {
            const postsData = await postsRes.json();
            if (Array.isArray(postsData)) {
                const myFilteredPosts = postsData.filter(p => p.user_id === userId || p.author_name === currentUserName);
                setUserPosts(myFilteredPosts);
            }
        }
    };

    const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

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

    const toggleFollow = async (targetUserId) => {
        const isFollowing = followingMap[targetUserId];
        // Optimistic UI Update
        setFollowingMap(prev => ({ ...prev, [targetUserId]: !isFollowing }));
        setProfile(p => ({
            ...p,
            following: isFollowing ? p.following - 1 : p.following + 1
        }));
        toast.success(isFollowing ? 'User unfollowed' : 'Following user!');

        try {
            const token = getAuthToken();
            await fetch(`${apiUrl}/api/users/${targetUserId}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ followerId: profile.id })
            });
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    // TRIGGER GLOBAL CHAT WIDGET VIA CUSTOM EVENT
    const openChat = (user) => {
        const event = new CustomEvent('open-global-chat', { detail: user });
        window.dispatchEvent(event);
    };

    // Theater Mode Handlers
    const getImagesArray = (post) => post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const submitComment = async (postId) => {
        if (!commentText.trim()) return;
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: profile.id, authorName: profile.name, content: commentText })
            });
            setCommentText('');
            fetchUserPostsOnly();
        } catch (e) { console.error(e); }
    };

    const handleReaction = async (postId, reactionType) => {
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: profile.id, reactionType })
            });
            fetchUserPostsOnly();
        } catch (e) { console.error(e); }
    };

    if (isLoading) {
        return (
            <div className="max-w-[1400px] mx-auto space-y-3 p-2 md:p-3 rounded-2xl bg-[#F5F6FC]">
                <Shimmer className="w-full h-64 rounded-2xl bg-gray-300" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <Shimmer className="h-28 rounded-2xl" />
                    <Shimmer className="h-28 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto p-2 md:p-3 rounded-2xl bg-[#F5F6FC] min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* LEFT COLUMN: Profile & Network */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="bg-white border border-[#E7E9F7] rounded-2xl p-4 md:p-5 shadow-[0_2px_16px_rgba(30,41,89,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                            <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
                        </div>

                        <div className="relative flex flex-col items-center text-center pt-9">
                            <div className="w-20 h-20 bg-white p-1.5 rounded-full shadow-xl mb-2.5 border border-white hover:scale-105 transition-transform duration-200">
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center text-2xl font-extrabold text-white shadow-inner">
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </div>

                            {!isEditing ? (
                                <>
                                    <h2 className="text-xl font-extrabold text-gray-900 mb-1">{profile.name}</h2>
                                    <p className="text-sm text-gray-500 font-medium mb-0.5">{profile.email}</p>
                                    <p className="text-sm text-gray-400 font-medium mb-2.5">{profile.phone}</p>

                                    <div className="flex gap-3 mb-3 bg-[#F5F6FC] px-4 py-2 rounded-xl border border-[#E7E9F7]">
                                        <div className="text-center">
                                            <span className="block text-lg font-black text-[#2A45C2]">{profile.followers}</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Followers</span>
                                        </div>
                                        <div className="w-px bg-[#E7E9F7]"></div>
                                        <div className="text-center">
                                            <span className="block text-lg font-black text-[#2A45C2]">{profile.following}</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Following</span>
                                        </div>
                                    </div>

                                    <Badge variant="success" className="px-3.5 py-1.5 text-xs font-bold gap-2 bg-[#EEF1FE] text-[#2A45C2] border-0 rounded-full shadow-sm mb-3">
                                        <FaCheck size={12} /> Profile {profile.status}
                                    </Badge>

                                    <div className="flex w-full gap-2.5 mt-1">
                                        <Button className="flex-1 py-2.5 text-sm font-bold rounded-xl border border-[#E7E9F7] text-gray-800 shadow-sm hover:border-[#2A45C2] hover:text-[#2A45C2] transition-all flex items-center justify-center gap-2" onClick={() => setIsEditing(true)}>
                                            <FaUserEdit /> Edit
                                        </Button>
                                        <Button variant="outline" onClick={handleLogout} className="flex-1 py-2.5 text-sm font-bold rounded-xl text-red-500 border-[#E7E9F7] bg-white hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm">
                                            <FaSignOutAlt /> Log out
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full space-y-3 text-left mt-2 bg-gray-50 p-3.5 rounded-2xl border border-[#E7E9F7]">
                                    <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2]" />
                                    <Input label="Email Address" name="email" type="email" value={profile.email} onChange={handleChange} className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2]" />
                                    <Input label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2]" />
                                    <div className="flex gap-2 pt-1.5">
                                        <Button className="flex-1 rounded-xl bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0 font-bold shadow-md" onClick={handleSave}>Save</Button>
                                        <Button variant="outline" className="flex-1 rounded-xl border-[#E7E9F7] text-gray-700 bg-white font-bold" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Applied', value: dashboardStats.applied, bar: 'from-[#2A45C2] to-[#5B4FE0]' },
                            { label: 'Saved', value: dashboardStats.saved, bar: 'from-[#D4A017] to-[#F2C14E]' }
                        ].map((stat, idx) => (
                            <div key={idx} className="relative bg-white border border-[#E7E9F7] rounded-2xl p-2.5 text-center shadow-[0_2px_16px_rgba(30,41,89,0.05)] overflow-hidden group hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(30,41,89,0.1)] transition-all">
                                <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${stat.bar} opacity-100`} />
                                <h3 className="text-xl font-black text-gray-900 mt-1 mb-0.5">{stat.value}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-[#E7E9F7] rounded-2xl p-4 shadow-[0_2px_16px_rgba(30,41,89,0.05)]">
                        <h3 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                            <FaUsers className="text-[#2A45C2]" /> Discover Network
                        </h3>
                        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {allUsers.length > 0 ? allUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[#E7E9F7] bg-[#F9FAFF] hover:border-[#2A45C2]/30 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center font-bold text-white shadow-sm">
                                            {(user.full_name || user.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{user.full_name || user.name}</h4>
                                            <p className="text-[11px] text-gray-500 font-medium">{user.role || 'Member'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => openChat(user)} className="w-8 h-8 rounded-full bg-white border border-[#E7E9F7] text-gray-500 flex items-center justify-center hover:text-[#2A45C2] hover:border-[#2A45C2] transition-colors shadow-sm" title="Message">
                                            <FaEnvelope size={12} />
                                        </button>
                                        <button onClick={() => toggleFollow(user.id)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${followingMap[user.id] ? 'bg-[#EEF1FE] text-[#2A45C2] border border-[#2A45C2]/30' : 'bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0'}`} title={followingMap[user.id] ? "Unfollow" : "Follow"}>
                                            {followingMap[user.id] ? <FaUserCheck size={12} /> : <FaUserPlus size={12} />}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 font-medium text-center py-4">No new users to discover.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Logged-in User's Posts Feed */}
                <div className="lg:col-span-8" ref={myPostsRef}>
                    <div className="bg-white border border-[#E7E9F7] rounded-2xl p-4 shadow-[0_2px_16px_rgba(30,41,89,0.05)] h-full">
                        <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-[#E7E9F7]">
                            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                <FaRegFileAlt className="text-[#2A45C2]" /> My Posts
                            </h2>
                            <Badge
                                variant="success"
                                className="bg-[#EEF1FE] text-[#2A45C2] border-0 rounded-full font-bold cursor-pointer hover:bg-[#D9E2FC] transition-colors"
                                onClick={() => myPostsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                {userPosts.length} Posts
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {userPosts.length > 0 ? userPosts.map(post => (
                                <div key={post.id} className="p-4 rounded-2xl border border-[#E7E9F7] bg-white hover:shadow-[0_6px_24px_rgba(30,41,89,0.08)] transition-all">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B4FE0] to-[#8B5CF6] flex items-center justify-center font-extrabold text-white shadow-md">
                                            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-gray-900 text-[15px]">{post.author_name || profile.name}</h4>
                                            <p className="text-xs text-gray-400 font-medium">{new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-700 font-medium leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

                                    {post.images && post.images.length > 0 && (
                                        <div className="rounded-xl overflow-hidden border border-[#E7E9F7] mb-3">
                                            <img src={post.images[0]} alt="Post content" className="w-full h-auto max-h-80 object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2.5 border-t border-[#E7E9F7]/60">
                                        <div className="flex gap-3">
                                            <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#e0245e] transition-colors bg-[#F5F6FC] px-3 py-1.5 rounded-lg">
                                                <FaHeart /> {post.likes_count || 0}
                                            </button>
                                            <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#2A45C2] transition-colors bg-[#F5F6FC] px-3 py-1.5 rounded-lg">
                                                <FaRegComment /> {post.comments_count || 0}
                                            </button>
                                        </div>
                                        {/* EXACT POST VIEW OPENER */}
                                        <button
                                            onClick={() => { setExpandedPost(post); setCurrentImageIndex(0); }}
                                            className="text-xs font-bold text-[#2A45C2] hover:underline hover:text-[#5B4FE0] transition-colors"
                                        >
                                            View Post
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 bg-[#F9FAFF] rounded-2xl border border-[#E7E9F7] border-dashed">
                                    <div className="w-14 h-14 mx-auto bg-[#EEF1FE] text-[#2A45C2] rounded-full flex items-center justify-center mb-2.5">
                                        <FaRegFileAlt size={22} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">You haven't posted anything yet</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-1">Share your thoughts from your dashboard feed to see them here!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* THEATER MODE MODAL FOR EXACT POST VIEW */}
            {expandedPost && (
                <div className="fixed inset-0 z-[120] flex bg-black/95 animate-fade-in flex-col md:flex-row">
                    <div className="flex-1 relative flex items-center justify-center h-[60vh] md:h-screen">
                        <button onClick={() => setExpandedPost(null)} className="absolute top-4 left-4 text-white p-2 bg-black/50 hover:bg-white/20 rounded-full transition-colors z-20">
                            <FaTimes size={20} />
                        </button>
                        {getImagesArray(expandedPost).length > 1 && (
                            <>
                                <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? getImagesArray(expandedPost).length - 1 : prev - 1)} className="absolute left-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 hidden md:block">
                                    <FaChevronLeft size={20} />
                                </button>
                                <button onClick={() => setCurrentImageIndex(prev => prev === getImagesArray(expandedPost).length - 1 ? 0 : prev + 1)} className="absolute right-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 hidden md:block">
                                    <FaChevronRight size={20} />
                                </button>
                            </>
                        )}
                        <img src={getImagesArray(expandedPost)[currentImageIndex]} className="max-w-full max-h-full object-contain" />
                    </div>

                    <div className="w-full md:w-[380px] lg:w-[450px] bg-white flex flex-col h-[40vh] md:h-screen overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 hidden md:flex">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-base shrink-0">
                                    {expandedPost.author_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{expandedPost.author_name}</h4>
                                    <p className="text-[11px] text-gray-500">{expandedPost.author_title || 'Platform Member'}</p>
                                </div>
                            </div>
                            <button onClick={() => setExpandedPost(null)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{expandedPost.content}</p>

                            <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-[11px] text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="bg-blue-50 text-blue-600 p-1 rounded-full"><FaThumbsUp size={10} /></div>
                                    <span>{expandedPost.likes_count}</span>
                                </div>
                                <div className="flex gap-3">
                                    <span>{expandedPost.comments_count} comments</span>
                                    <span>{expandedPost.share_count} shares</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-y border-gray-50 py-1 relative">
                                <button onClick={() => handleReaction(expandedPost.id, expandedPost.user_reaction ? expandedPost.user_reaction : 'like')} className={`flex items-center gap-2 font-bold text-[13px] flex-1 justify-center py-2.5 rounded-lg transition-colors ${expandedPost.user_reaction ? getReactionDetails(expandedPost.user_reaction).color : 'text-gray-500 hover:bg-gray-100'}`}>
                                    {expandedPost.user_reaction ? (
                                        <span className="text-lg">{getReactionDetails(expandedPost.user_reaction).Icon({})}</span>
                                    ) : (
                                        <FaThumbsUp className="text-lg" />
                                    )}
                                    <span className="capitalize">{expandedPost.user_reaction ? getReactionDetails(expandedPost.user_reaction).label : 'Like'}</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 font-bold text-[13px] hover:bg-gray-100 flex-1 justify-center py-2.5 rounded-lg transition-colors">
                                    <FaRegCommentDots className="text-[19px]" /> Comment
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors"
                                    onKeyDown={(e) => e.key === 'Enter' && submitComment(expandedPost.id)}
                                />
                                <button onClick={() => submitComment(expandedPost.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                                    <FaPaperPlane size={12} />
                                </button>
                            </div>

                            {expandedPost.comments_data && expandedPost.comments_data.length > 0 && (
                                <div className="pt-2">
                                    {expandedPost.comments_data.map(comment => (
                                        <div key={comment.id} className="mb-3 flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden mt-1">
                                                {comment.author_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl flex-1 shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-[13px] text-gray-900 block">{comment.author_name}</span>
                                                    <span className="text-[10px] text-gray-400 block">{formatTime(comment.created_at)}</span>
                                                </div>
                                                <span className="text-[13px] text-gray-700 mt-1 block leading-snug">{comment.content}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #F5F6FC; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A45C2; }
                .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default UserProfileCom;