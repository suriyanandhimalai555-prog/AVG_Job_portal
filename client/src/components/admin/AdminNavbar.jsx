import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSignOutAlt, FaChevronDown, FaUserShield } from 'react-icons/fa';

const AdminNavbar = ({ toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const getPageName = () => {
        const path = location.pathname;
        if (path === '/admin-dashboard') return 'Dashboard';
        if (path.includes('/directory')) return 'Business Directory';
        if (path.includes('/jobs')) return 'Career Portal';
        if (path.includes('/academy')) return 'Training Academy';
        if (path.includes('/profile-list')) return 'User Directory';
        return 'System Management';
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
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E7E9F7] sticky top-0 z-30 h-[72px] shadow-[0_2px_16px_rgba(30,41,89,0.03)] transition-all">
            <div className="flex items-center justify-between h-full px-4 md:px-8">
                <div className="flex items-center gap-4 flex-1">
                    <button onClick={() => toggleSidebar(true)} className="md:hidden p-2 text-gray-500 hover:text-[#0B0F19] hover:bg-gray-50 rounded-xl transition-colors">
                        <FaBars size={20} />
                    </button>
                    <h1 className="text-xl font-black text-[#0B0F19] tracking-tight">{getPageName()}</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF1FE] border border-[#2A45C2]/10 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4353FF] animate-pulse"></span>
                        <span className="text-[10px] font-black text-[#2A45C2] tracking-widest uppercase">Super Admin</span>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-[#F8F9FE] transition-all focus:outline-none">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#141B3C] to-[#2A45C2] text-white flex items-center justify-center font-black shadow-md text-sm uppercase tracking-wider">SA</div>
                            <FaChevronDown className="text-gray-400 text-[10px]" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E7E9F7] py-2 z-50">
                                <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50 w-full transition-all">
                                    <FaSignOutAlt /> Sign Out
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