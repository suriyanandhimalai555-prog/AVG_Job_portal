import React, { useState, useEffect } from 'react';
import { FaGift, FaRegCopy, FaShareAlt, FaChartLine, FaCoins, FaStar } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Shimmer from '../../ui/Shimmer';

const UserReferralCom = () => {
    const [stats, setStats] = useState({
        referral_code: '',
        referral_earnings: '0.00',
        total_referrals: '0'
    });
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const shareLink = stats.referral_code ? `${window.location.origin}/register?ref=${stats.referral_code}` : 'Generating link...';

    useEffect(() => { fetchUserStats(); }, []);

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
        <div className="max-w-[1400px] mx-auto space-y-3 p-2 md:p-3 rounded-2xl bg-[#F5F6FC]">
            <Toaster position="top-right" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-3.5">
                <div className="lg:col-span-7 space-y-3 md:space-y-3.5">
                    <div className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-7 md:py-6 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] shadow-lg">
                        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                        <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
                        <div className="pointer-events-none absolute right-24 -bottom-20 w-48 h-48 rounded-full bg-[#F2C14E]/20 blur-2xl" />

                        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <FaGift className="text-white text-3xl drop-shadow-md" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight text-white drop-shadow-sm">Refer & Earn</h1>
                                <p className="text-blue-100 font-medium text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
                                    Invite your friends to the ecosystem and earn <strong className="text-white">AED 50</strong> for every successful, verified referral.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E7E9F7] p-4 md:p-5 rounded-2xl shadow-[0_2px_16px_rgba(30,41,89,0.05)] hover:border-[#2A45C2]/20 transition-all hover:shadow-lg">
                        <p className="text-xs font-black text-gray-500 tracking-widest mb-2.5 uppercase">Your Unique Code</p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2A45C2]">
                                    <FaStar size={15} />
                                </div>
                                <span className="block w-full pl-11 pr-4 py-3 text-lg md:text-xl font-black text-gray-900 tracking-widest bg-gray-50 border border-[#E7E9F7] rounded-xl text-center sm:text-left shadow-inner">
                                    {isStatsLoading ? <Shimmer className="w-40 h-8 rounded mx-auto sm:mx-0" /> : stats.referral_code || 'N/A'}
                                </span>
                            </div>
                            <Button onClick={handleCopyCode} disabled={isStatsLoading || !stats.referral_code} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#141B3C] hover:bg-[#2A45C2] text-white border-0 font-bold w-full sm:w-auto flex-shrink-0 disabled:opacity-50 text-sm shadow-md transition-colors">
                                <FaRegCopy size={15} /> Copy Code
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E7E9F7] p-4 md:p-5 rounded-2xl shadow-[0_2px_16px_rgba(30,41,89,0.05)] hover:border-[#2A45C2]/20 transition-all hover:shadow-lg">
                        <p className="text-xs font-black text-gray-500 tracking-widest mb-2.5 uppercase">Share Direct Link</p>
                        <div className="flex flex-col sm:flex-row items-center gap-3 relative">
                            {isStatsLoading && (
                                <div className="absolute left-0 top-0 w-full sm:w-[calc(100%-150px)] h-full z-10 bg-gray-50 border border-[#E7E9F7] rounded-xl flex items-center px-4">
                                    <Shimmer className="w-3/4 h-5 rounded" />
                                </div>
                            )}
                            <Input readOnly value={isStatsLoading ? '' : shareLink} className="w-full bg-gray-50 text-gray-600 border-[#E7E9F7] rounded-xl font-bold focus:ring-0 cursor-text py-3 text-sm shadow-inner" />
                            <Button onClick={handleShareLink} disabled={isStatsLoading || !stats.referral_code} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0 font-bold w-full sm:w-auto flex-shrink-0 disabled:opacity-50 text-sm shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5">
                                <FaShareAlt size={15} /> Copy Link
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-3 md:space-y-3.5">
                    <div className="bg-white border border-[#E7E9F7] p-5 rounded-2xl shadow-[0_2px_16px_rgba(30,41,89,0.05)] relative overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500"><FaCoins size={64} className="text-[#D4A017]" /></div>
                        <p className="text-xs font-black text-gray-500 tracking-widest mb-1.5 uppercase relative z-10">Total Earnings</p>
                        <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#D4A017] to-[#F2C14E] drop-shadow-sm mb-1.5 relative z-10">
                            {isStatsLoading ? <Shimmer className="w-48 h-10 rounded mt-2 mb-2" /> : `AED ${stats.referral_earnings}`}
                        </h2>
                        <p className="text-sm font-bold text-gray-400 relative z-10">Ready to withdraw soon</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-[#E7E9F7] p-4 rounded-2xl shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow">
                            <h3 className="text-3xl font-black text-gray-900 mb-1">
                                {isStatsLoading ? <Shimmer className="w-16 h-9 rounded" /> : stats.total_referrals}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Invites</p>
                        </div>
                        <div className="bg-[#EEF1FE] border border-[#2A45C2]/10 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow">
                            <h3 className="text-3xl font-black text-[#2A45C2] mb-1">
                                {isStatsLoading ? <Shimmer className="w-16 h-9 rounded" /> : stats.total_referrals}
                            </h3>
                            <p className="text-[10px] font-bold text-[#2A45C2]/60 uppercase tracking-widest">Successful</p>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E7E9F7] p-4 md:p-5 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 mb-3.5 tracking-tight uppercase border-b border-[#E7E9F7] pb-2.5">How It Works</h3>
                        <ul className="space-y-3.5">
                            {[
                                { step: 1, text: "Share your unique code or link with friends & family" },
                                { step: 2, text: "They register on the platform and complete their profile setup" },
                                { step: 3, text: "You instantly earn AED 50 once their account is verified" }
                            ].map(item => (
                                <li key={item.step} className="flex items-start text-gray-700 text-sm font-bold group">
                                    <span className="mr-3 w-7 h-7 rounded-xl bg-gradient-to-br from-[#2A45C2] to-[#5B4FE0] text-white flex items-center justify-center flex-shrink-0 text-xs shadow-md group-hover:scale-110 transition-transform">{item.step}</span>
                                    <span className="pt-1 leading-relaxed">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserReferralCom;