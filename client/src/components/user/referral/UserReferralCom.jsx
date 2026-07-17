import React, { useState, useEffect } from 'react';
import {
    FaGift,
    FaRegCopy,
    FaShareAlt,
    FaChartLine
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const UserReferralCom = () => {
    const [stats, setStats] = useState({
        referral_code: '',
        referral_earnings: '0.00',
        total_referrals: '0'
    });
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const shareLink = stats.referral_code
        ? `${window.location.origin}/user-register?ref=${stats.referral_code}`
        : 'Generating link...';

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;

            const res = await fetch(`${apiUrl}/api/users/${userId}/stats`);
            if (res.ok) {
                const data = await res.json();
                setStats({
                    referral_code: data.referral_code || '',
                    referral_earnings: parseFloat(data.referral_earnings || 0).toFixed(2),
                    total_referrals: data.total_referrals || '0'
                });
            }
        } catch (error) {
            console.error('Error fetching referral stats:', error);
            toast.error('Could not load referral data.');
        } finally {
            setIsStatsLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (!stats.referral_code) return;
        navigator.clipboard.writeText(stats.referral_code);
        toast.success('Referral code copied to clipboard!');
    };

    const handleShareLink = () => {
        if (!stats.referral_code) return;
        navigator.clipboard.writeText(shareLink);
        toast.success('Registration link copied to clipboard!');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl">
            <Toaster position="top-right" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                <div className="lg:col-span-7 space-y-4 md:space-y-5">

                    <div className="bg-[#2A45C2] text-white p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-5 rounded-full"></div>
                        <div className="relative z-10">
                            <FaGift className="text-blue-100 mb-4" size={28} />
                            <h1 className="text-2xl font-extrabold mb-1.5 tracking-tight">Refer & Earn</h1>
                            <p className="text-blue-100 text-sm font-medium">
                                Invite your friends and earn AED 50 for every successful referral.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-[#EBEBEB] p-5 md:p-6 rounded-2xl shadow-sm">
                        <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 uppercase">Your Referral Code</p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-xl md:text-2xl font-extrabold text-[#2A45C2] tracking-wider bg-blue-50 px-4 py-2 rounded-lg border border-[#EBEBEB] min-w-[180px] text-center sm:text-left">
                                {isStatsLoading ? 'Loading...' : stats.referral_code || 'N/A'}
                            </span>
                            <Button
                                onClick={handleCopyCode}
                                disabled={isStatsLoading || !stats.referral_code}
                                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white border border-[#EBEBEB] text-[#2A45C2] hover:bg-blue-50 font-bold w-full sm:w-auto disabled:opacity-50 text-sm shadow-sm"
                            >
                                <FaRegCopy size={14} /> Copy Code
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white border border-[#EBEBEB] p-5 md:p-6 rounded-2xl shadow-sm">
                        <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 uppercase">Share Your Link</p>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Input
                                readOnly
                                value={isStatsLoading ? 'Loading link...' : shareLink}
                                className="w-full bg-white text-gray-600 border-[#EBEBEB] rounded-lg font-medium focus:ring-0 cursor-text py-2.5 text-sm"
                            />
                            <Button
                                onClick={handleShareLink}
                                disabled={isStatsLoading || !stats.referral_code}
                                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#2A45C2] text-white border-0 font-bold w-full sm:w-auto flex-shrink-0 disabled:opacity-50 text-sm shadow-sm"
                            >
                                <FaShareAlt size={14} /> Copy Link
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white border border-[#EBEBEB] p-5 md:p-6 rounded-2xl shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Your Earnings</p>
                            <h2 className="text-3xl font-extrabold text-[#2A45C2]">AED {stats.referral_earnings}</h2>
                            <p className="text-xs font-medium text-gray-500 mt-1">Total Earnings</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 text-[#2A45C2] rounded-xl flex items-center justify-center border border-[#EBEBEB] hidden sm:flex">
                            <FaChartLine size={24} />
                        </div>
                    </div>

                </div>

                <div className="lg:col-span-5 space-y-4 md:space-y-5">

                    <h2 className="text-lg font-extrabold text-gray-900 px-1 pt-1">Referrals Overview</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col justify-center">
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{stats.total_referrals}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Referrals</p>
                        </div>
                        <div className="bg-white border border-[#EBEBEB] p-5 rounded-2xl shadow-sm flex flex-col justify-center">
                            <h3 className="text-3xl font-extrabold text-[#2A45C2] mb-1">{stats.total_referrals}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Success Referrals</p>
                        </div>
                    </div>

                    <div className="bg-white border border-[#EBEBEB] p-6 rounded-2xl shadow-sm">
                        <h3 className="text-md font-extrabold text-gray-900 mb-5 tracking-tight">How it works</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start text-gray-700 text-sm font-medium">
                                <span className="mr-3 w-5 h-5 rounded-full bg-blue-50 text-[#2A45C2] border border-[#EBEBEB] flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                                <span className="pt-0.5">Share your code or link with friends</span>
                            </li>
                            <li className="flex items-start text-gray-700 text-sm font-medium">
                                <span className="mr-3 w-5 h-5 rounded-full bg-blue-50 text-[#2A45C2] border border-[#EBEBEB] flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                                <span className="pt-0.5">They register and complete their profile</span>
                            </li>
                            <li className="flex items-start text-gray-700 text-sm font-medium">
                                <span className="mr-3 w-5 h-5 rounded-full bg-blue-50 text-[#2A45C2] border border-[#EBEBEB] flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
                                <span className="pt-0.5">You earn AED 50 once they're verified</span>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default UserReferralCom;