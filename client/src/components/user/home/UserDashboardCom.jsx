import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBuilding,
    FaBriefcase,
    FaGraduationCap,
    FaGift,
    FaChevronRight,
    FaCrown,
    FaCoins
} from 'react-icons/fa';
import Shimmer from '../../ui/Shimmer';

const UserDashboardCom = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('User');

    const [metrics, setMetrics] = useState({
        jobsApplied: 0,
        coursesTaken: 0,
        referralEarnings: '0.00'
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        let isMounted = true;

        const fetchDashboardData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            let userId = null;

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                try {
                    const storedUser = JSON.parse(storedUserStr);
                    if (storedUser.fullName || storedUser.name) {
                        setUserName(storedUser.fullName || storedUser.name);
                    }
                    userId = storedUser.id;
                } catch (e) { console.error('Local storage parse error:', e); }
            }

            if (!userId && token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const name = payload.fullName || payload.name || payload.email?.split('@')[0] || 'User';
                    setUserName(name);
                    userId = payload.id;
                } catch (e) { console.error('Token parse error:', e); }
            }

            if (!token || !userId) {
                if (isMounted) setIsLoading(false);
                return;
            }

            try {
                const targetCourseUserId = userId || 1;

                const [jobsRes, coursesRes, referralRes] = await Promise.all([
                    fetch(`${apiUrl}/api/applications/my-applications`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).catch(() => ({ ok: false })),

                    fetch(`${apiUrl}/api/courses/user/enrollments?userId=${targetCourseUserId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).catch(() => ({ ok: false })),

                    fetch(`${apiUrl}/api/users/${userId}/stats`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).catch(() => ({ ok: false }))
                ]);

                let jobsAppliedCount = 0;
                let coursesEnrolledCount = 0;
                let refEarnings = '0.00';

                if (jobsRes.ok) {
                    try {
                        const appsData = await jobsRes.json();
                        jobsAppliedCount = Array.isArray(appsData) ? appsData.length : 0;
                    } catch (e) { console.error('Failed to parse jobs data', e); }
                }

                if (coursesRes.ok) {
                    try {
                        const enrolledIds = await coursesRes.json();
                        coursesEnrolledCount = Array.isArray(enrolledIds) ? enrolledIds.length : 0;
                    } catch (e) { console.error('Failed to parse courses data', e); }
                }

                if (referralRes.ok) {
                    try {
                        const statsData = await referralRes.json();
                        refEarnings = parseFloat(statsData.referral_earnings || 0).toFixed(2);
                    } catch (e) { console.error('Failed to parse referral data', e); }
                }

                if (isMounted) {
                    setMetrics({
                        jobsApplied: jobsAppliedCount,
                        coursesTaken: coursesEnrolledCount,
                        referralEarnings: refEarnings
                    });
                }

            } catch (error) {
                console.error('Failed to fetch live user data for dashboard:', error);
            } finally {
                // Applied the same 500ms delay to match Navbar and Sidebar loading time
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
            bar: 'from-[#2A45C2] to-[#5B4FE0]',
            chip: 'bg-[#EEF1FE] text-[#2A45C2]'
        },
        {
            label: 'Courses Enrolled',
            value: metrics.coursesTaken,
            icon: FaGraduationCap,
            bar: 'from-[#5B4FE0] to-[#8B5CF6]',
            chip: 'bg-[#F1EEFE] text-[#5B4FE0]'
        },
        {
            label: 'Referral Earnings',
            value: `AED ${metrics.referralEarnings}`,
            icon: FaCoins,
            bar: 'from-[#D4A017] to-[#F2C14E]',
            chip: 'bg-[#FCF4E1] text-[#B8860B]',
            gold: true
        }
    ];

    const ecosystemLinks = [
        {
            icon: FaBuilding,
            title: 'Business Directory',
            desc: 'Find trusted businesses',
            path: '/user-dashboard/directory',
            grad: 'from-[#2A45C2] to-[#4C63DA]'
        },
        {
            icon: FaBriefcase,
            title: 'Job Portal',
            desc: 'Openings across UAE',
            path: '/user-dashboard/jobs',
            grad: 'from-[#5B4FE0] to-[#8B5CF6]'
        },
        {
            icon: FaGraduationCap,
            title: 'Training Academy',
            desc: 'Courses & certificates',
            path: '/user-dashboard/academy',
            grad: 'from-[#0EA5A5] to-[#2DD4BF]'
        },
        {
            icon: FaGift,
            title: 'Refer & Earn',
            desc: 'Invite friends, earn rewards',
            path: '/user-dashboard/refer',
            grad: 'from-[#D4A017] to-[#F2C14E]'
        }
    ];

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-3 md:p-4 rounded-2xl bg-[#F5F6FC]">
                <Shimmer className="w-full h-32 md:h-36 rounded-2xl bg-gray-300" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <Shimmer className="h-24 rounded-2xl" />
                    <Shimmer className="h-24 rounded-2xl" />
                    <Shimmer className="h-24 rounded-2xl" />
                </div>
                <div className="mt-4">
                    <Shimmer className="w-40 h-5 rounded mb-3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Shimmer className="h-24 rounded-2xl" />
                        <Shimmer className="h-24 rounded-2xl" />
                        <Shimmer className="h-24 rounded-2xl" />
                        <Shimmer className="h-24 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-3 md:p-4 rounded-2xl bg-[#F5F6FC]">

            <div className="relative overflow-hidden rounded-2xl px-5 py-6 md:px-8 md:py-7 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0]">
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
                <div className="pointer-events-none absolute right-24 -bottom-20 w-48 h-48 rounded-full bg-[#F2C14E]/10 blur-2xl" />

                <div className="relative flex justify-between items-start gap-3">
                    <div>
                        <p className="text-xs md:text-sm text-blue-100/80 mb-1 font-semibold tracking-wide">Welcome back,</p>
                        <h1 className="text-2xl md:text-4xl font-extrabold leading-tight flex items-center gap-2 tracking-tight capitalize text-white">
                            {userName} <span className="text-2xl md:text-3xl">👋</span>
                        </h1>
                        <p className="text-xs md:text-sm text-blue-100/70 font-medium tracking-wide mt-2">
                            One App · Many Opportunities Connect · Learn · Grow · Earn
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]"></span>
                        <span className="text-xs font-bold text-blue-50 tracking-wider uppercase">Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {statCards.map(({ label, value, icon: Icon, bar, chip }) => (
                    <div key={label} className="relative bg-white border border-[#E7E9F7] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(30,41,89,0.05)] hover:shadow-[0_6px_24px_rgba(30,41,89,0.1)] transition-shadow">
                        <div className={`h-[3px] w-full bg-gradient-to-r ${bar}`} />
                        <div className="p-4 md:p-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    {label}
                                </p>
                                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-none">
                                    {value}
                                </h2>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${chip}`}>
                                <Icon size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5">
                <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-3 px-0.5">
                    Explore Ecosystem
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ecosystemLinks.map(({ icon: Icon, title, desc, path, grad }) => (
                        <div
                            key={path}
                            onClick={() => navigate(path)}
                            className="group relative flex items-center gap-3.5 bg-white border border-[#E7E9F7] rounded-2xl px-4 py-4 cursor-pointer overflow-hidden shadow-[0_2px_16px_rgba(30,41,89,0.05)] hover:shadow-[0_10px_28px_rgba(42,69,194,0.14)] hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br ${grad} text-white shadow-[0_4px_12px_rgba(42,69,194,0.25)] group-hover:scale-105 transition-transform`}>
                                <Icon size={17} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                                    {title}
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium leading-tight truncate mt-0.5">
                                    {desc}
                                </p>
                            </div>
                            <FaChevronRight
                                size={12}
                                className="shrink-0 text-gray-300 group-hover:text-[#2A45C2] group-hover:translate-x-0.5 transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserDashboardCom;