import React, { useState, useEffect } from 'react';
import {
    FaBuilding,
    FaBriefcase,
    FaGraduationCap,
    FaUsers,
    FaArrowRight,
    FaCheck,
    FaRegUser,
    FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const AdminDashboardCom = () => {
    const [counts, setCounts] = useState({ businesses: 0, jobs: 0, courses: 0, users: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [systemActivities, setSystemActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch all required data concurrently
                const [bizRes, jobsRes, coursesRes, usersRes] = await Promise.all([
                    fetch(`${apiUrl}/api/businesses`, { headers }).catch(() => ({ ok: false })),
                    fetch(`${apiUrl}/api/jobs`, { headers }).catch(() => ({ ok: false })),
                    fetch(`${apiUrl}/api/courses`, { headers }).catch(() => ({ ok: false })),
                    fetch(`${apiUrl}/api/users`, { headers }).catch(() => ({ ok: false }))
                ]);

                const bizData = bizRes.ok ? await bizRes.json() : [];
                const jobsData = jobsRes.ok ? await jobsRes.json() : [];
                const coursesData = coursesRes.ok ? await coursesRes.json() : [];
                const usersData = usersRes.ok ? await usersRes.json() : [];

                // 1. Calculate Exact Stats
                const activeJobs = Array.isArray(jobsData) ? jobsData.filter(j => j.status === 'Active') : [];
                const activeCourses = Array.isArray(coursesData) ? coursesData.filter(c => c.status === 'Active') : [];
                const validUsers = Array.isArray(usersData) ? usersData : [];
                const validBiz = Array.isArray(bizData) ? bizData : [];

                setCounts({
                    businesses: validBiz.length,
                    jobs: activeJobs.length,
                    courses: activeCourses.length,
                    users: validUsers.length
                });

                // 2. Process Recent Registrations (Latest 5 Users)
                const sortedUsers = [...validUsers].sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
                setRecentUsers(sortedUsers.slice(0, 5));

                // 3. Synthesize System Activity (Newest Business, Job, Course)
                const sortedBiz = [...validBiz].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                const sortedJobs = [...jobsData].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                const sortedCourses = [...coursesData].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

                const activities = [];
                if (sortedBiz.length > 0) {
                    activities.push({ id: `biz-${sortedBiz[0].id}`, action: 'New business registered', subject: sortedBiz[0].name, date: sortedBiz[0].created_at, link: '/admin-dashboard/directory' });
                }
                if (sortedJobs.length > 0) {
                    activities.push({ id: `job-${sortedJobs[0].id}`, action: 'New job posted', subject: sortedJobs[0].title, date: sortedJobs[0].created_at, link: '/admin-dashboard/jobs' });
                }
                if (sortedCourses.length > 0) {
                    activities.push({ id: `crs-${sortedCourses[0].id}`, action: 'Course published', subject: sortedCourses[0].title, date: sortedCourses[0].created_at, link: '/admin-dashboard/academy' });
                }

                // Sort activities by newest date
                activities.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                setSystemActivities(activities);

            } catch (error) {
                console.error("Dashboard Sync Error:", error);
                toast.error("Failed to sync live dashboard metrics.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [apiUrl]);

    const statCards = [
        { title: 'Total Businesses', value: counts.businesses, subtext: 'REGISTERED ECOSYSTEM', icon: <FaBuilding size={20} />, link: '/admin-dashboard/directory' },
        { title: 'Active Jobs', value: counts.jobs, subtext: 'CURRENTLY OPEN', icon: <FaBriefcase size={20} />, link: '/admin-dashboard/jobs' },
        { title: 'Academy Courses', value: counts.courses, subtext: 'PUBLISHED LIVE', icon: <FaGraduationCap size={20} />, link: '/admin-dashboard/academy' },
        { title: 'Total Users', value: counts.users, subtext: 'ACTIVE ACCOUNTS', icon: <FaUsers size={20} />, link: '/admin-dashboard/profile-list' },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 rounded-[32px] bg-[#F5F6FC] min-h-screen">
            <Toaster position="top-right" />

            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#0B0F19] tracking-tight">System Overview</h2>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Live analytics and ecosystem metrics</p>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#4353FF] animate-pulse"></span>
                    <span className="text-[11px] font-black text-[#4353FF] tracking-widest uppercase">Live Sync</span>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {statCards.map((stat, index) => (
                    <Link key={index} to={stat.link} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-40 hover:shadow-[0_8px_30px_rgba(67,83,255,0.1)] hover:-translate-y-1 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#F8F9FE] to-transparent rounded-bl-full -z-0"></div>
                        <div className="flex justify-between items-start z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{stat.title}</p>
                                <h3 className="text-4xl font-black text-[#0B0F19]">
                                    {isLoading ? <div className="h-10 w-16 bg-gray-100 rounded animate-pulse mt-1"></div> : stat.value}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-[#F8F9FE] text-[#4353FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4353FF] group-hover:text-white transition-colors shadow-sm">
                                {stat.icon}
                            </div>
                        </div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between pt-4 border-t border-gray-100 z-10">
                            <span className="flex items-center gap-1.5"><FaCheck className="text-[#4353FF]" size={10} /> {stat.subtext}</span>
                            <FaArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#4353FF]" size={10} />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Two Column Layout for Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Registrations Panel */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-[#0B0F19] tracking-tight">Recent Registrations</h3>
                        <Link to="/admin-dashboard/profile-list" className="text-xs font-bold text-[#4353FF] hover:bg-[#F8F9FE] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                            View All <FaArrowRight size={10} />
                        </Link>
                    </div>

                    <div className="flex-1">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse"></div>)}
                            </div>
                        ) : recentUsers.length > 0 ? (
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left text-sm text-gray-600 min-w-[500px]">
                                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="pb-3 px-2">User Profile</th>
                                            <th className="pb-3 px-2">Role</th>
                                            <th className="pb-3 px-2">Status</th>
                                            <th className="pb-3 px-2 text-right">Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-[#F8F9FE] transition-colors group">
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4353FF] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-[10px] shadow-sm flex-shrink-0">
                                                            {getInitials(user.full_name || user.name)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900 text-sm group-hover:text-[#4353FF] transition-colors">{user.full_name || user.name || 'Unknown User'}</span>
                                                            <span className="text-[10px] text-gray-500 font-medium">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">{user.role || 'User'}</span>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                        {user.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-right text-xs font-medium text-gray-500">
                                                    {formatDate(user.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                                <div className="w-16 h-16 bg-[#F8F9FE] rounded-2xl flex items-center justify-center text-[#4353FF] mb-4 border border-blue-50 shadow-sm">
                                    <FaRegUser size={24} />
                                </div>
                                <h4 className="text-base font-black text-gray-900">No users found</h4>
                                <p className="text-xs text-gray-500 mt-1.5 font-medium">New registrations will automatically appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Activity Panel */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-[#0B0F19] tracking-tight">System Activity</h3>
                    </div>

                    <div className="flex-1">
                        {isLoading ? (
                            <div className="space-y-5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse shrink-0"></div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse"></div>
                                            <div className="h-2 w-1/2 bg-gray-50 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : systemActivities.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-gray-100">
                                {systemActivities.map((activity, index) => (
                                    <div key={activity.id} className="relative flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#4353FF] text-[#4353FF] flex items-center justify-center flex-shrink-0 z-10 shadow-sm group-hover:bg-[#4353FF] group-hover:text-white transition-colors">
                                            {activity.id.startsWith('biz') && <FaBuilding size={14} />}
                                            {activity.id.startsWith('job') && <FaBriefcase size={14} />}
                                            {activity.id.startsWith('crs') && <FaGraduationCap size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <h4 className="text-sm font-bold text-[#0B0F19] leading-tight mb-1">{activity.action}</h4>
                                            <p className="text-xs text-gray-500 font-medium truncate mb-2">{activity.subject}</p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                                                    <FaClock size={10} /> {formatDate(activity.date)}
                                                </span>
                                                <Link to={activity.link} className="text-[10px] font-black text-[#4353FF] bg-[#F8F9FE] px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors uppercase tracking-widest">
                                                    View Entity
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                                <p className="text-sm font-bold text-gray-400">No recent activity detected.</p>
                            </div>
                        )}
                    </div>

                    {!isLoading && systemActivities.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5"><FaCheck className="text-emerald-500" /> All systems operational</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboardCom;