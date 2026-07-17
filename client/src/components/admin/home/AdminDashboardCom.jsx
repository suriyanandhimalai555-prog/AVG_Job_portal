import React from 'react';
import {
    FaBuilding,
    FaBriefcase,
    FaGraduationCap,
    FaUsers,
    FaArrowDown,
    FaCheck,
    FaRegUser
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboardCom = () => {
    const stats = [
        { title: 'Total Businesses', value: '156', subtext: 'REGISTERED ECOSYSTEM', icon: <FaBuilding size={16} /> },
        { title: 'Active Jobs', value: '84', subtext: 'CURRENTLY OPEN', icon: <FaBriefcase size={16} /> },
        { title: 'Academy Courses', value: '24', subtext: 'PUBLISHED LIVE', icon: <FaGraduationCap size={16} /> },
        { title: 'Total Users', value: '1,240', subtext: 'ACTIVE ACCOUNTS', icon: <FaUsers size={16} /> },
    ];

    const recentActivities = [
        { id: 1, action: 'New business registered', subject: 'Apex Consulting', date: '02 Jul 2026', status: 'Success' },
        { id: 2, action: 'New job posted', subject: 'Senior Developer at ABC IT', date: '01 Jul 2026', status: 'Success' },
        { id: 3, action: 'Course published', subject: 'Digital Marketing Masterclass', date: '30 Jun 2026', status: 'Success' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-1">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back, Super Admin</h2>
                    <p className="text-gray-500 mt-1 text-sm">Your ecosystem account at a glance</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#EBEBEB] bg-blue-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2A45C2] animate-pulse"></span>
                    <span className="text-[11px] font-bold text-[#2A45C2] tracking-wider uppercase">Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-4 md:p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-extrabold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2A45C2] flex items-center justify-center flex-shrink-0 border border-[#EBEBEB]">
                                {stat.icon}
                            </div>
                        </div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mt-2">
                            {index === 3 && <FaCheck className="text-[#2A45C2]" size={10} />}
                            {stat.subtext}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className="lg:col-span-2 bg-white rounded-xl border border-[#EBEBEB] p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-bold text-gray-900">Recent Registrations</h3>
                        <Link to="/admin-dashboard/directory" className="text-xs font-bold text-[#2A45C2] hover:underline flex items-center gap-1">
                            View all &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 border-b border-[#EBEBEB] pb-2">
                        <span className="col-span-2 md:col-span-1">User</span>
                        <span className="hidden md:block">Mobile</span>
                        <span className="hidden md:block">Role</span>
                        <span className="text-right md:text-left">Joined</span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#2A45C2] mb-3 border border-[#EBEBEB]">
                            <FaRegUser size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">No users yet</h4>
                        <p className="text-xs text-gray-500 mt-1">Users you register via the platform appear here.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#EBEBEB] p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-bold text-gray-900">System Activity</h3>
                        <Link to="/admin-dashboard/settings" className="text-xs font-bold text-[#2A45C2] hover:underline flex items-center gap-1">
                            View all &rarr;
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2A45C2] flex items-center justify-center flex-shrink-0 border border-[#EBEBEB]">
                                    <FaArrowDown size={12} className="transform rotate-45" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-gray-900 truncate">{activity.action}</h4>
                                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">{activity.subject} • {activity.date}</p>
                                </div>
                                <div className="text-[10px] font-bold text-[#2A45C2] bg-blue-50 px-2 py-1 rounded border border-[#EBEBEB]">
                                    {activity.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default  AdminDashboardCom;