import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

const AdminNavbar = ({ toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const getPageName = () => {
        const path = location.pathname;
        if (path === '/admin-dashboard') return 'Dashboard';
        if (path.includes('/directory')) return 'Directory';
        if (path.includes('/jobs')) return 'Jobs';
        if (path.includes('/academy')) return 'Academy';
        if (path.includes('/settings')) return 'Settings';
        if (path.includes('/profile-list')) return 'Profile List';
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
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
    };

    return (
        <header className="bg-white border-b border-[#EBEBEB] sticky top-0 z-30 h-16 shadow-sm transition-all">
            <div className="flex items-center justify-between h-full px-4 md:px-6">

                <div className="flex items-center gap-3 flex-1">
                    <button
                        onClick={() => toggleSidebar(true)}
                        className="md:hidden p-2 text-gray-600 hover:text-[#2A45C2] hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                    >
                        <FaBars size={20} />
                    </button>

                    <div className="hidden sm:flex items-center">
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                            {getPageName()}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">

                    <div className="hidden md:flex px-3 py-1.5 rounded-full bg-blue-50 items-center gap-2 border border-[#EBEBEB]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2A45C2] animate-pulse"></span>
                        <span className="text-[11px] font-bold text-[#2A45C2] tracking-wider uppercase">Admin</span>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-[#EBEBEB] transition-all focus:outline-none"
                        >
                            <div className="w-9 h-9 rounded-full bg-[#2A45C2] text-white flex items-center justify-center font-bold shadow-sm text-sm tracking-wider">
                                SA
                            </div>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-bold text-gray-800 leading-none">Super Admin</span>
                                <span className="text-[10px] text-gray-500 font-medium mt-1">Master Account</span>
                            </div>
                            <FaChevronDown className="hidden md:block text-gray-400 text-xs ml-1" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#EBEBEB] py-2 z-50 animate-fade-in-up">
                                <div className="px-4 py-3 border-b border-[#EBEBEB] mb-1 md:hidden">
                                    <p className="text-sm font-bold text-gray-800">Super Admin</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Master Account</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                >
                                    <FaSignOutAlt className="text-red-500" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;