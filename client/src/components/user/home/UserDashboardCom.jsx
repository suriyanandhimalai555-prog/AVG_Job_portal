import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import {
    FaBuilding,
    FaBriefcase,
    FaGraduationCap,
    FaGift,
    FaChevronRight,
    FaChevronLeft,
    FaCoins,
    FaMapMarkerAlt,
    FaBookmark,
    FaStar,
    FaUsers,
    FaPlayCircle,
    FaImage,
    FaRegSmile,
    FaTimes,
    FaEllipsisH,
    FaThumbsUp,
    FaRegCommentDots,
    FaShare,
    FaCaretDown,
    FaPaperPlane,
    FaEdit,
    FaTrash,
    FaLink,
    FaWhatsapp,
    FaTwitter,
    FaLinkedin,
    FaHeart,
    FaLightbulb,
    FaLaughBeam,
    FaHandHoldingHeart,
    FaSignLanguage
} from 'react-icons/fa';
import Shimmer from '../../ui/Shimmer';

const UserDashboardCom = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('User');
    const [userIdState, setUserIdState] = useState(1);

    const [metrics, setMetrics] = useState({
        jobsApplied: 0,
        referralEarnings: '0.00'
    });

    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editPostId, setEditPostId] = useState(null);
    const [postContent, setPostContent] = useState('');
    const [postImages, setPostImages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Sort and Feed States
    const [feedPosts, setFeedPosts] = useState([]);
    const [sortBy, setSortBy] = useState('latest');

    // Comments States
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [visibleCommentsCount, setVisibleCommentsCount] = useState({});

    // Lightbox Modal States (Theater Mode)
    const [expandedPost, setExpandedPost] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // UI Toggles
    const [activePostOptions, setActivePostOptions] = useState(null);
    const [activeShareMenu, setActiveShareMenu] = useState(null);
    const [hoveredReactionPostId, setHoveredReactionPostId] = useState(null);
    const [toastMsg, setToastMsg] = useState('');
    const [postToDelete, setPostToDelete] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3500);
    };

    const fetchPosts = async (currentUserId) => {
        const uid = currentUserId || userIdState;
        try {
            const res = await fetch(`${apiUrl}/api/posts?userId=${uid}`);
            if (res.ok) {
                const data = await res.json();
                setFeedPosts(data);
            }
        } catch (e) { }
    };

    // Keep theater mode in sync with feed updates (likes, comments)
    useEffect(() => {
        if (expandedPost) {
            const updated = feedPosts.find(p => p.id === expandedPost.id);
            if (updated) setExpandedPost(updated);
        }
    }, [feedPosts]);

    useEffect(() => {
        let isMounted = true;

        const fetchDashboardData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token') || '';
            let userId = null;

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                try {
                    const storedUser = JSON.parse(storedUserStr);
                    if (storedUser.fullName || storedUser.name) {
                        setUserName(storedUser.fullName || storedUser.name);
                    }
                    userId = storedUser.id;
                } catch (e) { }
            }

            if (!userId && token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const name = payload.fullName || payload.name || payload.email?.split('@')[0] || 'User';
                    setUserName(name);
                    userId = payload.id;
                } catch (e) { }
            }

            if (userId) setUserIdState(userId);

            try {
                const targetCourseUserId = userId ? (parseInt(userId) || 1) : 1;
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const [jobsRes, referralRes, allJobsRes, allCoursesRes] = await Promise.all([
                    fetch(`${apiUrl}/api/applications/my-applications`, { headers }).catch(() => ({ ok: false })),
                    fetch(`${apiUrl}/api/users/${targetCourseUserId}/stats`, { headers }).catch(() => ({ ok: false })),
                    fetch(`${apiUrl}/api/jobs`).catch(() => ({ ok: false })),
                    fetch(`${apiUrl}/api/courses`).catch(() => ({ ok: false }))
                ]);

                await fetchPosts(userId);

                let jobsAppliedCount = 0;
                let refEarnings = '0.00';

                if (jobsRes.ok) {
                    try {
                        const appsData = await jobsRes.json();
                        jobsAppliedCount = Array.isArray(appsData) ? appsData.length : 0;
                    } catch (e) { }
                }

                if (referralRes.ok) {
                    try {
                        const statsData = await referralRes.json();
                        refEarnings = parseFloat(statsData.referral_earnings || 0).toFixed(2);
                    } catch (e) { }
                }

                if (isMounted) {
                    setMetrics({
                        jobsApplied: jobsAppliedCount,
                        referralEarnings: refEarnings
                    });
                }

                const relevanceKeywords = ['bioinformatics', 'biotechnology', 'laboratory', 'hplc', 'pcr', 'graphic design', 'branding', 'logo', 'alphafold', 'benchling', 'computer'];

                if (allJobsRes.ok && isMounted) {
                    try {
                        const jobsData = await allJobsRes.json();
                        if (Array.isArray(jobsData)) {
                            let activeJobs = jobsData.filter(job => job.status === 'Active');
                            activeJobs.sort((a, b) => {
                                const textA = `${a.title || ''} ${a.description || ''} ${a.company || ''}`.toLowerCase();
                                const textB = `${b.title || ''} ${b.description || ''} ${b.company || ''}`.toLowerCase();
                                const scoreA = relevanceKeywords.filter(k => textA.includes(k)).length;
                                const scoreB = relevanceKeywords.filter(k => textB.includes(k)).length;
                                return scoreB - scoreA;
                            });
                            setRecommendedJobs(activeJobs.slice(0, 6));
                        }
                    } catch (e) { }
                }

                if (allCoursesRes.ok && isMounted) {
                    try {
                        const coursesData = await allCoursesRes.json();
                        if (Array.isArray(coursesData)) {
                            let activeCourses = coursesData.filter(course => course.status === 'Active');
                            activeCourses.sort((a, b) => {
                                const textA = `${a.title || ''} ${a.category || ''} ${a.description || ''}`.toLowerCase();
                                const textB = `${b.title || ''} ${b.category || ''} ${b.description || ''}`.toLowerCase();
                                const scoreA = relevanceKeywords.filter(k => textA.includes(k)).length;
                                const scoreB = relevanceKeywords.filter(k => textB.includes(k)).length;
                                return scoreB - scoreA;
                            });
                            setFeaturedCourses(activeCourses.slice(0, 6));
                        }
                    } catch (e) { }
                }

            } catch (error) {
            } finally {
                setTimeout(() => {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }, 500);
            }
        };

        fetchDashboardData();

        return () => {
            isMounted = false;
        };
    }, [apiUrl]);

    const handleEmojiClick = (emojiData) => {
        setPostContent(prev => prev + emojiData.emoji);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPostImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = null;
    };

    const removePreviewImage = (indexToRemove) => {
        setPostImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSavePost = async () => {
        if (!postContent.trim() && postImages.length === 0) return;

        try {
            if (editPostId) {
                await fetch(`${apiUrl}/api/posts/${editPostId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userIdState,
                        content: postContent,
                        images: postImages
                    })
                });
                showToast("Post updated successfully!");
            } else {
                await fetch(`${apiUrl}/api/posts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userIdState,
                        authorName: userName,
                        content: postContent,
                        images: postImages
                    })
                });
                showToast("Post created successfully!");
            }

            setPostContent('');
            setPostImages([]);
            setEditPostId(null);
            setShowEmojiPicker(false);
            setIsPostModalOpen(false);
            fetchPosts();
        } catch (e) { }
    };

    const handleEditInit = (post) => {
        setEditPostId(post.id);
        setPostContent(post.content);
        setPostImages(post.images || (post.image ? [post.image] : []));
        setIsPostModalOpen(true);
        setActivePostOptions(null);
    };

    const handleDeletePost = async (postId) => {
        try {
            await fetch(`${apiUrl}/api/posts/${postId}?userId=${userIdState}`, {
                method: 'DELETE'
            });
            fetchPosts();
            setActivePostOptions(null);
            setPostToDelete(null);
            showToast("Post deleted successfully!");
        } catch (e) { }
    };

    const handleReaction = async (postId, reactionType) => {
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userIdState, reactionType })
            });
            fetchPosts();
            setHoveredReactionPostId(null);
        } catch (e) { }
    };

    const generatePostLink = (postId) => `${window.location.origin}/user-dashboard?postId=${postId}`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("Link copied to clipboard!");
    };

    const handleShareClick = async (postId, platform) => {
        const link = generatePostLink(postId);
        const text = encodeURIComponent(`Check out this post on Agila Vetri: ${link}`);

        if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
        else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        else if (platform === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank');
        else if (platform === 'copy') copyToClipboard(link);

        try {
            await fetch(`${apiUrl}/api/posts/${postId}/share`, { method: 'POST' });
            fetchPosts();
        } catch (e) { }
        setActiveShareMenu(null);
    };

    const submitComment = async (postId) => {
        if (!commentText.trim()) return;
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userIdState,
                    authorName: userName,
                    content: commentText
                })
            });
            setCommentText('');
            fetchPosts();
        } catch (e) { }
    };

    const handleSeeMoreComments = (postId) => {
        setVisibleCommentsCount(prev => ({
            ...prev,
            [postId]: (prev[postId] || 5) + 10
        }));
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const sortedFeedPosts = [...feedPosts].sort((a, b) => {
        if (sortBy === 'top') {
            const scoreA = parseInt(a.likes_count || 0) + parseInt(a.comments_count || 0);
            const scoreB = parseInt(b.likes_count || 0) + parseInt(b.comments_count || 0);
            return scoreB - scoreA;
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const getImagesArray = (post) => {
        return post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
    };

    const renderPostImagesGrid = (post) => {
        const images = getImagesArray(post);
        if (images.length === 0) return null;

        const handleImageClick = (idx) => {
            setExpandedPost(post);
            setCurrentImageIndex(idx);
        };

        if (images.length === 1) {
            return (
                <div className="w-full mt-2 bg-gray-50 border-t border-b border-gray-100 cursor-pointer" onClick={() => handleImageClick(0)}>
                    <img src={images[0]} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                </div>
            );
        }
        if (images.length === 2) {
            return (
                <div className="grid grid-cols-2 gap-0.5 mt-2 bg-white max-h-[400px] overflow-hidden cursor-pointer">
                    <img src={images[0]} onClick={() => handleImageClick(0)} className="w-full h-[400px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <img src={images[1]} onClick={() => handleImageClick(1)} className="w-full h-[400px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                </div>
            );
        }
        if (images.length === 3) {
            return (
                <div className="grid grid-cols-2 gap-0.5 mt-2 bg-white max-h-[400px] overflow-hidden cursor-pointer">
                    <img src={images[0]} onClick={() => handleImageClick(0)} className="w-full h-[400px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <div className="grid grid-rows-2 gap-0.5 h-[400px]">
                        <img src={images[1]} onClick={() => handleImageClick(1)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                        <img src={images[2]} onClick={() => handleImageClick(2)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    </div>
                </div>
            );
        }
        if (images.length >= 4) {
            return (
                <div className="grid grid-cols-2 grid-rows-2 gap-0.5 mt-2 bg-white h-[400px] overflow-hidden cursor-pointer">
                    <img src={images[0]} onClick={() => handleImageClick(0)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <img src={images[1]} onClick={() => handleImageClick(1)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <img src={images[2]} onClick={() => handleImageClick(2)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <div className="relative h-[198px] w-full bg-gray-100" onClick={() => handleImageClick(3)}>
                        <img src={images[3]} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                        {images.length > 4 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-3xl font-medium tracking-wide">
                                +{images.length - 4}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    };

    const statCards = [
        {
            label: 'Jobs Applied',
            value: metrics.jobsApplied,
            icon: FaBriefcase,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            ring: 'group-hover:ring-blue-100',
            progress: Math.min((metrics.jobsApplied / 50) * 100, 100)
        },
        {
            label: 'Referral Earnings',
            value: `AED ${metrics.referralEarnings}`,
            icon: FaCoins,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            ring: 'group-hover:ring-amber-100',
            progress: 100
        }
    ];

    const ecosystemLinks = [
        {
            icon: FaBuilding,
            title: 'Business Directory',
            desc: 'Find trusted businesses',
            path: '/user-dashboard/directory',
            grad: 'from-blue-600 to-indigo-600'
        },
        {
            icon: FaBriefcase,
            title: 'Job Portal',
            desc: 'Openings across UAE',
            path: '/user-dashboard/jobs',
            grad: 'from-indigo-600 to-purple-600'
        },
        {
            icon: FaGraduationCap,
            title: 'Training Academy',
            desc: 'Courses & certificates',
            path: '/user-dashboard/academy',
            grad: 'from-teal-500 to-emerald-500'
        },
        {
            icon: FaGift,
            title: 'Refer & Earn',
            desc: 'Invite friends, earn rewards',
            path: '/user-dashboard/refer',
            grad: 'from-amber-500 to-orange-500'
        }
    ];

    const getMockRating = (id) => (4.0 + (id % 10) / 10).toFixed(1);
    const getMockReviews = (id) => 40 + (id * 47) % 1500;

    if (isLoading) {
        return (
            <div className="max-w-[1400px] mx-auto p-3 md:p-3 rounded-2xl bg-[#F5F6FC] min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                    <Shimmer className="w-full h-36 md:h-100 rounded-2xl bg-gray-200" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <Shimmer className="h-24 rounded-xl" />
                        <Shimmer className="h-24 rounded-xl" />
                    </div>
                </div>
                <div className="hidden lg:block lg:col-span-4 space-y-4">
                    <Shimmer className="w-full h-32 rounded-xl bg-gray-200" />
                    <Shimmer className="w-full h-64 rounded-xl bg-gray-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-4 bg-gradient-to-b from-[#F7F8FB] to-[#EFF1FA] min-h-screen overflow-x-hidden relative">

            {toastMsg && (
                <div className="fixed top-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-2xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {toastMsg}
                </div>
            )}

            {postToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTrash className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-2">Delete Post?</h3>
                        <p className="text-sm text-gray-500 mb-6">This action cannot be undone. Are you sure you want to permanently delete this post?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setPostToDelete(null)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={() => handleDeletePost(postToDelete)} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 xl:col-span-7 space-y-6">
                    <div className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-8 md:py-6 bg-gradient-to-br from-[#0B1120] via-[#111C4E] to-[#2A2170] shadow-xl shadow-indigo-950/30">
                        <div className="absolute -top-20 -right-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

                        <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <pattern id="nodes" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                                    <circle cx="10" cy="10" r="2" fill="#ffffff" />
                                    <circle cx="90" cy="40" r="2" fill="#ffffff" />
                                    <circle cx="40" cy="90" r="2" fill="#ffffff" />
                                    <line x1="10" y1="10" x2="90" y2="40" stroke="#ffffff" strokeWidth="0.6" />
                                    <line x1="90" y1="40" x2="40" y2="90" stroke="#ffffff" strokeWidth="0.6" />
                                    <line x1="40" y1="90" x2="10" y2="10" stroke="#ffffff" strokeWidth="0.6" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#nodes)" />
                        </svg>

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="z-10">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-[11px] font-bold text-white tracking-wide uppercase">Profile Active</span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-1">
                                    Hello, {userName} <span className="inline-block animate-wave">👋</span>
                                </h1>
                                <p className="text-sm text-indigo-200/90 font-medium max-w-lg">
                                    Track your career progress, level up in the academy, and discover new opportunities across the ecosystem.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-base font-black text-gray-900 mb-2 px-1">Your Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            {statCards.map(({ label, value, icon: Icon, color, bg, ring, progress }) => (
                                <div key={label} className={`group bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-gray-100 ring-1 ring-transparent hover:shadow-lg hover:-translate-y-0.5 ${ring} transition-all duration-300`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={16} />
                                        </div>
                                        <span className="text-2xl font-black text-gray-900">{value}</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 mb-2">{label}</p>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${color.replace('text-', 'bg-')}`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2 px-1">
                            <div>
                                <h2 className="text-base font-black text-gray-900">Recommended Jobs</h2>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">Sourced and sorted for your profile</p>
                            </div>
                            <button onClick={() => navigate('/user-dashboard/jobs')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors hidden sm:block">
                                View All Jobs
                            </button>
                        </div>

                        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {recommendedJobs.length > 0 ? recommendedJobs.map((job) => (
                                <div key={job.id} className="min-w-[260px] md:min-w-[300px] bg-white border border-gray-100 rounded-xl p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 snap-start flex flex-col group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-lg font-black text-[#2A45C2] group-hover:scale-105 transition-transform shadow-sm">
                                            {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                                        </div>
                                        <button className="text-gray-300 hover:text-blue-600 transition-colors">
                                            <FaBookmark size={14} />
                                        </button>
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 leading-tight mb-0.5 truncate">{job.title}</h3>
                                    <p className="text-xs font-medium text-gray-500 mb-2 truncate">{job.company}</p>

                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 mb-2.5">
                                        <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location || 'Remote'}</span>
                                        <span>•</span>
                                        <span>{job.type || 'Full-time'}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {job.experience && (
                                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                                {job.experience}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                                            {job.openings ? `${job.openings} Openings` : 'Active'}
                                        </span>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                                        <span className="text-sm font-black text-gray-900">{job.salary || 'Negotiable'}</span>
                                        <button onClick={() => navigate('/user-dashboard/jobs')} className="px-3.5 py-1.5 bg-gray-900 hover:bg-[#2A45C2] text-white text-xs font-bold rounded-lg transition-colors shadow-md">
                                            Apply Now
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="w-full text-center py-8 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500 font-medium">
                                    No active job recommendations at this moment.
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2 px-1">
                            <div>
                                <h2 className="text-base font-black text-gray-900">Featured Courses</h2>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">Level up your professional skills</p>
                            </div>
                            <button onClick={() => navigate('/user-dashboard/academy')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors hidden sm:block">
                                Browse Academy
                            </button>
                        </div>

                        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {featuredCourses.length > 0 ? featuredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    onClick={() => navigate('/user-dashboard/academy')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter') navigate('/user-dashboard/academy'); }}
                                    className="min-w-[240px] md:min-w-[280px] bg-white border border-gray-100 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 snap-start flex flex-col group cursor-pointer">

                                    <div className="h-24 bg-gray-100 relative overflow-hidden">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white">
                                                <FaPlayCircle size={26} className="opacity-80" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wider uppercase shadow-sm">
                                            {course.duration || 'Self-Paced'}
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-extrabold text-[#2A45C2] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{course.category || 'General'}</span>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 leading-snug mb-1 group-hover:text-[#2A45C2] transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-500 mb-2">{course.instructor_name || 'Expert Instructor'}</p>

                                        <div className="flex items-center gap-3 mt-auto">
                                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                                <FaStar /> {getMockRating(course.id)}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                <FaUsers /> {getMockReviews(course.id)}
                                            </div>
                                            <div className="ml-auto font-black text-gray-900 text-sm">
                                                {course.discount_price || course.price || 'Free'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="w-full text-center py-8 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500 font-medium">
                                    No featured courses available at this moment.
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2 px-1">
                            <h2 className="text-base font-black text-gray-900">Explore Ecosystem</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {ecosystemLinks.map(({ icon: Icon, title, desc, path, grad }) => (
                                <div
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className="group relative flex flex-row lg:flex-col items-center lg:items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 cursor-pointer shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className={`w-11 h-11 shrink-0 rounded-lg flex items-center justify-center bg-gradient-to-br ${grad} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#2A45C2] transition-colors">
                                            {title}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            {desc}
                                        </p>
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors lg:absolute lg:top-4 lg:right-4">
                                        <FaChevronRight size={11} className="text-gray-400 group-hover:text-[#2A45C2]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:h-[calc(154vh-100px)] lg:overflow-y-auto hidden-scrollbar space-y-4 pb-10">
                    <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-gray-200 p-4">
                        <div className="flex gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={() => setIsPostModalOpen(true)}
                                className="flex-1 text-left bg-white border border-gray-300 hover:bg-gray-50 rounded-full px-5 text-gray-500 font-medium text-sm transition-colors"
                            >
                                Start a post...
                            </button>
                        </div>
                        <div className="flex items-center px-2 text-gray-500 font-semibold text-sm">
                            <button onClick={() => setIsPostModalOpen(true)} className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                                <FaImage className="text-blue-500 text-lg" /> Media
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <div className="flex items-center gap-1 group relative cursor-pointer pr-1">
                            <span className="text-xs font-semibold text-gray-400">Sort by:</span>
                            <span className="text-xs font-bold text-gray-700 flex items-center gap-1 hover:text-gray-900 capitalize">
                                {sortBy} <FaCaretDown />
                            </span>

                            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden py-1">
                                <button onClick={() => setSortBy('latest')} className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${sortBy === 'latest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>Latest</button>
                                <button onClick={() => setSortBy('top')} className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${sortBy === 'top' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>Top</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sortedFeedPosts.map(post => {
                            const activeReaction = post.user_reaction ? getReactionDetails(post.user_reaction) : null;
                            const ActiveIcon = activeReaction ? activeReaction.Icon : FaThumbsUp;

                            return (
                                <div key={post.id} className="bg-white rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-gray-200 relative">
                                    <div className="p-4 flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                                                {post.author_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm leading-tight hover:text-[#2A45C2] cursor-pointer">{post.author_name}</h4>
                                                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{post.author_title || 'Job Seeker'}</p>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    {formatTime(post.created_at)} • <i className="fas fa-globe-americas"></i>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <button onClick={() => setActivePostOptions(activePostOptions === post.id ? null : post.id)} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                                                <FaEllipsisH />
                                            </button>
                                            {activePostOptions === post.id && (
                                                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1">
                                                    <button onClick={() => { copyToClipboard(generatePostLink(post.id)); setActivePostOptions(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaLink /> Copy Link</button>
                                                    {post.user_id === userIdState && (
                                                        <>
                                                            <button onClick={() => handleEditInit(post)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaEdit /> Edit Post</button>
                                                            <button onClick={() => setPostToDelete(post.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><FaTrash /> Delete Post</button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-4 pb-2">
                                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    </div>

                                    {/* Inline Grid Layout */}
                                    {renderPostImagesGrid(post)}

                                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center text-[11px] text-gray-500 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex -space-x-1 hover:-space-x-0 transition-all cursor-pointer">
                                                {post.reaction_types && post.reaction_types.length > 0 ? (
                                                    post.reaction_types.slice(0, 3).map((rt, idx) => {
                                                        const RTypeData = getReactionDetails(rt);
                                                        const RIcon = RTypeData.Icon;
                                                        return (
                                                            <div key={idx} className={`w-4 h-4 rounded-full flex items-center justify-center ${RTypeData.bgColor} border border-white relative z-${30 - idx * 10}`}>
                                                                <RIcon size={8} className="text-white" />
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-600 border border-white">
                                                        <FaThumbsUp size={8} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="hover:text-blue-600 hover:underline cursor-pointer transition-colors">{post.likes_count}</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="hover:text-blue-600 hover:underline cursor-pointer transition-colors" onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}>{post.comments_count} comments</span>
                                            <span className="hover:text-blue-600 hover:underline cursor-pointer transition-colors">{post.share_count} shares</span>
                                        </div>
                                    </div>

                                    <div className="px-2 py-1 flex items-center justify-between border-b border-gray-50 relative">
                                        <div
                                            className="relative flex-1 flex justify-center"
                                            onMouseEnter={() => setHoveredReactionPostId(post.id)}
                                            onMouseLeave={() => setHoveredReactionPostId(null)}
                                        >
                                            <button onClick={() => handleReaction(post.id, activeReaction ? activeReaction.type : 'like')} className={`flex items-center gap-2 font-bold text-[13px] flex-1 justify-center py-3 rounded-lg transition-colors ${activeReaction ? activeReaction.color : 'text-gray-500 hover:bg-gray-100'}`}>
                                                <ActiveIcon className="text-[19px]" />
                                                <span className="capitalize hidden sm:block">{activeReaction ? activeReaction.label : 'Like'}</span>
                                            </button>

                                            {hoveredReactionPostId === post.id && (
                                                <div className="absolute bottom-full mb-1 left-2 flex items-center gap-1 bg-white border border-gray-100 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-1.5 z-30 animate-fade-in-up transition-all duration-200">
                                                    {reactions.map(r => {
                                                        const ReactionIcon = r.Icon;
                                                        return (
                                                            <button
                                                                key={r.type}
                                                                onClick={(e) => { e.stopPropagation(); handleReaction(post.id, r.type); }}
                                                                className={`w-10 h-10 rounded-full hover:-translate-y-2 hover:scale-110 transition-all duration-200 flex items-center justify-center ${r.bgColor} shadow-sm border border-transparent hover:border-gray-200`}
                                                                title={r.label}
                                                            >
                                                                <ReactionIcon className="text-xl text-white" />
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center gap-2 text-gray-500 font-bold text-[13px] hover:bg-gray-100 flex-1 justify-center py-3 rounded-lg transition-colors">
                                            <FaRegCommentDots className="text-[19px]" /> <span className="hidden sm:block">Comment</span>
                                        </button>

                                        <div className="relative flex-1 flex justify-center">
                                            <button onClick={() => setActiveShareMenu(activeShareMenu === post.id ? null : post.id)} className="flex items-center gap-2 text-gray-500 font-bold text-[13px] hover:bg-gray-100 flex-1 justify-center py-3 rounded-lg transition-colors">
                                                <FaShare className="text-[19px]" /> <span className="hidden sm:block">Share</span>
                                            </button>

                                            {activeShareMenu === post.id && (
                                                <div className="absolute bottom-full mb-1 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1 right-0 sm:left-1/2 sm:transform sm:-translate-x-1/2">
                                                    <button onClick={() => handleShareClick(post.id, 'whatsapp')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaWhatsapp className="text-green-500 text-lg" /> WhatsApp</button>
                                                    <button onClick={() => handleShareClick(post.id, 'twitter')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaTwitter className="text-blue-400 text-lg" /> Twitter</button>
                                                    <button onClick={() => handleShareClick(post.id, 'linkedin')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaLinkedin className="text-blue-700 text-lg" /> LinkedIn</button>
                                                    <button onClick={() => handleShareClick(post.id, 'copy')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaLink className="text-gray-500 text-lg" /> Copy Link</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {activeCommentPostId === post.id && (
                                        <div className="bg-gray-50 rounded-b-xl border-t border-gray-100">
                                            <div className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                                        {userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Add a comment..."
                                                        className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors"
                                                        onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                                                    />
                                                    <button onClick={() => submitComment(post.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                                                        <FaPaperPlane size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {post.comments_data && post.comments_data.length > 0 && (() => {
                                                const visibleCount = visibleCommentsCount[post.id] || 5;
                                                const remainingCount = post.comments_data.length - visibleCount;

                                                return (
                                                    <div className="px-4 pb-4 max-h-[300px] overflow-y-auto">
                                                        {post.comments_data.slice(0, visibleCount).map(comment => (
                                                            <div key={comment.id} className="mb-3 flex gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden mt-1">
                                                                    {comment.author_name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-200 flex-1 shadow-sm">
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="font-bold text-[13px] text-gray-900 block">{comment.author_name}</span>
                                                                        <span className="text-[10px] text-gray-400 block">{formatTime(comment.created_at)}</span>
                                                                    </div>
                                                                    <span className="text-[13px] text-gray-700 mt-1 block leading-snug">{comment.content}</span>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {remainingCount > 0 && (
                                                            <button onClick={() => handleSeeMoreComments(post.id)} className="text-[13px] font-bold text-gray-500 hover:text-blue-600 transition-colors ml-10 mt-1">
                                                                Load more comments ({remainingCount} remaining)
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Create / Edit Post Modal */}
            {isPostModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-fade-in">
                    <div className="bg-white w-full sm:w-[650px] sm:rounded-xl shadow-2xl flex flex-col h-full sm:h-auto max-h-screen relative">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <div className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 cursor-pointer">
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{userName}</h3>
                                        <FaCaretDown className="text-gray-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Post to Anyone</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsPostModalOpen(false); setShowEmojiPicker(false); setPostImages([]); setEditPostId(null); setPostContent(''); }} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 min-h-[150px] flex flex-col">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="What do you want to talk about?"
                                className="w-full flex-1 text-lg outline-none resize-none placeholder-gray-500 text-gray-800 min-h-[100px]"
                                autoFocus
                            />

                            {postImages.length > 0 && (
                                <div className={`grid gap-2 mt-4 ${postImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {postImages.map((img, idx) => (
                                        <div key={idx} className="relative inline-block border border-gray-200 rounded-lg p-1 bg-gray-50">
                                            <img src={img} alt={`Preview ${idx}`} className="w-full h-auto max-h-[150px] object-cover rounded-md" />
                                            <button onClick={() => removePreviewImage(idx)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm">
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {showEmojiPicker && (
                            <div className="absolute bottom-[70px] left-4 z-50 shadow-xl rounded-lg">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}

                        <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-xl">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors">
                                    <FaRegSmile size={22} />
                                </button>

                                <button onClick={() => fileInputRef.current.click()} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors">
                                    <FaImage size={20} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSavePost}
                                    disabled={!postContent.trim() && postImages.length === 0}
                                    className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${postContent.trim() || postImages.length > 0
                                        ? 'bg-[#0a66c2] text-white hover:bg-[#004182] shadow-md'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {editPostId ? 'Update' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LinkedIn Style Image Theater Modal */}
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

                    {/* Theater Mode Right Sidebar */}
                    <div className="w-full md:w-[380px] lg:w-[450px] bg-white flex flex-col h-[40vh] md:h-screen overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 hidden md:flex">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-base shrink-0">
                                    {expandedPost.author_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{expandedPost.author_name}</h4>
                                    <p className="text-[11px] text-gray-500">{expandedPost.author_title || 'Job Seeker'}</p>
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

                            {/* Theater Mode Comments */}
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                    {userName.charAt(0).toUpperCase()}
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
                .hidden-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hidden-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.2s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px) translateX(0); }
                    to { opacity: 1; transform: translateY(0) translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default UserDashboardCom;