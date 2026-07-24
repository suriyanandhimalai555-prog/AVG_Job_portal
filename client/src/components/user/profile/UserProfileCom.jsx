import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCheck, FaSignOutAlt, FaUserEdit, FaUserPlus, FaUserCheck,
    FaEnvelope, FaTimes, FaPaperPlane, FaUsers, FaRegFileAlt,
    FaHeart, FaRegComment, FaThumbsUp, FaSignLanguage, FaHandHoldingHeart,
    FaLightbulb, FaLaughBeam, FaChevronLeft, FaChevronRight, FaRegCommentDots, FaCamera
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
        profile_picture: '',
        followers: 0,
        following: 0
    });

    const [avatarBase64, setAvatarBase64] = useState(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);

    const [allUsers, setAllUsers] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [followingMap, setFollowingMap] = useState({});
    
    // Users Map for quick profile picture lookups
    const [usersMap, setUsersMap] = useState({});

    // Read More State
    const [expandedText, setExpandedText] = useState({});

    // Dynamic Stats State
    const [dashboardStats, setDashboardStats] = useState({ applied: 0, saved: 0 });

    // Theater Mode States
    const [expandedPost, setExpandedPost] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken') || '';

    const reactions = [
        { type: 'like', Icon: FaThumbsUp, label: 'Like', color: 'text-blue-600', bgColor: 'bg-blue-600', textColor: 'text-white' },
        { type: 'celebrate', Icon: FaSignLanguage, label: 'Celebrate', color: 'text-green-600', bgColor: 'bg-green-600', textColor: 'text-white' },
        { type: 'support', Icon: FaHandHoldingHeart, label: 'Support', color: 'text-purple-500', bgColor: 'bg-purple-500', textColor: 'text-white' },
        { type: 'love', Icon: FaHeart, label: 'Love', color: 'text-red-500', bgColor: 'bg-red-500', textColor: 'text-white' },
        { type: 'insightful', Icon: FaLightbulb, label: 'Insightful', color: 'text-yellow-500', bgColor: 'bg-yellow-500', textColor: 'text-white' },
        { type: 'funny', Icon: FaLaughBeam, label: 'Funny', color: 'text-teal-500', bgColor: 'bg-teal-500', textColor: 'text-white' }
    ];

    const getReactionDetails = (reactionType) => reactions.find(r => r.type === reactionType) || reactions[0];

    useEffect(() => {
        fetchInitialData();
    }, []);

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

                // Setup the Users Map to correctly show pictures in comments
                const uMap = {};
                usersList.forEach(u => {
                    if (u.id) uMap[u.id] = u.profile_picture || '';
                    if (u.full_name || u.name) uMap[u.full_name || u.name] = u.profile_picture || '';
                });
                setUsersMap(uMap);

                if (currentUser) {
                    currentUserName = currentUser.full_name || currentUser.name || '';
                    setProfile(prev => ({
                        ...prev,
                        id: currentUser.id,
                        name: currentUserName,
                        email: currentUser.email || '',
                        phone: currentUser.phone || '',
                        role: currentUser.role || 'User',
                        status: currentUser.status || 'Active',
                        profile_picture: currentUser.profile_picture || ''
                    }));

                    // Force sync local storage so other components (PostCom, Navbar) instantly get the picture
                    const storedUserStr = localStorage.getItem('user');
                    if (storedUserStr) {
                        const storedUser = JSON.parse(storedUserStr);
                        if (storedUser.profile_picture !== currentUser.profile_picture) {
                            storedUser.profile_picture = currentUser.profile_picture || '';
                            localStorage.setItem('user', JSON.stringify(storedUser));
                            window.dispatchEvent(new Event('storage')); // Triggers re-render in Navbar and PostCom
                        }
                    }
                }

                // EXPLICITLY REMOVE ADMINS AND CURRENT USER FROM DISCOVER NETWORK
                const filteredUsers = usersList.filter(u => u.id !== userId && u.role?.toLowerCase() !== 'admin');
                setAllUsers(filteredUsers);
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

            // Fetch Applications Count
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

            fetchUserPostsOnly(userId, currentUserName, headers);

        } catch (error) {
            console.error("Fetch data error:", error);
            toast.error("Failed to load profile details.");
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

    // Handle Image File selection via Base64 FileReader (no Multer flow)
    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarBase64(reader.result);
                setPreviewAvatarUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!profile.name || !profile.email || !profile.phone) {
            toast.error("All fields are required.");
            return;
        }
        const loadingToast = toast.loading('Updating profile...');
        try {
            const token = getAuthToken();

            const payload = {
                full_name: profile.name,
                email: profile.email,
                phone: profile.phone,
                role: profile.role,
                status: profile.status,
                profile_picture: avatarBase64 || profile.profile_picture
            };

            const res = await fetch(`${apiUrl}/api/users/${profile.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update profile.');
            const updatedUser = await res.json();

            setProfile(prev => ({
                ...prev,
                profile_picture: updatedUser.profile_picture || prev.profile_picture
            }));
            setAvatarBase64(null);
            setPreviewAvatarUrl(null);
            setIsEditing(false);

            toast.success('Profile updated successfully!', { id: loadingToast });

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                storedUser.fullName = profile.name;
                storedUser.profile_picture = updatedUser.profile_picture || profile.profile_picture;
                localStorage.setItem('user', JSON.stringify(storedUser));
                window.dispatchEvent(new Event('storage'));
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

    const openChat = (user) => {
        const event = new CustomEvent('open-global-chat', { detail: user });
        window.dispatchEvent(event);
    };

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

    const currentDisplayAvatar = previewAvatarUrl || profile.profile_picture;

    return (
        <div className="max-w-[1400px] mx-auto p-2 md:p-3 rounded-2xl bg-[#F5F6FC] min-h-screen">
            {/* STYLED TOASTER TO MATCH SCREENSHOT DESIGN */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: '#fff',
                        color: '#1f2937',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                        border: '1px solid #f3f4f6',
                        fontSize: '15px',
                        fontWeight: '500'
                    },
                    success: {
                        iconTheme: {
                            primary: '#4ade80',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* LEFT COLUMN: Profile & Network */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="bg-white border border-[#E7E9F7] rounded-2xl p-4 md:p-5 shadow-[0_2px_16px_rgba(30,41,89,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                        </div>

                        <div className="relative flex flex-col items-center text-center pt-9">
                            {/* PROFILE PICTURE WITH BASE64 S3 UPLOAD HOVER OVERLAY */}
                            <div className="relative group mb-2.5">
                                <div className="w-20 h-20 bg-white p-1 rounded-full shadow-xl border border-white hover:scale-105 transition-transform duration-200 overflow-hidden relative">
                                    {currentDisplayAvatar ? (
                                        <img src={currentDisplayAvatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center text-2xl font-extrabold text-white shadow-inner">
                                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FaCamera size={18} />
                                        </label>
                                    )}
                                </div>
                                {isEditing && (
                                    <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                                )}
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
                                    <p className="text-xs text-gray-500 font-medium text-center">Click avatar photo above to change image</p>
                                    <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2]" />
                                    <Input label="Email Address" name="email" type="email" value={profile.email} onChange={handleChange} className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2]" />
                                    <Input label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} className="bg-white border-[#EBEBEB] rounded-xl focus:ring-[#2A45C2]/20 focus:border-[#2A45C2]" />
                                    <div className="flex gap-2 pt-1.5">
                                        <Button className="flex-1 rounded-xl bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0 font-bold shadow-md" onClick={handleSave}>Save</Button>
                                        <Button variant="outline" className="flex-1 rounded-xl border-[#E7E9F7] text-gray-700 bg-white font-bold" onClick={() => { setIsEditing(false); setPreviewAvatarUrl(null); setAvatarBase64(null); }}>Cancel</Button>
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
                            <div key={idx} className="relative bg-white border border-[#E7E9F7] rounded-2xl p-2.5 text-center shadow-[0_2px_16px_rgba(30,41,89,0.05)] overflow-hidden group hover:-translate-y-0.5 transition-all">
                                <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${stat.bar} opacity-100`} />
                                <h3 className="text-xl font-black text-gray-900 mt-1 mb-0.5">{stat.value}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* DISCOVER NETWORK (EXCLUDES ADMIN USERS) */}
                    <div className="bg-white border border-[#E7E9F7] rounded-2xl p-4 shadow-[0_2px_16px_rgba(30,41,89,0.05)]">
                        <h3 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                            <FaUsers className="text-[#2A45C2]" /> Discover Network
                        </h3>
                        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {allUsers.length > 0 ? allUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[#E7E9F7] bg-[#F9FAFF] hover:border-[#2A45C2]/30 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center font-bold text-white shadow-sm overflow-hidden">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt={user.full_name || user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                (user.full_name || user.name || 'U').charAt(0).toUpperCase()
                                            )}
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
                            {userPosts.length > 0 ? userPosts.map(post => {
                                const isLongText = post.content && (post.content.length > 250 || post.content.split('\n').length > 5);
                                const isExpanded = expandedText[post.id];

                                return (
                                    <div key={post.id} className="p-4 rounded-2xl border border-[#E7E9F7] bg-white hover:shadow-[0_6px_24px_rgba(30,41,89,0.08)] transition-all">
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B4FE0] to-[#8B5CF6] flex items-center justify-center font-extrabold text-white shadow-md overflow-hidden">
                                                {profile.profile_picture ? (
                                                    <img src={profile.profile_picture} alt={profile.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-gray-900 text-[15px]">{post.author_name || profile.name}</h4>
                                                <p className="text-xs text-gray-400 font-medium">{new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className={`text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap ${!isExpanded && isLongText ? 'line-clamp-5' : ''}`}>
                                                {post.content}
                                            </div>
                                            {isLongText && (
                                                <button
                                                    onClick={() => setExpandedText(prev => ({ ...prev, [post.id]: !isExpanded }))}
                                                    className="text-gray-500 hover:text-gray-800 text-sm font-semibold mt-1 transition-colors"
                                                >
                                                    {isExpanded ? '...see less' : '...see more'}
                                                </button>
                                            )}
                                        </div>

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
                                            <button
                                                onClick={() => { setExpandedPost(post); setCurrentImageIndex(0); }}
                                                className="text-xs font-bold text-[#2A45C2] hover:underline hover:text-[#5B4FE0] transition-colors"
                                            >
                                                View Post
                                            </button>
                                        </div>
                                    </div>
                                )
                            }) : (
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
            {expandedPost && (() => {
                const isLongText = expandedPost.content && (expandedPost.content.length > 250 || expandedPost.content.split('\n').length > 5);
                const isExpanded = expandedText[`theater_${expandedPost.id}`];

                return (
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
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                                        {profile.profile_picture ? (
                                            <img src={profile.profile_picture} alt={expandedPost.author_name} className="w-full h-full object-cover" />
                                        ) : (
                                            expandedPost.author_name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        {/* MESSAGE BUTTON IN THEATER MODE */}
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900 text-sm">{expandedPost.author_name}</h4>
                                            {expandedPost.user_id !== profile.id && (
                                                <button
                                                    onClick={() => handleOpenChat(expandedPost)}
                                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-[#EEF1FE] hover:text-[#2A45C2] transition-colors flex items-center gap-1"
                                                    title={`Message ${expandedPost.author_name}`}
                                                >
                                                    <FaEnvelope size={10} /> Message
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500">{expandedPost.author_title || 'Platform Member'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setExpandedPost(null)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div>
                                    <div className={`text-sm text-gray-800 whitespace-pre-wrap ${!isExpanded && isLongText ? 'line-clamp-5' : ''}`}>
                                        {expandedPost.content}
                                    </div>
                                    {isLongText && (
                                        <button
                                            onClick={() => setExpandedText(prev => ({ ...prev, [`theater_${expandedPost.id}`]: !isExpanded }))}
                                            className="text-gray-500 hover:text-gray-800 text-sm font-semibold mt-1 transition-colors"
                                        >
                                            {isExpanded ? '...see less' : '...see more'}
                                        </button>
                                    )}
                                </div>

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
                                        {profile.profile_picture ? (
                                            <img src={profile.profile_picture} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
                                        )}
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

                                {expandedPost.comments_data && expandedPost.comments_data.length > 0 && (() => {
                                    // Ensure latest comments appear on top
                                    const sortedComments = [...expandedPost.comments_data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                                    return (
                                        <div className="pt-2">
                                            {sortedComments.map(comment => {
                                                const commentPic = comment.profile_picture || comment.author_profile_picture || usersMap[comment.user_id] || usersMap[comment.author_name] || (comment.author_name === profile.name ? profile.profile_picture : null);

                                                return (
                                                    <div key={comment.id} className="mb-3 flex gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden mt-1">
                                                            {commentPic ? (
                                                                <img src={commentPic} alt={comment.author_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                comment.author_name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="bg-gray-50 p-3 rounded-xl flex-1 shadow-sm">
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-bold text-[13px] text-gray-900 block">{comment.author_name}</span>
                                                                <span className="text-[10px] text-gray-400 block">{formatTime(comment.created_at)}</span>
                                                            </div>
                                                            <span className="text-[13px] text-gray-700 mt-1 block leading-snug">{comment.content}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default UserProfileCom;