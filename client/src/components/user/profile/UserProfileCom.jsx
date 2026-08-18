import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaCheck, FaSignOutAlt, FaUserEdit, FaUserPlus, FaUserCheck,
    FaEnvelope, FaTimes, FaPaperPlane, FaUsers, FaRegFileAlt,
    FaHeart, FaRegComment, FaThumbsUp, FaSignLanguage, FaHandHoldingHeart,
    FaLightbulb, FaLaughBeam, FaChevronLeft, FaChevronRight, FaRegCommentDots, FaCamera,
    FaLink, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaPen, FaSpinner, FaPlus
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import Button from '../../ui/Button';
import Shimmer from '../../ui/Shimmer';
import UserEditProfilePopup from './UserEditProfilePopup';

const UserProfileCom = () => {
    const navigate = useNavigate();
    const { userId: routeUserId } = useParams();
    const myPostsRef = useRef(null);

    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingImage, setIsSavingImage] = useState(false);
    const [timestamp, setTimestamp] = useState(Date.now()); // Cache busting

    const [isOwnProfile, setIsOwnProfile] = useState(true);
    const [authUserId, setAuthUserId] = useState(null);

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
        websiteUrl: ''
    });

    const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [editorTab, setEditorTab] = useState('crop');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [imageFilter, setImageFilter] = useState('none');
    const [imageFrame, setImageFrame] = useState('none');
    const [adjustments, setAdjustments] = useState({ brightness: 100, contrast: 100, saturation: 100 });

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
        { type: 'like', Icon: FaThumbsUp, label: 'Like', color: 'text-blue-600' },
        { type: 'celebrate', Icon: FaSignLanguage, label: 'Celebrate', color: 'text-green-600' },
        { type: 'support', Icon: FaHandHoldingHeart, label: 'Support', color: 'text-purple-500' },
        { type: 'love', Icon: FaHeart, label: 'Love', color: 'text-red-500' },
        { type: 'insightful', Icon: FaLightbulb, label: 'Insightful', color: 'text-yellow-500' },
        { type: 'funny', Icon: FaLaughBeam, label: 'Funny', color: 'text-teal-500' }
    ];

    const getReactionDetails = (reactionType) => reactions.find(r => r.type === reactionType) || reactions[0];

    useEffect(() => {
        fetchInitialData();
        window.scrollTo(0, 0);
    }, [routeUserId]);

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

            const loggedInId = decodedPayload.id;
            setAuthUserId(loggedInId);

            const targetId = routeUserId || loggedInId;
            const isSelf = String(targetId) === String(loggedInId);
            setIsOwnProfile(isSelf);

            const headers = { 'Authorization': `Bearer ${token}` };
            const usersRes = await fetch(`${apiUrl}/api/users`, { headers }).catch(() => null);
            let targetUserName = '';

            if (usersRes && usersRes.ok) {
                const usersList = await usersRes.json();

                const uMap = {};
                usersList.forEach(u => {
                    if (u.id) uMap[u.id] = u.profile_picture || '';
                    if (u.full_name || u.name) uMap[u.full_name || u.name] = u.profile_picture || '';
                });
                setUsersMap(uMap);

                const targetUser = usersList.find(u => String(u.id) === String(targetId));

                if (targetUser) {
                    targetUserName = targetUser.full_name || targetUser.name || '';
                    const formattedBirthday = targetUser.birthday ? targetUser.birthday.split('T')[0] : '';

                    setProfile(prev => ({
                        ...prev,
                        id: targetUser.id,
                        name: targetUserName,
                        email: targetUser.email || '',
                        phone: targetUser.phone || '',
                        role: targetUser.role || 'User',
                        status: targetUser.status || 'Active',
                        profile_picture: targetUser.profile_picture || '',
                        pronouns: targetUser.pronouns || '',
                        headline: targetUser.headline || '',
                        position: targetUser.position || '',
                        industry: targetUser.industry || '',
                        school: targetUser.school || '',
                        country: targetUser.country || '',
                        city: targetUser.city || '',
                        profileUrl: targetUser.profile_url || '',
                        phoneType: targetUser.phone_type || 'Mobile',
                        address: targetUser.address || '',
                        birthday: formattedBirthday,
                        websiteUrl: targetUser.website_url || ''
                    }));

                    if (isSelf) {
                        const storedUserStr = localStorage.getItem('user');
                        if (storedUserStr) {
                            const storedUser = JSON.parse(storedUserStr);
                            if (storedUser.profile_picture !== targetUser.profile_picture) {
                                storedUser.profile_picture = targetUser.profile_picture || '';
                                localStorage.setItem('user', JSON.stringify(storedUser));
                                window.dispatchEvent(new Event('storage'));
                            }
                        }
                    }
                } else {
                    toast.error("User profile not found.");
                    navigate('/user-dashboard');
                    return;
                }

                const filteredUsers = usersList.filter(u => String(u.id) !== String(loggedInId) && u.role?.toLowerCase() !== 'admin');
                setAllUsers(filteredUsers);
            }

            const targetStatsRes = await fetch(`${apiUrl}/api/users/${targetId}/follow-stats`, { headers }).catch(() => null);
            if (targetStatsRes && targetStatsRes.ok) {
                const statsData = await targetStatsRes.json();
                setProfile(prev => ({
                    ...prev,
                    followers: statsData.followers_count || 0,
                    following: statsData.following_count || 0
                }));
            }

            const authStatsRes = await fetch(`${apiUrl}/api/users/${loggedInId}/follow-stats`, { headers }).catch(() => null);
            if (authStatsRes && authStatsRes.ok) {
                const authStatsData = await authStatsRes.json();
                const fMap = {};
                if (authStatsData.following_ids) authStatsData.following_ids.forEach(id => fMap[id] = true);
                setFollowingMap(fMap);
            }

            if (isSelf) {
                try {
                    const jobsRes = await fetch(`${apiUrl}/api/applications/my-applications`, { headers });
                    let appliedCount = 0;
                    if (jobsRes.ok) appliedCount = (await jobsRes.json()).length;
                    setDashboardStats({ applied: appliedCount, saved: 0 });
                } catch (err) { }
            }

            fetchUserPostsOnly(targetId, targetUserName, headers);

        } catch (error) {
            toast.error("Failed to load profile details.");
        } finally {
            setTimeout(() => setIsLoading(false), 400);
        }
    };

    const fetchUserPostsOnly = async (userId, currentUserName, headers) => {
        const postsRes = await fetch(`${apiUrl}/api/posts?userId=${userId}`, { headers }).catch(() => null);
        if (postsRes && postsRes.ok) {
            const postsData = await postsRes.json();
            if (Array.isArray(postsData)) {
                setUserPosts(postsData.filter(p => String(p.user_id) === String(userId) || p.author_name === currentUserName));
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
                setRotation(0);
                setImageFilter('none');
                setImageFrame('none');
                setAdjustments({ brightness: 100, contrast: 100, saturation: 100 });
                setEditorTab('crop');
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleEditExistingPhoto = async () => {
        if (!isOwnProfile) return;
        if (profile.profile_picture) {
            const toastId = toast.loading("Preparing editor...");
            try {
                // Fetch through proxy so the Canvas can load the image without S3 CORS blocks
                const proxyUrl = `${apiUrl}/api/users/proxy-image?url=${encodeURIComponent(profile.profile_picture)}`;
                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error("Proxy load failed");
                const blob = await response.blob();
                const localBlobUrl = URL.createObjectURL(blob);

                setCropImageSrc(localBlobUrl);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
                setImageFilter('none');
                setImageFrame('none');
                setAdjustments({ brightness: 100, contrast: 100, saturation: 100 });
                setEditorTab('crop');
            } catch (error) {
                console.error("Editor load error:", error);
                document.getElementById('avatar-upload').click();
            } finally {
                toast.dismiss(toastId);
            }
        } else {
            document.getElementById('avatar-upload').click();
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const getFilterCSSString = () => {
        let str = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
        if (imageFilter === 'grayscale') str += ' grayscale(100%)';
        if (imageFilter === 'sepia') str += ' sepia(100%)';
        if (imageFilter === 'vintage') str += ' sepia(50%) contrast(120%) saturate(120%)';
        if (imageFilter === 'cool') str += ' hue-rotate(180deg) saturate(150%)';
        if (imageFilter === 'warm') str += ' sepia(30%) saturate(150%)';
        return str;
    };

    const generateFinalCompositedImage = async (imageSrc, pixelCrop) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = imageSrc;

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        ctx.filter = getFilterCSSString();
        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-200, -200);
        ctx.drawImage(
            image,
            pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
            0, 0, 400, 400
        );
        ctx.restore();
        ctx.filter = 'none';

        if (imageFrame === 'openToWork' || imageFrame === 'hiring') {
            const isHiring = imageFrame === 'hiring';
            const frameColor = isHiring ? '#8B5CF6' : '#218B53';
            const frameText = isHiring ? '#HIRING' : '#OPENTOWORK';

            ctx.beginPath();
            ctx.arc(200, 200, 180, 0, Math.PI, false);
            ctx.lineWidth = 40;
            ctx.strokeStyle = frameColor;
            ctx.stroke();

            ctx.font = '900 24px Arial, sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(frameText, 200, 380);
        }

        return canvas.toDataURL('image/jpeg', 0.95);
    };

    const handleCropSave = async () => {
        if (!cropImageSrc || !croppedAreaPixels) return;
        setIsSavingImage(true);
        const loadingToast = toast.loading('Saving and applying filters...');

        try {
            const finalBase64Image = await generateFinalCompositedImage(cropImageSrc, croppedAreaPixels);
            const token = getAuthToken();

            // ONLY send the profile picture. Database dynamic query will leave other fields untouched.
            const payload = {
                profile_picture: finalBase64Image
            };

            const res = await fetch(`${apiUrl}/api/users/${profile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update picture.');
            const updatedUser = await res.json();

            setPreviewAvatarUrl(updatedUser.profile_picture);
            setProfile(prev => ({ ...prev, profile_picture: updatedUser.profile_picture }));
            setTimestamp(Date.now()); // Cache burst

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                storedUser.profile_picture = updatedUser.profile_picture;
                localStorage.setItem('user', JSON.stringify(storedUser));
                window.dispatchEvent(new Event('storage'));
            }

            setCropImageSrc(null);
            toast.success('Profile picture updated successfully!', { id: loadingToast });
        } catch (error) {
            toast.error("Unable to update profile picture. Please try again.", { id: loadingToast });
        } finally {
            setIsSavingImage(false);
        }
    };

    const closeEditor = () => {
        if (!isSavingImage) {
            setCropImageSrc(null);
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
                website_url: updatedData.websiteUrl
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

            setProfile(prev => ({ ...prev, ...updatedData }));
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

    const toggleFollow = async (targetUserId) => {
        const isFollowing = followingMap[targetUserId];
        setFollowingMap(prev => ({ ...prev, [targetUserId]: !isFollowing }));

        if (String(profile.id) === String(targetUserId)) {
            setProfile(p => ({
                ...p,
                followers: isFollowing ? p.followers - 1 : p.followers + 1
            }));
        }

        toast.success(isFollowing ? 'User unfollowed' : 'Following user!');

        try {
            const token = getAuthToken();
            await fetch(`${apiUrl}/api/users/${targetUserId}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ followerId: authUserId })
            });
        } catch (err) { }
    };

    const openChat = (user) => {
        const targetChatUser = {
            id: user.id,
            name: user.full_name || user.name,
            role: user.role,
            profile_picture: user.profile_picture
        };
        const event = new CustomEvent('open-global-chat', { detail: targetChatUser });
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
                body: JSON.stringify({ userId: authUserId, authorName: profile.name, content: commentText })
            });
            setCommentText('');
            fetchUserPostsOnly(profile.id, profile.name, { 'Authorization': `Bearer ${getAuthToken()}` });
        } catch (e) { console.error(e); }
    };

    const handleReaction = async (postId, reactionType) => {
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: authUserId, reactionType })
            });
            fetchUserPostsOnly(profile.id, profile.name, { 'Authorization': `Bearer ${getAuthToken()}` });
        } catch (e) { console.error(e); }
    };

    if (isLoading) {
        return (
            <div className="max-w-[1200px] mx-auto p-4 md:p-8 min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <Shimmer className="w-full h-[280px] rounded-3xl bg-gray-200" />
                        <div className="grid grid-cols-2 gap-4">
                            <Shimmer className="h-24 rounded-3xl bg-gray-200" />
                            <Shimmer className="h-24 rounded-3xl bg-gray-200" />
                        </div>
                        <Shimmer className="w-full h-40 rounded-3xl bg-gray-200" />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <Shimmer className="w-full h-64 rounded-3xl bg-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    const currentDisplayAvatar = previewAvatarUrl || profile.profile_picture;
    const portfolioLink = profile.websiteUrl || profile.profileUrl;

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-screen relative bg-[#F5F6FC]">
            <Toaster position="top-right" />

            {/* INTEGRATE USER EDIT POPUP */}
            {isOwnProfile && (
                <UserEditProfilePopup
                    isOpen={isEditPopupOpen}
                    onClose={() => setIsEditPopupOpen(false)}
                    profileData={profile}
                    onSave={handleSaveProfile}
                />
            )}

            {/* --- CROPPER MODAL UI --- */}
            {cropImageSrc && isOwnProfile && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[95vh]">

                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gradient-to-r from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] text-white shrink-0">
                            <h3 className="font-extrabold text-lg flex items-center gap-2"><FaCamera /> Profile Photo Editor</h3>
                            <div className="flex items-center gap-3">
                                {/* Explicit "Upload New Image" Button */}
                                <label htmlFor="avatar-upload-editor" className="cursor-pointer px-4 py-1.5 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors text-sm border border-white/40">
                                    Upload New
                                </label>
                                <input type="file" id="avatar-upload-editor" accept="image/*" onChange={handleAvatarSelect} className="hidden" />

                                <button disabled={isSavingImage} onClick={closeEditor} className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors disabled:opacity-50">
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        {/* Editor Layout */}
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <div className="relative w-full h-[350px] bg-gray-900 overflow-hidden shrink-0">
                                <Cropper
                                    image={cropImageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={1}
                                    cropShape="round"
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={onCropComplete}
                                    style={{ containerStyle: { filter: getFilterCSSString() } }}
                                />
                                {imageFrame === 'openToWork' && (
                                    <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
                                        <div className="w-[300px] h-[300px] rounded-full border-[18px] border-t-transparent border-r-transparent border-l-transparent border-[#218B53] flex items-end justify-center pb-2 opacity-90 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)]">
                                            <span className="text-white font-black text-xl mb-4 tracking-wider">#OPENTOWORK</span>
                                        </div>
                                    </div>
                                )}
                                {imageFrame === 'hiring' && (
                                    <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
                                        <div className="w-[300px] h-[300px] rounded-full border-[18px] border-t-transparent border-r-transparent border-l-transparent border-[#8B5CF6] flex items-end justify-center pb-2 opacity-90 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)]">
                                            <span className="text-white font-black text-xl mb-4 tracking-wider">#HIRING</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
                                {['crop', 'filter', 'adjust', 'frames'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setEditorTab(tab)}
                                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${editorTab === tab ? 'text-[#2A45C2] border-b-2 border-[#2A45C2] bg-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 bg-white overflow-y-auto flex-1 custom-scrollbar">
                                {editorTab === 'crop' && (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-gray-500 w-16 uppercase">Zoom</span>
                                            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1 accent-[#2A45C2] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                            <span className="text-xs font-bold text-[#2A45C2] w-8 text-right">{Math.round(zoom * 100)}%</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-gray-500 w-16 uppercase">Rotate</span>
                                            <input type="range" value={rotation} min={0} max={360} step={1} onChange={(e) => setRotation(e.target.value)} className="flex-1 accent-[#2A45C2] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                            <span className="text-xs font-bold text-[#2A45C2] w-8 text-right">{rotation}°</span>
                                        </div>
                                    </div>
                                )}

                                {editorTab === 'filter' && (
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                        {[
                                            { id: 'none', label: 'Original', css: 'none' },
                                            { id: 'cool', label: 'Cool', css: 'hue-rotate(180deg) saturate(150%)' },
                                            { id: 'warm', label: 'Warm', css: 'sepia(30%) saturate(150%)' },
                                            { id: 'vintage', label: 'Vintage', css: 'sepia(50%) contrast(120%) saturate(120%)' },
                                            { id: 'grayscale', label: 'B&W', css: 'grayscale(100%)' },
                                            { id: 'sepia', label: 'Sepia', css: 'sepia(100%)' }
                                        ].map(f => (
                                            <div key={f.id} onClick={() => setImageFilter(f.id)} className={`cursor-pointer flex flex-col items-center gap-2 group`}>
                                                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${imageFilter === f.id ? 'border-[#2A45C2] shadow-md scale-110' : 'border-gray-200 group-hover:border-[#2A45C2]/50'}`}>
                                                    <img src={cropImageSrc} style={{ filter: f.css, objectFit: 'cover', width: '100%', height: '100%' }} alt="filter preview" />
                                                </div>
                                                <span className={`text-[10px] font-bold ${imageFilter === f.id ? 'text-[#2A45C2]' : 'text-gray-500'}`}>{f.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {editorTab === 'adjust' && (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-gray-500 w-20 uppercase">Brightness</span>
                                            <input type="range" value={adjustments.brightness} min={50} max={150} step={1} onChange={(e) => setAdjustments({ ...adjustments, brightness: e.target.value })} className="flex-1 accent-[#2A45C2] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-gray-500 w-20 uppercase">Contrast</span>
                                            <input type="range" value={adjustments.contrast} min={50} max={150} step={1} onChange={(e) => setAdjustments({ ...adjustments, contrast: e.target.value })} className="flex-1 accent-[#2A45C2] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-gray-500 w-20 uppercase">Saturation</span>
                                            <input type="range" value={adjustments.saturation} min={0} max={200} step={1} onChange={(e) => setAdjustments({ ...adjustments, saturation: e.target.value })} className="flex-1 accent-[#2A45C2] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                        </div>
                                        <div className="pt-2 text-right">
                                            <button onClick={() => setAdjustments({ brightness: 100, contrast: 100, saturation: 100 })} className="text-xs font-bold text-red-500 hover:underline">Reset Adjustments</button>
                                        </div>
                                    </div>
                                )}

                                {editorTab === 'frames' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div onClick={() => setImageFrame('none')} className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center text-center transition-all ${imageFrame === 'none' ? 'border-[#2A45C2] bg-blue-50/50' : 'border-gray-200 hover:border-[#2A45C2]/50'}`}>
                                            <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
                                            <span className="font-bold text-sm text-gray-900">Original</span>
                                            <span className="text-[10px] text-gray-500">No frame</span>
                                        </div>
                                        <div onClick={() => setImageFrame('openToWork')} className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center text-center transition-all ${imageFrame === 'openToWork' ? 'border-[#218B53] bg-green-50/50' : 'border-gray-200 hover:border-[#218B53]/50'}`}>
                                            <div className="w-12 h-12 rounded-full border-4 border-b-[#218B53] border-l-[#218B53] border-t-gray-200 border-r-gray-200 mb-2 transform -rotate-45"></div>
                                            <span className="font-bold text-sm text-gray-900">#OpenToWork</span>
                                            <span className="text-[10px] text-gray-500">Show recruiters you are looking</span>
                                        </div>
                                        <div onClick={() => setImageFrame('hiring')} className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center text-center transition-all ${imageFrame === 'hiring' ? 'border-[#8B5CF6] bg-purple-50/50' : 'border-gray-200 hover:border-[#8B5CF6]/50'}`}>
                                            <div className="w-12 h-12 rounded-full border-4 border-b-[#8B5CF6] border-l-[#8B5CF6] border-t-gray-200 border-r-gray-200 mb-2 transform -rotate-45"></div>
                                            <span className="font-bold text-sm text-gray-900">#Hiring</span>
                                            <span className="text-[10px] text-gray-500">Show you are hiring</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                                <Button variant="outline" onClick={closeEditor} disabled={isSavingImage} className="rounded-xl font-bold bg-white border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                                    Cancel
                                </Button>
                                <Button onClick={handleCropSave} disabled={isSavingImage} className="rounded-xl font-bold bg-[#2A45C2] text-white hover:bg-[#1a2b7a] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center">
                                    {isSavingImage ? <FaSpinner className="animate-spin" /> : <><FaCheck /> Save Final</>}
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

                    {/* REDESIGNED PROFILE CARD MATCHING REFERENCE EXACTLY */}
                    <div className="bg-white border border-[#E7E9F7] rounded-[24px] p-6 shadow-sm relative">

                        {/* Edit Button */}
                        {isOwnProfile && (
                            <button
                                onClick={() => setIsEditPopupOpen(true)}
                                className="absolute top-6 right-6 flex items-center gap-2 px-4 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm shadow-sm"
                            >
                                <FaPen size={12} /> Edit
                            </button>
                        )}

                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                            {/* Avatar Section */}
                            <div className="relative group shrink-0">
                                <div
                                    className={`w-[140px] h-[140px] bg-white rounded-full p-1 shadow-sm border border-gray-100 ${isOwnProfile ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
                                    onClick={isOwnProfile ? handleEditExistingPhoto : undefined}
                                    title={isOwnProfile ? "Click to edit profile picture" : ""}
                                >
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-5xl font-extrabold text-[#2A45C2] relative">
                                        {currentDisplayAvatar ? (
                                            /* NO CROSSORIGIN HERE! Prevents S3 CORS errors on normal display */
                                            <img src={`${currentDisplayAvatar}?t=${timestamp}`} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
                                        )}
                                        {isOwnProfile && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FaCamera size={24} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isOwnProfile && <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarSelect} className="hidden" />}
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 w-full pt-1">
                                <h1 className="text-[28px] font-black text-gray-900 mb-1 flex items-center justify-center md:justify-start gap-2 flex-wrap pr-0 md:pr-24">
                                    {profile.name}
                                    {profile.pronouns && <span className="text-[15px] font-black text-[#2A45C2]">({profile.pronouns})</span>}
                                </h1>

                                {profile.headline && (
                                    <p className="text-[15px] text-gray-700 font-bold mb-4">
                                        {profile.headline}
                                    </p>
                                )}

                                {/* Details Row Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 mb-6">
                                    {(profile.city || profile.country) && (
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-semibold text-gray-600">
                                            <FaMapMarkerAlt className="text-[#2A45C2]" />
                                            {profile.city ? `${profile.city}, ` : ''}{profile.country}
                                        </div>
                                    )}
                                    {profile.school && (
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-semibold text-gray-600">
                                            <FaGraduationCap className="text-[#2A45C2]" />
                                            {profile.school}
                                        </div>
                                    )}
                                    {(profile.position || profile.industry) && (
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-semibold text-gray-600">
                                            <FaBriefcase className="text-[#2A45C2]" />
                                            {profile.position}{profile.position && profile.industry ? ' · ' : ''}{profile.industry}
                                        </div>
                                    )}
                                </div>

                                {/* Pills Integration */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <div
                                        className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                                        onClick={() => navigate('/user-dashboard/my-network', { state: { activeTab: 'followers' } })}
                                    >
                                        <span className="text-[15px] font-black text-[#2A45C2]">{profile.followers}</span>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Followers</span>
                                    </div>

                                    <div
                                        className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                                        onClick={() => navigate('/user-dashboard/my-network', { state: { activeTab: 'following' } })}
                                    >
                                        <span className="text-[15px] font-black text-[#2A45C2]">{profile.following}</span>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Following</span>
                                    </div>

                                    {/* Prominent Portfolio Button */}
                                    {portfolioLink && (
                                        <a
                                            href={portfolioLink.startsWith('http') ? portfolioLink : `https://${portfolioLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#5B4FE0] text-white hover:bg-[#483bc7] transition-colors rounded-full px-5 py-1.5 flex items-center gap-2 font-bold text-sm shadow-sm"
                                            title={portfolioLink}
                                        >
                                            <FaLink size={12} /> {portfolioLink.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Highlights (Only show if viewing OWN profile) */}
                    {isOwnProfile && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'TOTAL APPLICATIONS', value: dashboardStats.applied },
                                { label: 'SAVED JOBS', value: dashboardStats.saved }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white border border-[#E7E9F7] rounded-3xl p-5 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <div className="w-[60px] h-[60px] rounded-full border-2 border-blue-100 flex items-center justify-center font-black text-2xl text-[#2A45C2] bg-white">
                                        {stat.value}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
                                        <p className="text-xl font-black text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* MY POSTS / ACTIVITY SECTION */}
                    <div className="bg-white border border-[#E7E9F7] rounded-[24px] shadow-sm overflow-hidden" ref={myPostsRef}>

                        {/* Solid Blue Theme Header matching Reference */}
                        <div className="bg-[#2A45C2] px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                                    <FaRegFileAlt /> Activity & Posts
                                </h2>
                                <p className="text-sm text-blue-100 font-medium mt-0.5">
                                    {isOwnProfile ? 'Keep your network updated with your latest insights.' : `Recent activity and insights from ${profile.name}.`}
                                </p>
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => navigate('/user-dashboard')}
                                    className="bg-white text-[#2A45C2] hover:bg-gray-50 font-bold rounded-xl px-5 py-2 whitespace-nowrap shadow-sm text-sm transition-colors"
                                >
                                    Create a Post
                                </button>
                            )}
                        </div>

                        <div className="p-6 md:p-8 space-y-4 bg-white">
                            {userPosts.length > 0 ? userPosts.map(post => {
                                const isLongText = post.content && (post.content.length > 250 || post.content.split('\n').length > 5);
                                const isExpanded = expandedText[post.id];

                                return (
                                    <div key={post.id} className="p-5 rounded-2xl border border-[#E7E9F7] bg-white shadow-sm hover:border-[#2A45C2]/30 transition-all group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B4FE0] to-[#8B5CF6] flex items-center justify-center font-extrabold text-white shadow-sm overflow-hidden cursor-pointer"
                                                onClick={() => navigate(`/user-dashboard/profile/${post.user_id}`)}
                                            >
                                                {profile.profile_picture ? (
                                                    <img src={`${profile.profile_picture}?t=${timestamp}`} alt={profile.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'
                                                )}
                                            </div>
                                            <div>
                                                <h4
                                                    className="font-bold text-gray-900 text-sm hover:text-[#2A45C2] transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/user-dashboard/profile/${post.user_id}`)}
                                                >
                                                    {post.author_name || profile.name}
                                                </h4>
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

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex gap-2">
                                                <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                    <FaThumbsUp size={12} /> {post.likes_count || 0}
                                                </button>
                                                <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                    <FaRegCommentDots size={14} /> {post.comments_count || 0}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => { setExpandedPost(post); setCurrentImageIndex(0); }}
                                                className="text-xs font-bold text-gray-500 hover:text-[#2A45C2] transition-colors flex items-center gap-1"
                                            >
                                                Expand Post <FaChevronRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-[#E7E9F7] border-dashed">
                                    <div className="w-16 h-16 mx-auto bg-white shadow-sm text-[#2A45C2] rounded-full flex items-center justify-center mb-3 border border-blue-100">
                                        <FaRegFileAlt size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900">No recent activity</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                        {isOwnProfile ? 'Start sharing updates to build your professional presence.' : 'This user hasn\'t posted anything yet.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDEBAR COLUMN --- */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Discover Network Card matching reference */}
                    <div className="bg-white border border-[#E7E9F7] rounded-[24px] shadow-sm overflow-hidden">
                        <div className="bg-[#2A45C2] px-5 py-4 flex justify-between items-center">
                            <h3 className="text-[17px] font-black text-white flex items-center gap-2">
                                <FaUsers /> Build Network
                            </h3>
                        </div>

                        <div className="p-5 space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar bg-white">
                            {allUsers.length > 0 ? allUsers.slice(0, 6).map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-white hover:border-[#E7E9F7] hover:bg-gray-50 transition-colors shadow-sm group">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center font-bold text-white shadow-sm overflow-hidden shrink-0 cursor-pointer border border-gray-100"
                                            onClick={() => navigate(`/user-dashboard/profile/${user.id}`)}
                                        >
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt={user.full_name || user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                (user.full_name || user.name || 'U').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h4
                                                className="font-bold text-gray-900 text-sm hover:text-[#2A45C2] cursor-pointer line-clamp-1 transition-colors"
                                                onClick={() => navigate(`/user-dashboard/profile/${user.id}`)}
                                            >
                                                {user.full_name || user.name}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 font-medium line-clamp-1">{user.headline || user.role || 'Platform Member'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openChat(user)} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:text-[#2A45C2] hover:border-[#2A45C2] transition-colors shadow-sm" title="Message">
                                            <FaEnvelope size={12} />
                                        </button>
                                        <button onClick={() => toggleFollow(user.id)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${followingMap[user.id] ? 'bg-blue-50 border border-[#2A45C2] text-[#2A45C2]' : 'bg-white border border-gray-200 text-gray-500 hover:text-[#2A45C2] hover:border-[#2A45C2]'}`} title={followingMap[user.id] ? "Unfollow" : "Follow"}>
                                            {followingMap[user.id] ? <FaCheck size={10} /> : <FaPlus size={10} />}
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
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors"
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