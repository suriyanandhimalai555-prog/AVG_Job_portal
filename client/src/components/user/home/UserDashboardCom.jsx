import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import {
    FaBuilding,
    FaBriefcase,
    FaGraduationCap,
    FaGift,
    FaChevronRight,
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
    FaPaperPlane
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
    const [postContent, setPostContent] = useState('');
    const [postImage, setPostImage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [feedPosts, setFeedPosts] = useState([]);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentText, setCommentText] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/posts`);
            if (res.ok) {
                const data = await res.json();
                setFeedPosts(data);
            }
        } catch (e) { }
    };

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

                await fetchPosts();

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
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPostImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async () => {
        if (!postContent.trim() && !postImage) return;

        try {
            await fetch(`${apiUrl}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userIdState,
                    authorName: userName,
                    content: postContent,
                    image: postImage
                })
            });
            setPostContent('');
            setPostImage(null);
            setShowEmojiPicker(false);
            setIsPostModalOpen(false);
            fetchPosts();
        } catch (e) { }
    };

    const handleLike = async (postId) => {
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userIdState })
            });
            fetchPosts();
        } catch (e) { }
    };

    const handleShare = async (postId) => {
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/share`, {
                method: 'POST'
            });
            fetchPosts();
        } catch (e) { }
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
            setActiveCommentPostId(null);
            fetchPosts();
        } catch (e) { }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            <div className="max-w-[1400px] mx-auto p-3 md:p-5 rounded-2xl bg-[#F7F8FB] min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-6">
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
        <div className="max-w-[1400px] mx-auto p-3 md:p-5 bg-gradient-to-b from-[#F7F8FB] to-[#EFF1FA] min-h-screen overflow-x-hidden">
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

                    <div className="flex items-center gap-3">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs font-semibold text-gray-400">Sort by: <strong className="text-gray-700">Top</strong></span>
                    </div>

                    <div className="space-y-4">
                        {feedPosts.map(post => (
                            <div key={post.id} className="bg-white rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-gray-200">
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
                                    <button className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                                        <FaEllipsisH />
                                    </button>
                                </div>

                                <div className="px-4 pb-2">
                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                </div>

                                {post.image && (
                                    <div className="w-full mt-2 bg-gray-100">
                                        <img src={post.image} alt="Post content" className="w-full h-auto max-h-[300px] object-cover" />
                                    </div>
                                )}

                                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <div className="bg-blue-500 text-white p-0.5 rounded-full"><FaThumbsUp size={8} /></div>
                                        <span>{post.likes_count}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span>{post.comments_count} comments</span>
                                        <span>{post.share_count} shares</span>
                                    </div>
                                </div>

                                <div className="px-2 py-1 flex items-center justify-between border-b border-gray-50">
                                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-gray-500 font-semibold text-xs hover:bg-gray-100 flex-1 justify-center py-3 rounded-lg transition-colors">
                                        <FaThumbsUp className="text-lg" /> Like
                                    </button>
                                    <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center gap-2 text-gray-500 font-semibold text-xs hover:bg-gray-100 flex-1 justify-center py-3 rounded-lg transition-colors">
                                        <FaRegCommentDots className="text-lg" /> Comment
                                    </button>
                                    <button onClick={() => handleShare(post.id)} className="flex items-center gap-2 text-gray-500 font-semibold text-xs hover:bg-gray-100 flex-1 justify-center py-3 rounded-lg transition-colors">
                                        <FaShare className="text-lg" /> Share
                                    </button>
                                </div>

                                {activeCommentPostId === post.id && (
                                    <div className="px-4 py-3 bg-gray-50 rounded-b-xl">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Add a comment..."
                                                className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500"
                                            />
                                            <button onClick={() => submitComment(post.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700">
                                                <FaPaperPlane />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {post.comments_data && post.comments_data.length > 0 && (
                                    <div className="px-4 py-2 bg-gray-50 max-h-40 overflow-y-auto">
                                        {post.comments_data.map(comment => (
                                            <div key={comment.id} className="mb-2 last:mb-0 bg-white p-2 rounded-lg border border-gray-100">
                                                <span className="font-bold text-xs text-gray-900 block">{comment.author_name}</span>
                                                <span className="text-xs text-gray-700">{comment.content}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isPostModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-fade-in">
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
                            <button onClick={() => { setIsPostModalOpen(false); setShowEmojiPicker(false); setPostImage(null); }} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
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
                            {postImage && (
                                <div className="mt-3 relative inline-block">
                                    <img src={postImage} alt="Upload preview" className="max-h-[200px] rounded-lg border border-gray-200" />
                                    <button onClick={() => setPostImage(null)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                                        <FaTimes />
                                    </button>
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
                                    className="hidden"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCreatePost}
                                    disabled={!postContent.trim() && !postImage}
                                    className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${postContent.trim() || postImage
                                        ? 'bg-[#0a66c2] text-white hover:bg-[#004182] shadow-md'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .hidden-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hidden-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default UserDashboardCom;