import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    FaPlayCircle
} from 'react-icons/fa';
import Shimmer from '../../ui/Shimmer';
import PostCom from './PostCom';

const UserDashboardCom = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('User');
    const [userIdState, setUserIdState] = useState(1);

    const [metrics, setMetrics] = useState({
        jobsApplied: 0,
        referralEarnings: '0.00'
    });

    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Dashboard Left Column */}
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

                {/* Dashboard Right Column (Post Component) */}
                <PostCom userName={userName} userIdState={userIdState} apiUrl={apiUrl} />

            </div>

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