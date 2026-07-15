import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import Badge from '../ui/Badge';

const AdminNavbar = ({ toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const getPageName = () => {
        const path = location.pathname;
        if (path === '/admin-dashboard') return 'Dashboard Overview';
        if (path.includes('/directory')) return 'Manage Business Directory';
        if (path.includes('/jobs')) return 'Manage Job Portal';
        if (path.includes('/academy')) return 'Manage Training Academy';
        if (path.includes('/settings')) return 'System Settings';
        return 'Admin Portal';
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
        navigate('/admin-login'); // Assuming you will have a separate admin login later
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-20 transition-all">
            <div className="flex items-center justify-between h-full px-4 md:px-8">

                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => toggleSidebar(true)}
                        className="md:hidden p-2 text-gray-500 hover:text-[#2A45C2] hover:bg-blue-50 rounded-md transition-colors focus:outline-none"
                    >
                        <FaBars size={22} />
                    </button>

                    <div className="hidden sm:flex items-center">
                        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                            {getPageName()}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-5">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 p-1 rounded-md hover:bg-gray-50 transition-colors pr-3 border border-transparent hover:border-gray-200 text-left focus:outline-none"
                        >
                            <div className="w-10 h-10 rounded-md bg-[#2A45C2] text-white flex items-center justify-center font-bold shadow-sm">
                                SA
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-bold text-gray-700 leading-tight mb-0.5">Super Admin</p>
                                <Badge variant="success" className="text-[10px] px-2 py-0 rounded-md">Master</Badge>
                            </div>
                            <FaChevronDown className={`hidden md:block text-gray-400 text-xs ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-2 z-50 animate-fade-in-down">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                >
                                    <FaSignOutAlt className="text-red-400" /> Secure Logout
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