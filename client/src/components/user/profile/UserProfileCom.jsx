import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCheck, FaSignOutAlt, FaUserEdit, FaUserPlus, FaUserCheck,
    FaEnvelope, FaTimes, FaPaperPlane, FaUsers, FaRegFileAlt,
    FaHeart, FaRegComment, FaThumbsUp, FaSignLanguage, FaHandHoldingHeart,
    FaLightbulb, FaLaughBeam, FaChevronLeft, FaChevronRight, FaRegCommentDots, FaCamera,
    FaLink, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaPen, FaShieldAlt, FaExternalLinkAlt
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Shimmer from '../../ui/Shimmer';
import UserEditProfilePopup from './UserEditProfilePopup';

const UserProfileCom = () => {
    const navigate = useNavigate();
    const myPostsRef = useRef(null);

    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingImage, setIsSavingImage] = useState(false);

    const [profile, setProfile] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
        role: 'User',
        status: 'Active',
        profile_picture: '',
        followers: 0,
        following: 0,
        pronouns: '',
        headline: '',
        position: '',
        industry: '',
        school: '',
        country: '',
        city: '',
        profileUrl: '',
        phoneType: 'Mobile',
        address: '',
        birthday: '',
        websiteUrl: '',
        websiteLinkText: ''
    });

    const [avatarBase64, setAvatarBase64] = useState(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [allUsers, setAllUsers] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [followingMap, setFollowingMap] = useState({});
    const [usersMap, setUsersMap] = useState({});
    const [expandedText, setExpandedText] = useState({});
    const [expandedPost, setExpandedPost] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');

    const [dashboardStats, setDashboardStats] = useState({ applied: 0, saved: 0 });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
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

                const uMap = {};
                usersList.forEach(u => {
                    if (u.id) uMap[u.id] = u.profile_picture || '';
                    if (u.full_name || u.name) uMap[u.full_name || u.name] = u.profile_picture || '';
                });
                setUsersMap(uMap);

                if (currentUser) {
                    currentUserName = currentUser.full_name || currentUser.name || '';
                    const formattedBirthday = currentUser.birthday ? currentUser.birthday.split('T')[0] : '';

                    setProfile(prev => ({
                        ...prev,
                        id: currentUser.id,
                        name: currentUserName,
                        email: currentUser.email || '',
                        phone: currentUser.phone || '',
                        role: currentUser.role || 'User',
                        status: currentUser.status || 'Active',
                        profile_picture: currentUser.profile_picture || '',
                        pronouns: currentUser.pronouns || '',
                        headline: currentUser.headline || '',
                        position: currentUser.position || '',
                        industry: currentUser.industry || '',
                        school: currentUser.school || '',
                        country: currentUser.country || '',
                        city: currentUser.city || '',
                        profileUrl: currentUser.profile_url || '',
                        phoneType: currentUser.phone_type || 'Mobile',
                        address: currentUser.address || '',
                        birthday: formattedBirthday,
                        websiteUrl: currentUser.website_url || '',
                        websiteLinkText: currentUser.website_link_text || ''
                    }));

                    const storedUserStr = localStorage.getItem('user');
                    if (storedUserStr) {
                        const storedUser = JSON.parse(storedUserStr);
                        if (storedUser.profile_picture !== currentUser.profile_picture) {
                            storedUser.profile_picture = currentUser.profile_picture || '';
                            localStorage.setItem('user', JSON.stringify(storedUser));
                            window.dispatchEvent(new Event('storage'));
                        }
                    }
                }

                const filteredUsers = usersList.filter(u => u.id !== userId && u.role?.toLowerCase() !== 'admin');
                setAllUsers(filteredUsers);
            }

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
            setTimeout(() => {
                setIsLoading(false);
            }, 400);
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

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropImageSrc(reader.result);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleEditExistingPhoto = () => {
        if (profile.profile_picture) {
            setCropImageSrc(profile.profile_picture);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        } else {
            document.getElementById('avatar-upload').click();
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const getCroppedImageBase64 = async (imageSrc, pixelCrop) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = imageSrc;
        await new Promise((resolve) => {
            image.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return canvas.toDataURL('image/jpeg', 0.9);
    };

    const handleCropSave = async () => {
        if (!cropImageSrc || !croppedAreaPixels) return;
        setIsSavingImage(true);
        try {
            const base64Image = await getCroppedImageBase64(cropImageSrc, croppedAreaPixels);
            setAvatarBase64(base64Image);
            setPreviewAvatarUrl(base64Image);
            setCropImageSrc(null);

            await handleAvatarSave(base64Image);
        } catch (e) {
            console.error("Crop error:", e);
            toast.error("Failed to crop image.");
        } finally {
            setIsSavingImage(false);
        }
    };

    const handleAvatarSave = async (base64Image) => {
        const loadingToast = toast.loading('Uploading new profile picture...');
        try {
            const token = getAuthToken();

            const payload = {
                profile_picture: base64Image
            };

            const res = await fetch(`${apiUrl}/api/users/${profile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update picture.');
            const updatedUser = await res.json();

            setProfile(prev => ({ ...prev, profile_picture: updatedUser.profile_picture }));
            setAvatarBase64(null);

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                storedUser.profile_picture = updatedUser.profile_picture;
                localStorage.setItem('user', JSON.stringify(storedUser));
                window.dispatchEvent(new Event('storage'));
            }
            toast.success('Profile picture updated successfully!', { id: loadingToast });
        } catch (error) {
            toast.error("Failed to update picture.", { id: loadingToast });
        }
    };

    const handleSaveProfile = async (updatedData) => {
        const loadingToast = toast.loading('Updating profile info...');
        try {
            const token = getAuthToken();

            const payload = {
                full_name: updatedData.name,
                email: updatedData.email,
                phone: updatedData.phone,
                role: profile.role,
                status: profile.status,
                profile_picture: profile.profile_picture,
                pronouns: updatedData.pronouns,
                headline: updatedData.headline,
                position: updatedData.position,
                industry: updatedData.industry,
                school: updatedData.school,
                country: updatedData.country,
                city: updatedData.city,
                profile_url: updatedData.profileUrl,
                phone_type: updatedData.phoneType,
                address: updatedData.address,
                birthday: updatedData.birthday,
                website_url: updatedData.websiteUrl,
                website_link_text: updatedData.websiteLinkText
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

            setProfile(prev => ({
                ...prev,
                ...updatedData
            }));

            setIsEditPopupOpen(false);
            toast.success('Profile updated successfully!', { id: loadingToast });

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                storedUser.fullName = updatedData.name;
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

    // --- FULL PAGE SHIMMER STATE ---
    if (isLoading) {
        return (
            <div className="max-w-[1400px] mx-auto p-2 md:p-6 min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-[#E7E9F7] rounded-3xl overflow-hidden shadow-sm h-[320px]">
                            <Shimmer className="w-full h-full bg-gray-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Shimmer className="h-24 rounded-2xl bg-gray-200" />
                            <Shimmer className="h-24 rounded-2xl bg-gray-200" />
                        </div>
                        <div className="bg-white border border-[#E7E9F7] rounded-3xl p-6 shadow-sm">
                            <Shimmer className="w-48 h-6 rounded bg-gray-200 mb-4" />
                            <Shimmer className="w-full h-40 rounded-xl bg-gray-200" />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-[#E7E9F7] rounded-3xl p-6 shadow-sm">
                            <Shimmer className="w-32 h-5 rounded bg-gray-200 mb-4" />
                            <Shimmer className="w-full h-16 rounded-xl bg-gray-200 mb-3" />
                            <Shimmer className="w-full h-16 rounded-xl bg-gray-200 mb-3" />
                            <Shimmer className="w-full h-16 rounded-xl bg-gray-200" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentDisplayAvatar = previewAvatarUrl || profile.profile_picture;
    const portfolioLink = profile.websiteUrl || profile.profileUrl;

    return (
        <div className="max-w-[1400px] mx-auto p-2 md:p-6 min-h-screen relative bg-gradient-to-b from-[#F5F6FC] to-[#EAEFFA]">
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 3500,
                    style: { background: '#fff', color: '#1f2937', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6', fontSize: '15px', fontWeight: '500' }
                }}
            />

            {/* INTEGRATE USER EDIT POPUP */}
            <UserEditProfilePopup
                isOpen={isEditPopupOpen}
                onClose={() => setIsEditPopupOpen(false)}
                profileData={profile}
                onSave={handleSaveProfile}
            />

            {/* --- CROPPER MODAL UI --- */}
            {cropImageSrc && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <h3 className="font-extrabold text-gray-900 text-lg">Crop Profile Picture</h3>
                            <button onClick={() => setCropImageSrc(null)} disabled={isSavingImage} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors disabled:opacity-50">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Cropper Container */}
                        <div className="relative w-full h-[350px] bg-gray-900">
                            <Cropper
                                image={cropImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        {/* Zoom Slider and Controls */}
                        <div className="p-6 bg-white space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-gray-500">Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="flex-1 accent-[#2A45C2] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setCropImageSrc(null)} disabled={isSavingImage} className="rounded-xl font-bold bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                    Cancel
                                </Button>
                                <Button disabled={isSavingImage} className="rounded-xl font-bold bg-[#2A45C2] text-white hover:bg-[#1a2b7a] disabled:opacity-50" onClick={handleCropSave}>
                                    {isSavingImage ? 'Saving...' : 'Apply & Save'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* --- LEFT MAIN COLUMN --- */}
                <div className="lg:col-span-8 space-y-6">

                    {/* CUSTOM DESIGN PROFILE CARD */}
                    <div className="bg-white border border-[#E7E9F7] rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_rgba(30,41,89,0.04)] relative overflow-hidden">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2A45C2]/10 to-[#5B4FE0]/5 rounded-bl-full pointer-events-none -z-0 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">

                            {/* Avatar Section */}
                            <div className="relative group shrink-0">
                                <div
                                    className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] bg-white rounded-full p-1.5 shadow-md border border-[#E7E9F7] transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                                    onClick={handleEditExistingPhoto}
                                    title="Click to edit profile picture"
                                >
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center text-5xl font-extrabold text-white shadow-inner relative">
                                        {currentDisplayAvatar ? (
                                            <img src={currentDisplayAvatar} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FaCamera size={24} />
                                        </div>
                                    </div>
                                </div>
                                <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 w-full pt-2">
                                <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4 mb-3">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                                            {profile.name}
                                            {profile.pronouns && <span className="text-sm font-bold text-[#2A45C2] bg-blue-50 px-2 py-0.5 rounded-lg">({profile.pronouns})</span>}
                                        </h1>

                                        {profile.headline && (
                                            <p className="text-base text-gray-700 font-bold mb-2 max-w-lg">
                                                {profile.headline}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons Container */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button onClick={() => setIsEditPopupOpen(true)} variant="outline" className="rounded-xl border-[#E7E9F7] text-[#2A45C2] font-bold hover:border-[#2A45C2] hover:bg-blue-50 flex items-center gap-2 py-2">
                                            <FaUserEdit /> Edit
                                        </Button>
                                    </div>
                                </div>

                                {/* Details Row (Location, Education, Position) */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mb-5">
                                    {(profile.city || profile.country) && (
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                                            <FaMapMarkerAlt className="text-[#2A45C2]" />
                                            {profile.city ? `${profile.city}, ` : ''}{profile.country}
                                        </div>
                                    )}
                                    {profile.school && (
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                                            <FaGraduationCap className="text-[#2A45C2]" />
                                            {profile.school}
                                        </div>
                                    )}
                                    {(profile.position || profile.industry) && (
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                                            <FaBriefcase className="text-[#2A45C2]" />
                                            {profile.position}{profile.position && profile.industry ? ' · ' : ''}{profile.industry}
                                        </div>
                                    )}
                                </div>

                                {/* Stats & Portfolio Integration */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div
                                        className="bg-[#F5F6FC] hover:bg-[#EEF1FE] transition-colors rounded-xl px-4 py-2 cursor-pointer border border-[#E7E9F7] flex items-center gap-2 shadow-sm"
                                        onClick={() => navigate('/user-dashboard/my-network', { state: { activeTab: 'followers' } })}
                                    >
                                        <span className="text-lg font-black text-[#2A45C2]">{profile.followers}</span>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Followers</span>
                                    </div>

                                    <div
                                        className="bg-[#F5F6FC] hover:bg-[#EEF1FE] transition-colors rounded-xl px-4 py-2 cursor-pointer border border-[#E7E9F7] flex items-center gap-2 shadow-sm"
                                        onClick={() => navigate('/user-dashboard/my-network', { state: { activeTab: 'following' } })}
                                    >
                                        <span className="text-lg font-black text-[#2A45C2]">{profile.following}</span>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Following</span>
                                    </div>

                                    {/* Prominent Portfolio Button */}
                                    {portfolioLink && (
                                        <a
                                            href={portfolioLink.startsWith('http') ? portfolioLink : `https://${portfolioLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white hover:shadow-md hover:-translate-y-0.5 transition-all rounded-xl px-4 py-2 flex items-center gap-2 font-bold text-sm shadow-sm"
                                            title={portfolioLink}
                                        >
                                            <FaLink size={12} /> {portfolioLink.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Total Applications', value: dashboardStats.applied, color: 'text-[#2A45C2]', border: 'border-[#2A45C2]/30', bg: 'bg-[#EEF1FE]' },
                            { label: 'Saved Jobs', value: dashboardStats.saved, color: 'text-[#2A45C2]', border: 'border-[#2A45C2]/30', bg: 'bg-white' }
                        ].map((stat, idx) => (
                            <div key={idx} className={`bg-white border ${stat.border} rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4`}>
                                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center font-black text-2xl shrink-0 border border-[#2A45C2]/10`}>
                                    {stat.value}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-xl font-black text-gray-900 mt-0.5">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MY POSTS / ACTIVITY SECTION */}
                    <div className="bg-white border border-[#E7E9F7] rounded-3xl shadow-sm overflow-hidden" ref={myPostsRef}>

                        {/* Blue Brand Header to reduce whitespace */}
                        <div className="bg-gradient-to-r from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                                    <FaRegFileAlt /> Activity & Posts
                                </h2>
                                <p className="text-sm text-blue-100 font-medium mt-0.5">Keep your network updated with your latest insights.</p>
                            </div>
                            <Button
                                onClick={() => navigate('/user-dashboard')}
                                className="bg-white text-[#2A45C2] hover:bg-gray-50 font-bold rounded-xl whitespace-nowrap shadow-sm"
                            >
                                Create a Post
                            </Button>
                        </div>

                        <div className="p-6 md:p-8 space-y-4">
                            {userPosts.length > 0 ? userPosts.map(post => {
                                const isLongText = post.content && (post.content.length > 250 || post.content.split('\n').length > 5);
                                const isExpanded = expandedText[post.id];

                                return (
                                    <div key={post.id} className="p-5 rounded-2xl border border-[#E7E9F7] bg-[#F9FAFF] hover:border-[#2A45C2]/30 transition-all hover:bg-white group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B4FE0] to-[#8B5CF6] flex items-center justify-center font-extrabold text-white shadow-sm overflow-hidden">
                                                {profile.profile_picture ? (
                                                    <img src={profile.profile_picture} alt={profile.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#2A45C2] transition-colors">{post.author_name || profile.name}</h4>
                                                <p className="text-[11px] text-gray-500 font-medium">{new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className={`text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap ${!isExpanded && isLongText ? 'line-clamp-4' : ''}`}>
                                                {post.content}
                                            </div>
                                            {isLongText && (
                                                <button
                                                    onClick={() => setExpandedText(prev => ({ ...prev, [post.id]: !isExpanded }))}
                                                    className="text-[#2A45C2] hover:text-[#5B4FE0] text-xs font-bold mt-1.5 transition-colors"
                                                >
                                                    {isExpanded ? 'Show less' : 'Read more'}
                                                </button>
                                            )}
                                        </div>

                                        {post.images && post.images.length > 0 && (
                                            <div className="rounded-xl overflow-hidden border border-[#E7E9F7] mb-4">
                                                <img src={post.images[0]} alt="Post content" className="w-full h-auto max-h-80 object-cover" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                            <div className="flex gap-2">
                                                <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                    <FaThumbsUp size={12} /> {post.likes_count || 0}
                                                </button>
                                                <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                    <FaRegCommentDots size={14} /> {post.comments_count || 0}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => { setExpandedPost(post); setCurrentImageIndex(0); }}
                                                className="text-xs font-bold text-gray-500 hover:text-[#2A45C2] transition-colors"
                                            >
                                                Expand Post &rarr;
                                            </button>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-[#E7E9F7] border-dashed">
                                    <div className="w-16 h-16 mx-auto bg-blue-50 shadow-sm text-[#2A45C2] rounded-full flex items-center justify-center mb-3 border border-blue-100">
                                        <FaRegFileAlt size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900">No recent activity</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-1">Start sharing updates to build your professional presence.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDEBAR COLUMN --- */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Discover Network (Who to follow) */}
                    <div className="bg-white border border-[#E7E9F7] rounded-3xl shadow-sm overflow-hidden">

                        {/* Blue Brand Header to reduce whitespace */}
                        <div className="bg-[#2A45C2] px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                <FaUsers /> Build Network
                            </h3>
                        </div>

                        <div className="p-6 space-y-3 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                            {allUsers.length > 0 ? allUsers.slice(0, 6).map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-[#E7E9F7] hover:bg-blue-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center font-bold text-white shadow-sm overflow-hidden shrink-0 cursor-pointer">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt={user.full_name || user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                (user.full_name || user.name || 'U').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#2A45C2] cursor-pointer line-clamp-1 transition-colors">{user.full_name || user.name}</h4>
                                            <p className="text-[11px] text-gray-500 font-medium line-clamp-1">{user.headline || user.role || 'Platform Member'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openChat(user)} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:text-[#2A45C2] hover:border-[#2A45C2] transition-colors shadow-sm" title="Message">
                                            <FaEnvelope size={12} />
                                        </button>
                                        <button onClick={() => toggleFollow(user.id)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${followingMap[user.id] ? 'bg-[#EEF1FE] text-[#2A45C2] border border-[#2A45C2]/30' : 'bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0'}`} title={followingMap[user.id] ? "Unfollow" : "Follow"}>
                                            {followingMap[user.id] ? <FaCheck size={12} /> : <FaPlus size={12} />}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 font-medium text-center py-4">Network search clear.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* THEATER MODE MODAL REMAINS UNCHANGED */}
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
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-50 transition-colors"
                                        onKeyDown={(e) => e.key === 'Enter' && submitComment(expandedPost.id)}
                                    />
                                    <button onClick={() => submitComment(expandedPost.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                                        <FaPaperPlane size={12} />
                                    </button>
                                </div>

                                {expandedPost.comments_data && expandedPost.comments_data.length > 0 && (() => {
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

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
            `}</style>
        </div>
    );
};

export default UserProfileCom;