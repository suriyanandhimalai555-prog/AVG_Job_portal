import React from 'react';
import {
    FaPhoneVolume, FaInbox, FaHeadset, FaUserCheck,
    FaCalendarAlt, FaLifeRing, FaExclamationTriangle,
    FaBriefcase, FaChartBar, FaChartPie
} from 'react-icons/fa';

const AIVoiceAgentOverview = ({ campaignsCount }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4">Platform Overview</h3>

            {/* Main KPI Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Calls", value: "1,284", icon: FaPhoneVolume, c: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Inbound Calls", value: "382", icon: FaInbox, c: "text-teal-600", bg: "bg-teal-50" },
                    { label: "Outbound Calls", value: "902", icon: FaHeadset, c: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Leads Verified", value: "428", icon: FaUserCheck, c: "text-green-600", bg: "bg-green-50" },
                    { label: "Appts Booked", value: "126", icon: FaCalendarAlt, c: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Support Handled", value: "315", icon: FaLifeRing, c: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Escalated Calls", value: "18", icon: FaExclamationTriangle, c: "text-red-600", bg: "bg-red-50" },
                    { label: "Recruitment Active", value: campaignsCount || 0, icon: FaBriefcase, c: "text-emerald-600", bg: "bg-emerald-50" }
                ].map((stat, i) => (
                    <div key={i} className="p-4 md:p-5 rounded-2xl border border-[#E7E9F7] bg-white flex items-center gap-4 transition-all hover:shadow-md">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${stat.bg} ${stat.c} flex items-center justify-center font-black text-lg md:text-xl shrink-0`}>
                            <stat.icon />
                        </div>
                        <div>
                            <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl md:text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Completion Rate Chart */}
                <div className="border border-[#E7E9F7] rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaChartBar className="text-[#2A45C2]" /> Call Completion Rate
                    </h4>
                    <div className="w-full bg-gray-100 rounded-full h-3 md:h-4 mb-2 overflow-hidden flex">
                        <div className="bg-green-500 h-3 md:h-4" style={{ width: '78%' }}></div>
                        <div className="bg-amber-400 h-3 md:h-4" style={{ width: '15%' }}></div>
                        <div className="bg-red-500 h-3 md:h-4" style={{ width: '7%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mt-3">
                        <span className="text-green-600">78% Success</span>
                        <span className="text-amber-500">15% Voicemail</span>
                        <span className="text-red-500">7% Failed</span>
                    </div>
                </div>

                {/* Intent Detection Chart */}
                <div className="border border-[#E7E9F7] rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaChartPie className="text-[#2A45C2]" /> AI Intent Detection
                    </h4>
                    <div className="space-y-3">
                        {['Support (45%)', 'Booking (30%)', 'Verification (15%)', 'Other (10%)'].map((label, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-full bg-gray-100 rounded-full h-2 flex-1">
                                    <div className="bg-[#2A45C2] h-2 rounded-full" style={{ width: label.match(/\d+/)[0] + '%' }}></div>
                                </div>
                                <span className="text-xs font-bold text-gray-600 w-24 text-right">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIVoiceAgentOverview;