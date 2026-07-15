import React from 'react';
import {
    FaBuilding,
    FaBriefcase,
    FaGraduationCap,
    FaUsers,
    FaArrowRight,
    FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboardCom = () => {
    // Dummy statistics for the overview cards
    const stats = [
        { title: 'Total Businesses', value: '156', increase: '+12%', icon: <FaBuilding size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { title: 'Active Jobs', value: '84', increase: '+5%', icon: <FaBriefcase size={20} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
        { title: 'Academy Courses', value: '24', increase: '+2', icon: <FaGraduationCap size={20} />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { title: 'Total Users', value: '1,240', increase: '+18%', icon: <FaUsers size={20} />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    ];

    // Dummy data for recent platform activity
    const recentActivities = [
        { id: 1, action: 'New business registered', subject: 'Apex Consulting', time: '2 hours ago' },
        { id: 2, action: 'New job posted', subject: 'Senior Developer at ABC IT', time: '4 hours ago' },
        { id: 3, action: 'Course published', subject: 'Digital Marketing Masterclass', time: '1 day ago' },
        { id: 4, action: 'New user signup', subject: 'Ramesh Kumar', time: '1 day ago' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Welcome Section */}
            <div className="bg-white p-6 md:p-8 rounded-md border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Welcome back, Super Admin!</h2>
                    <p className="text-gray-500 text-sm mt-1">Here is what is happening across the Agila Vetri Ecosystem today.</p>
                </div>
                <div className="text-right text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-md border border-gray-100">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-md border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-md ${stat.bgColor} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                {stat.increase}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Activity List */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                        <button className="text-sm font-bold text-[#2A45C2] hover:underline">View All</button>
                    </div>
                    <div className="p-5">
                        <ul className="space-y-5">
                            {recentActivities.map((activity) => (
                                <li key={activity.id} className="flex items-start gap-3">
                                    <div className="mt-0.5 text-[#2A45C2]">
                                        <FaCheckCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-800 font-medium">
                                            {activity.action}: <span className="font-bold text-gray-900">{activity.subject}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Quick Actions / Shortcuts */}
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Quick Management</h3>
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                        <Link
                            to="/admin-dashboard/directory"
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-md transition-colors group"
                        >
                            <span className="text-sm font-bold text-gray-700 group-hover:text-[#2A45C2]">Manage Directory</span>
                            <FaArrowRight className="text-gray-400 group-hover:text-[#2A45C2] transition-colors" size={12} />
                        </Link>
                        <Link
                            to="/admin-dashboard/jobs"
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-md transition-colors group"
                        >
                            <span className="text-sm font-bold text-gray-700 group-hover:text-[#2A45C2]">Manage Jobs</span>
                            <FaArrowRight className="text-gray-400 group-hover:text-[#2A45C2] transition-colors" size={12} />
                        </Link>
                        <Link
                            to="/admin-dashboard/academy"
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-md transition-colors group"
                        >
                            <span className="text-sm font-bold text-gray-700 group-hover:text-[#2A45C2]">Manage Academy</span>
                            <FaArrowRight className="text-gray-400 group-hover:text-[#2A45C2] transition-colors" size={12} />
                        </Link>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default AdminDashboardCom;