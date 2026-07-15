import React from 'react';
import {
    FaGift,
    FaRegCopy,
    FaShareAlt,
    FaChartLine
} from 'react-icons/fa';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const UserReferralCom = () => {
    return (
        <div className="max-w-6xl mx-auto pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="lg:col-span-7 space-y-6">

                    <div className="bg-[#2A45C2] text-white p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                        <div className="relative z-10">
                            <FaGift className="text-yellow-400 mb-4" size={28} />
                            <h1 className="text-2xl font-bold mb-2">Refer & Earn</h1>
                            <p className="text-blue-100 text-sm md:text-base">
                                Invite your friends and earn AED 50 for every successful referral.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                        <p className="text-xs font-bold text-gray-400 tracking-wider mb-3 uppercase">Your Referral Code</p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-2xl font-extrabold text-gray-900 tracking-widest">
                                AGILARANJIT123
                            </span>
                            <Button className="flex items-center gap-2 px-6 rounded-xl">
                                <FaRegCopy /> Copy
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                        <p className="text-xs font-bold text-gray-400 tracking-wider mb-3 uppercase">Share Your Link</p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Input
                                readOnly
                                value="https://agilavetri.com/ref/AGILARANJIT123"
                                className="w-full bg-gray-50 text-gray-600 border-gray-200"
                            />
                            <Button className="flex items-center gap-2 px-8 rounded-xl w-full sm:w-auto">
                                <FaShareAlt /> Share
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 tracking-wider mb-1 uppercase">Your Earnings</p>
                            <h2 className="text-3xl font-extrabold text-gray-900">AED 1,250.00</h2>
                            <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                            <FaChartLine size={24} />
                        </div>
                    </div>

                </div>

                <div className="lg:col-span-5 space-y-6">

                    <h2 className="text-xl font-bold text-gray-900 px-1">Referrals</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 p-5 md:p-6 rounded-3xl shadow-sm">
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">25</h3>
                            <p className="text-sm text-gray-500 font-medium">Total Referrals</p>
                        </div>
                        <div className="bg-white border border-gray-200 p-5 md:p-6 rounded-3xl shadow-sm">
                            <h3 className="text-3xl font-extrabold text-emerald-600 mb-1">15</h3>
                            <p className="text-sm text-gray-500 font-medium">Successful Referrals</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-6 md:p-8 rounded-3xl">
                        <h3 className="text-lg font-bold text-[#2A45C2] mb-4">How it works</h3>
                        <ul className="space-y-4">
                            <li className="flex text-[#2A45C2] text-sm md:text-base font-medium">
                                <span className="mr-3 text-[#2A45C2]">1.</span>
                                Share your code or link with friends
                            </li>
                            <li className="flex text-[#2A45C2] text-sm md:text-base font-medium">
                                <span className="mr-3 text-[#2A45C2]">2.</span>
                                They register and complete their profile
                            </li>
                            <li className="flex text-[#2A45C2] text-sm md:text-base font-medium">
                                <span className="mr-3 text-[#2A45C2]">3.</span>
                                You earn AED 50 once they're verified
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default UserReferralCom;