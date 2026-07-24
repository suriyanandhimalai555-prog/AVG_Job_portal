import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link, NavLink } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChevronDown, FaHome, FaAddressBook, FaBriefcase, FaGraduationCap, FaUserPlus, FaBell } from 'react-icons/fa';
import Shimmer from '../ui/Shimmer';
import SearchBar from './SearchBar';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // User & Menu Drawer State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

    // Updated States for Profile Data
    const [userFullName, setUserFullName] = useState('User');
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const dropdownRef = useRef(null);

    const navLinks = [
        { name: 'Dashboard', path: '/user-dashboard', icon: <FaHome /> },
        { name: 'Directory', path: '/user-dashboard/directory', icon: <FaAddressBook /> },
        { name: 'Jobs', path: '/user-dashboard/jobs', icon: <FaBriefcase /> },
        { name: 'Academy', path: '/user-dashboard/academy', icon: <FaGraduationCap /> },
        { name: 'Referrals', path: '/user-dashboard/refer', icon: <FaUserPlus /> }
    ];

    // Fetch user details from Database to guarantee Profile Picture is loaded
    useEffect(() => {
        const fetchUserData = async () => {
            let nameFound = 'User';
            let picFound = null;

            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            // 1. Quick optimistic load from localStorage or Token for instant UI rendering
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    if (user && (user.fullName || user.name)) nameFound = user.fullName || user.name;
                    if (user && user.profile_picture) picFound = user.profile_picture;
                } catch (error) { console.error("Failed to parse user data:", error); }
            }
            if (!picFound && token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.profile_picture) picFound = payload.profile_picture;
                    if (nameFound === 'User' && (payload.fullName || payload.name)) nameFound = payload.fullName || payload.name;
                } catch (error) { console.error("Failed to parse token:", error); }
            }

            setUserFullName(nameFound);
            setUserProfilePic(picFound);

            // 2. Fetch the latest accurate data directly from the API 
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userId = payload.id;

                    const res = await fetch(`${apiUrl}/api/users`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        const usersList = await res.json();
                        const currentUser = usersList.find(u => u.id === userId);

                        if (currentUser) {
                            const actualName = currentUser.full_name || currentUser.name || nameFound;
                            setUserFullName(actualName);

                            // If the backend has a profile picture, override the state
                            if (currentUser.profile_picture) {
                                setUserProfilePic(currentUser.profile_picture);

                                // Sync local storage for consistency
                                if (storedUser) {
                                    const userObj = JSON.parse(storedUser);
                                    userObj.profile_picture = currentUser.profile_picture;
                                    localStorage.setItem('user', JSON.stringify(userObj));
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch latest user data:", error);
                }
            }
            setIsLoading(false);
        };

        fetchUserData();

        // Listen for storage changes across tabs
        window.addEventListener('storage', fetchUserData);

        return () => {
            window.removeEventListener('storage', fetchUserData);
        };
    }, [location.pathname, apiUrl]); // Trigger refetch if user navigates away from profile page

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
            <header className="bg-white/85 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 h-[64px] shadow-[0_1px_0_rgba(20,27,60,0.03)]">
                <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1400px] mx-auto">

                    {/* Left Section: Logo & Name */}
                    <div className="flex items-center h-full shrink-0">
                        <Link to="/user-dashboard" className="flex items-center gap-2.5 group">
                            {isLoading ? (
                                <>
                                    <Shimmer className="w-9 h-9 rounded-xl" />
                                    <Shimmer className="hidden sm:block w-24 h-5 rounded-md" />
                                </>
                            ) : (
                                <>
                                    <div className="w-9 h-9 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-0.5 p-0.5">
                                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-lg bg-white" />
                                    </div>
                                    <h1 className="text-lg font-black text-gray-900 tracking-tight hidden sm:block group-hover:text-[#2A45C2] transition-colors">Agila Vetri</h1>
                                </>
                            )}
                        </Link>
                    </div>

                    {/* Middle Section: Integrated Search Bar (Sleeker Design) */}
                    <div className="hidden md:flex flex-1 max-w-[600px] mx-4 lg:mx-6">
                        <SearchBar isLoading={isLoading} />
                    </div>

                    {/* Right Section: Actions & Profile */}
                    <div className="flex items-center gap-1.5 sm:gap-3 h-full shrink-0">
                        {isLoading ? (
                            <>
                                <Shimmer className="w-9 h-9 rounded-full" />
                                <div className="h-7 w-px bg-gray-200 hidden sm:block mx-1"></div>
                                <Shimmer className="w-9 h-9 rounded-full" />
                            </>
                        ) : (
                            <>
                                {/* Notification Bell */}
                                <button className="relative p-2 text-gray-500 hover:text-[#2A45C2] hover:bg-blue-50 rounded-full transition-all focus:outline-none hidden sm:block">
                                    <FaBell size={17} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                                </button>

                                <div className="relative h-full flex items-center ml-0.5 sm:ml-0" ref={dropdownRef}>
                                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-full hover:bg-gray-100/80 border border-transparent hover:border-gray-200/80 transition-all focus:outline-none group">

                                        {/* Dynamic User Avatar using fetched Profile Picture */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] text-white flex items-center justify-center font-bold text-xs shadow-md border border-white/40 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                                            {userProfilePic ? (
                                                <img src={userProfilePic} alt={userFullName} className="w-full h-full object-cover" />
                                            ) : (
                                                getInitials(userFullName)
                                            )}
                                        </div>

                                        <div className="hidden md:flex flex-col items-start justify-center text-left max-w-[120px]">
                                            <span className="text-sm font-extrabold text-gray-900 truncate w-full leading-tight">{userFullName}</span>
                                            <span className="text-[10px] text-gray-500 font-semibold tracking-wide">Job Seeker</span>
                                        </div>
                                        <FaChevronDown className={`hidden md:block text-gray-400 text-[10px] ml-0.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#2A45C2]' : 'group-hover:text-[#2A45C2]'}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 top-[58px] w-60 bg-white rounded-2xl shadow-[0_12px_40px_rgba(20,27,60,0.14)] border border-gray-100 py-2.5 z-50 animate-fade-in-up">
                                            <div className="px-4 py-2.5 border-b border-gray-100 mb-1.5 bg-gradient-to-b from-blue-50/50 to-transparent mx-2 rounded-xl">
                                                <p className="text-sm font-black text-gray-900 truncate">{userFullName}</p>
                                                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Manage your account</p>
                                            </div>
                                            <div className="px-2 space-y-1">
                                                <Link to="/user-dashboard/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50/80 hover:text-[#2A45C2] rounded-xl transition-colors w-full group">
                                                    <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                                        <FaUser className="text-gray-500 group-hover:text-[#2A45C2]" size={12} />
                                                    </div>
                                                    My Profile
                                                </Link>
                                                <button onClick={handleLogout} className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors w-full text-left group">
                                                    <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                                        <FaSignOutAlt className="text-gray-500 group-hover:text-red-500" size={12} />
                                                    </div>
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Vertical Divider */}
                                <div className="h-7 w-px bg-gray-200 hidden sm:block mx-0.5"></div>

                                {/* Hamburger Menu Toggle */}
                                <button onClick={() => setIsMenuDrawerOpen(true)} className="p-2 text-gray-600 hover:text-[#2A45C2] hover:bg-blue-50 rounded-xl transition-all focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
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
                className={`fixed inset-0 bg-[#141B3C]/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isMenuDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={() => setIsMenuDrawerOpen(false)}
            ></div>

            <div
                className={`fixed inset-y-0 right-0 w-[340px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isMenuDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    <h2 className="text-base font-black text-white ml-1 relative">Menu</h2>
                    <button onClick={() => setIsMenuDrawerOpen(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none relative">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1 mt-1.5 hidden-scrollbar">
                    {navLinks.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/user-dashboard'}
                            onClick={() => setIsMenuDrawerOpen(false)}
                            className={({ isActive }) => `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${isActive ? 'bg-blue-50 text-[#2A45C2] shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <span className={`text-base w-5 flex justify-center ${({ isActive }) => isActive ? 'text-[#2A45C2]' : 'text-gray-400'}`}>{item.icon}</span>
                            {item.name}
                        </NavLink>
                    ))}

                    <div className="my-3 border-t border-gray-100 mx-2"></div>

                    <NavLink to="/user-dashboard/profile" onClick={() => setIsMenuDrawerOpen(false)} className={({ isActive }) => `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${isActive ? 'bg-blue-50 text-[#2A45C2] shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <span className="text-base w-5 flex justify-center text-gray-400"><FaUser /></span> My Profile
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all shadow-sm">
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