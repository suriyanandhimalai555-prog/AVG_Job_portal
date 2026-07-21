import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link, NavLink } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChevronDown, FaHome, FaAddressBook, FaBriefcase, FaGraduationCap, FaUserPlus, FaBell } from 'react-icons/fa';
import Shimmer from '../ui/Shimmer';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // User & Menu Drawer State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
    const [userFullName, setUserFullName] = useState('User');
    const [isLoading, setIsLoading] = useState(true);

    // Search Bar State
    const [expDropdownOpen, setExpDropdownOpen] = useState(false);
    const [selectedExp, setSelectedExp] = useState('');

    const dropdownRef = useRef(null);
    const expRef = useRef(null);

    const navLinks = [
        { name: 'Dashboard', path: '/user-dashboard', icon: <FaHome /> },
        { name: 'Directory', path: '/user-dashboard/directory', icon: <FaAddressBook /> },
        { name: 'Jobs', path: '/user-dashboard/jobs', icon: <FaBriefcase /> },
        { name: 'Academy', path: '/user-dashboard/academy', icon: <FaGraduationCap /> },
        { name: 'Referrals', path: '/user-dashboard/refer', icon: <FaUserPlus /> }
    ];

    const experiences = [
        'Fresher (less than 1 year)',
        '1 year',
        '2 years',
        '3 years',
        '4 years',
        '5 years'
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    if (user && user.fullName) setUserFullName(user.fullName);
                } catch (error) { }
            }
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (expRef.current && !expRef.current.contains(event.target)) {
                setExpDropdownOpen(false);
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
        <>
            {/* Modern Glassmorphic Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 h-[76px]">
                <div className="flex items-center justify-between h-full px-4 lg:px-8 max-w-[1400px] mx-auto">

                    {/* Left Section: Logo & Name */}
                    <div className="flex items-center h-full shrink-0">
                        <Link to="/user-dashboard" className="flex items-center gap-3 group">
                            {isLoading ? (
                                <>
                                    <Shimmer className="w-10 h-10 rounded-xl" />
                                    <Shimmer className="hidden sm:block w-28 h-6 rounded-md" />
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-0.5 p-0.5">
                                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-lg bg-white" />
                                    </div>
                                    <h1 className="text-xl font-black text-gray-900 tracking-tight hidden sm:block group-hover:text-blue-700 transition-colors">Agila Vetri</h1>
                                </>
                            )}
                        </Link>
                    </div>

                    {/* Middle Section: Integrated Search Bar (Sleeker Design) */}
                    <div className="hidden md:flex flex-1 max-w-[640px] mx-4 lg:mx-8">
                        {isLoading ? (
                            <Shimmer className="w-full h-[46px] rounded-full" />
                        ) : (
                            <div className="flex w-full items-center bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-full transition-all duration-300 h-[46px] relative shadow-sm">

                                {/* Keyword/Designation Input */}
                                <div className="flex-[2] pl-6 pr-3 h-full flex items-center border-r border-gray-200/80">
                                    <input
                                        type="text"
                                        placeholder="Skills, Designations, Companies..."
                                        className="w-full text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent font-medium"
                                    />
                                </div>

                                {/* Experience Dropdown */}
                                <div
                                    className="relative h-full flex items-center border-r border-gray-200/80 cursor-pointer min-w-[130px] px-4 hover:bg-gray-100/50 transition-colors"
                                    onClick={() => setExpDropdownOpen(!expDropdownOpen)}
                                    ref={expRef}
                                >
                                    <span className={`text-sm font-medium flex-1 truncate ${selectedExp ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {selectedExp || 'Experience'}
                                    </span>
                                    <FaChevronDown className={`text-gray-400 text-[10px] ml-2 shrink-0 transition-transform duration-300 ${expDropdownOpen ? 'rotate-180' : ''}`} />

                                    {expDropdownOpen && (
                                        <div className="absolute top-[54px] left-0 w-52 bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] py-2 z-50 animate-fade-in-up">
                                            {experiences.map(exp => (
                                                <div
                                                    key={exp}
                                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 cursor-pointer transition-colors"
                                                    onClick={() => { setSelectedExp(exp); setExpDropdownOpen(false); }}
                                                >
                                                    {exp}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Location Input */}
                                <div className="flex-1 pl-4 pr-2 h-full flex items-center min-w-[120px]">
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        className="w-full text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent font-medium"
                                    />
                                </div>

                                {/* Search Button */}
                                <div className="pr-1.5 pl-1 h-full flex items-center">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-[36px] text-sm font-bold flex items-center transition-colors shadow-md hover:shadow-lg tracking-wide">
                                        Search
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Section: Actions & Profile */}
                    <div className="flex items-center gap-2 sm:gap-4 h-full shrink-0">
                        {isLoading ? (
                            <>
                                <Shimmer className="w-10 h-10 rounded-full" />
                                <div className="h-8 w-px bg-gray-200 hidden sm:block mx-1"></div>
                                <Shimmer className="w-10 h-10 rounded-full" />
                            </>
                        ) : (
                            <>
                                {/* Notification Bell */}
                                <button className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all focus:outline-none hidden sm:block">
                                    <FaBell size={18} />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                                </button>

                                <div className="relative h-full flex items-center ml-1 sm:ml-0" ref={dropdownRef}>
                                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-gray-100/80 border border-transparent hover:border-gray-200/80 transition-all focus:outline-none group">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-inner border border-blue-200/50 group-hover:scale-105 transition-transform">
                                            {getInitials(userFullName)}
                                        </div>
                                        <div className="hidden md:flex flex-col items-start justify-center text-left max-w-[130px]">
                                            <span className="text-sm font-extrabold text-gray-900 truncate w-full">{userFullName}</span>
                                            <span className="text-[11px] text-gray-500 font-semibold tracking-wide">Job Seeker</span>
                                        </div>
                                        <FaChevronDown className={`hidden md:block text-gray-400 text-[10px] ml-1 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-blue-600'}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 top-[70px] w-64 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 py-3 z-50 animate-fade-in-up">
                                            <div className="px-5 py-3 border-b border-gray-100 mb-2 bg-gradient-to-b from-gray-50/50 to-transparent mx-2 rounded-xl">
                                                <p className="text-base font-black text-gray-900 truncate">{userFullName}</p>
                                                <p className="text-xs text-gray-500 font-semibold mt-1">Manage your account</p>
                                            </div>
                                            <div className="px-2 space-y-1">
                                                <Link to="/user-dashboard/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 rounded-xl transition-colors w-full group">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                                        <FaUser className="text-gray-500 group-hover:text-blue-600" />
                                                    </div>
                                                    My Profile
                                                </Link>
                                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors w-full text-left group">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                                        <FaSignOutAlt className="text-gray-500 group-hover:text-red-500" />
                                                    </div>
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Vertical Divider */}
                                <div className="h-8 w-px bg-gray-200 hidden sm:block mx-1"></div>

                                {/* Hamburger Menu Toggle */}
                                <button onClick={() => setIsMenuDrawerOpen(true)} className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Right-to-Left Sliding Menu Drawer */}
            <div
                className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isMenuDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={() => setIsMenuDrawerOpen(false)}
            ></div>

            <div
                className={`fixed inset-y-0 right-0 w-[380px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isMenuDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900 ml-1">Menu</h2>
                    <button onClick={() => setIsMenuDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 mt-2 hidden-scrollbar">
                    {navLinks.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/user-dashboard'}
                            onClick={() => setIsMenuDrawerOpen(false)}
                            className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-bold transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <span className={`text-lg w-6 flex justify-center ${({ isActive }) => isActive ? 'text-blue-600' : 'text-gray-400'}`}>{item.icon}</span>
                            {item.name}
                        </NavLink>
                    ))}

                    <div className="my-4 border-t border-gray-100 mx-2"></div>

                    <NavLink to="/user-dashboard/profile" onClick={() => setIsMenuDrawerOpen(false)} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-bold transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <span className="text-lg w-6 flex justify-center text-gray-400"><FaUser /></span> My Profile
                    </NavLink>
                </nav>

                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-3 text-[15px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all shadow-sm">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            <style jsx>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.2s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .hidden-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hidden-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default Navbar;