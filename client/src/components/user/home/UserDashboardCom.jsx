import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaBriefcase, FaGraduationCap, FaGift } from 'react-icons/fa';

const UserDashboardCom = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('User');

    const [metrics, setMetrics] = useState({
        jobsApplied: 0,
        coursesTaken: 0,
        referralEarnings: 0
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');

            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                try {
                    const storedUser = JSON.parse(storedUserStr);
                    if (storedUser.fullName || storedUser.name) {
                        setUserName(storedUser.fullName || storedUser.name);
                    }
                } catch (e) { console.error('Local storage parse error:', e); }
            } else if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const name = payload.fullName || payload.name || payload.email?.split('@')[0] || 'User';
                    setUserName(name);
                } catch (e) { console.error('Token parse error:', e); }
            }

            if (!token) return;

            try {
                const payloadBase64 = token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                const userId = decodedPayload.id;

                const res = await fetch(`${apiUrl}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const users = await res.json();
                    const currentUser = users.find(u => u.id === userId);

                    if (currentUser) {
                        setUserName(currentUser.full_name || currentUser.name || 'User');
                        setMetrics(prev => ({
                            ...prev,
                            referralEarnings: currentUser.referral_earnings || 0
                        }));

                        if (storedUserStr) {
                            const updatedLocal = JSON.parse(storedUserStr);
                            updatedLocal.fullName = currentUser.full_name;
                            localStorage.setItem('user', JSON.stringify(updatedLocal));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch live user data for dashboard:', error);
            }
        };

        fetchDashboardData();
    }, [apiUrl]);

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl">

            {/* Welcome Banner */}
            <div className="bg-[#2A45C2] text-white p-5 md:p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm md:text-base text-blue-100 mb-1 font-medium">Welcome back,</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 flex items-center gap-2 tracking-tight capitalize">
                            {userName} <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-xs md:text-sm text-blue-100 opacity-90 font-medium tracking-wide">
                            One App · Many Opportunities — Connect · Learn · Grow · Earn
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-900/20 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                        <span className="text-xs font-bold text-blue-100 tracking-wider uppercase">Online</span>
                    </div>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Jobs Applied</p>
                    <h2 className="text-3xl font-extrabold text-gray-900">{metrics.jobsApplied}</h2>
                </div>

                <div className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Courses</p>
                    <h2 className="text-3xl font-extrabold text-gray-900">{metrics.coursesTaken}</h2>
                </div>

                <div className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Referral Earnings</p>
                    <h2 className="text-3xl font-extrabold text-[#2A45C2]">AED {metrics.referralEarnings}</h2>
                </div>
            </div>

            {/* Explore Ecosystem Cards */}
            <div>
                <h2 className="text-lg font-extrabold text-gray-900 mb-4 px-1">Explore Ecosystem</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div
                        onClick={() => navigate('/user-dashboard/directory')}
                        className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col items-start cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 group"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-[#2A45C2] rounded-xl flex items-center justify-center mb-4 border border-[#EBEBEB] group-hover:bg-[#2A45C2] group-hover:text-white transition-colors">
                            <FaBuilding size={20} />
                        </div>
                        <h3 className="text-md font-bold text-gray-900 mb-1">Business Directory</h3>
                        <p className="text-sm text-gray-500 font-medium">Find trusted businesses</p>
                    </div>

                    <div
                        onClick={() => navigate('/user-dashboard/jobs')}
                        className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col items-start cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 group"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-[#2A45C2] rounded-xl flex items-center justify-center mb-4 border border-[#EBEBEB] group-hover:bg-[#2A45C2] group-hover:text-white transition-colors">
                            <FaBriefcase size={20} />
                        </div>
                        <h3 className="text-md font-bold text-gray-900 mb-1">Job Portal</h3>
                        <p className="text-sm text-gray-500 font-medium">Openings across UAE</p>
                    </div>

                    <div
                        onClick={() => navigate('/user-dashboard/academy')}
                        className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col items-start cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 group"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-[#2A45C2] rounded-xl flex items-center justify-center mb-4 border border-[#EBEBEB] group-hover:bg-[#2A45C2] group-hover:text-white transition-colors">
                            <FaGraduationCap size={22} />
                        </div>
                        <h3 className="text-md font-bold text-gray-900 mb-1">Training Academy</h3>
                        <p className="text-sm text-gray-500 font-medium">Courses & certificates</p>
                    </div>

                    <div
                        onClick={() => navigate('/user-dashboard/refer')}
                        className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col items-start cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 group"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-[#2A45C2] rounded-xl flex items-center justify-center mb-4 border border-[#EBEBEB] group-hover:bg-[#2A45C2] group-hover:text-white transition-colors">
                            <FaGift size={20} />
                        </div>
                        <h3 className="text-md font-bold text-gray-900 mb-1">Refer & Earn</h3>
                        <p className="text-sm text-gray-500 font-medium">Invite friends, earn rewards</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDashboardCom;