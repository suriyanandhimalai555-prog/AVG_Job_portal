import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaBars, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import Shimmer from '../ui/Shimmer';

const Navbar = ({ toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [userFullName, setUserFullName] = useState('User');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate a brief load to display the Shimmer effect 
        const timer = setTimeout(() => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    if (user && user.fullName) {
                        setUserFullName(user.fullName);
                    }
                } catch (error) { }
            }
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getPageName = () => {
        const path = location.pathname;
        if (path === '/user-dashboard') return 'Dashboard';
        if (path.includes('/directory')) return 'Business Directory';
        if (path.includes('/jobs')) return 'Career Portal';
        if (path.includes('/academy')) return 'Training Academy';
        if (path.includes('/refer')) return 'Referrals';
        if (path.includes('/profile')) return 'My Profile';
        return 'Dashboard';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-[#E7E9F7] sticky top-0 z-30 h-[72px] shadow-[0_2px_16px_rgba(30,41,89,0.03)] transition-all">
            <div className="flex items-center justify-between h-full px-4 md:px-8">

                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => toggleSidebar(true)}
                        className="md:hidden p-2 text-gray-500 hover:text-[#141B3C] hover:bg-[#F8F9FE] rounded-xl transition-colors focus:outline-none"
                    >
                        <FaBars size={20} />
                    </button>

                    <div className="hidden sm:flex items-center">
                        {isLoading ? (
                            <Shimmer className="w-40 h-6 rounded-md bg-gray-200" />
                        ) : (
                            <h1 className="text-xl font-black text-[#0B0F19] tracking-tight">
                                {getPageName()}
                            </h1>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    {isLoading ? (
                        <>
                            <Shimmer className="hidden md:block w-24 h-7 rounded-full bg-gray-200" />
                            <div className="flex items-center gap-3 p-1.5 pr-3">
                                <Shimmer className="w-9 h-9 rounded-full bg-gray-200" />
                                <div className="hidden md:flex flex-col items-start gap-1 mt-0.5">
                                    <Shimmer className="w-20 h-3 rounded bg-gray-200" />
                                    <Shimmer className="w-12 h-2 rounded bg-gray-200" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="hidden md:flex px-4 py-1.5 rounded-full bg-[#EEF1FE] items-center gap-2 border-0 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4353FF] animate-pulse"></span>
                                <span className="text-[10px] font-black text-[#2A45C2] tracking-widest uppercase">Verified</span>
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-[#F8F9FE] border border-transparent hover:border-[#E7E9F7] transition-all focus:outline-none"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#5B4FE0] text-white flex items-center justify-center font-black shadow-md text-sm uppercase tracking-wider">
                                        {getInitials(userFullName)}
                                    </div>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-extrabold text-[#0B0F19] leading-none">{userFullName}</span>
                                        <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Settings</span>
                                    </div>
                                    <FaChevronDown className="hidden md:block text-gray-400 text-xs ml-1" />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E7E9F7] py-2 z-50 animate-fade-in-up">
                                        <div className="px-5 py-4 border-b border-[#E7E9F7] mb-1 md:hidden bg-[#F8F9FE] mx-2 rounded-xl">
                                            <p className="text-sm font-black text-[#0B0F19] truncate">{userFullName}</p>
                                            <p className="text-[10px] font-bold text-[#2A45C2] mt-1 uppercase tracking-widest">Active Account</p>
                                        </div>

                                        <div className="px-2 space-y-1">
                                            <Link
                                                to="/user-dashboard/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-[#EEF1FE] hover:text-[#2A45C2] rounded-xl transition-colors w-full"
                                            >
                                                <FaUser className="text-[#2A45C2]" /> My Profile
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full text-left"
                                            >
                                                <FaSignOutAlt /> Secure Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;