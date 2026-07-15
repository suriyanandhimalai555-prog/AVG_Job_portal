import React from 'react';
import { FaBuilding, FaBriefcase, FaGraduationCap, FaGift } from 'react-icons/fa';

const UserDashboardCom = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-8">
            <div className="bg-[#2A45C2] text-white p-6 md:p-8 rounded-xl shadow-md">
                <p className="text-sm md:text-base text-blue-100 mb-1">Welcome back</p>
                <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
                    AVG Ranjith <span className="text-2xl">👋</span>
                </h1>
                <p className="text-xs md:text-sm text-blue-100 opacity-90">
                    One App · Many Opportunities — Connect · Learn · Grow · Earn
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center transition-transform hover:-translate-y-1 duration-200">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">0</h2>
                    <p className="text-sm font-medium text-gray-500">Jobs applied</p>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center transition-transform hover:-translate-y-1 duration-200">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">0</h2>
                    <p className="text-sm font-medium text-gray-500">Courses</p>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center transition-transform hover:-translate-y-1 duration-200">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">AED 1,250</h2>
                    <p className="text-sm font-medium text-gray-500">Referral earnings</p>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-4 px-1">Explore</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-start hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-12 h-12 bg-blue-50 text-[#2A45C2] rounded-xl flex items-center justify-center mb-4">
                            <FaBuilding size={22} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Business Directory</h3>
                        <p className="text-sm text-gray-500">Find trusted businesses</p>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-start hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                            <FaBriefcase size={22} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Job Portal</h3>
                        <p className="text-sm text-gray-500">Openings across UAE</p>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-start hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                            <FaGraduationCap size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Training Academy</h3>
                        <p className="text-sm text-gray-500">Courses & certificates</p>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-start hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-4">
                            <FaGift size={22} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Refer & Earn</h3>
                        <p className="text-sm text-gray-500">Invite friends, earn AED</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardCom;