import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaBars, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa'; // Removed FaBell[cite: 38]
import Badge from '../ui/Badge';

const Navbar = ({ toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [userFullName, setUserFullName] = useState('User Dashboard'); // Default name if not found in local storage

    // Fetch user details on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && user.fullName) {
                    setUserFullName(user.fullName);
                }
            } catch (error) {
                console.error("Failed to parse user data from local storage.");
            }
        }
    }, []);

    // Helper function to extract initials (First and Last name first letters)
    const getInitials = (name) => {
        if (!name) return 'U';
        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) {
            // First letter of first name + First letter of last name
            return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        }
        // If only one name is provided, take the first two letters
        return name.substring(0, 2).toUpperCase();
    };

    // Dynamic page title logic based on the current route[cite: 38]
    const getPageName = () => {
        const path = location.pathname;
        if (path === '/user-dashboard') return 'User Dashboard';
        if (path.includes('/directory')) return 'Business Directory';
        if (path.includes('/jobs')) return 'Job Portal';
        if (path.includes('/academy')) return 'Training Academy';
        if (path.includes('/refer')) return 'Referral Program';
        if (path.includes('/profile')) return 'My Profile';
        return 'Dashboard'; 
    };

    // Close dropdown when clicking outside[cite: 38]
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Logout logic[cite: 38]
    const handleLogout = () => {
        // Remove token and user data from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        navigate('/user-login');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 h-20 transition-all">
            <div className="flex items-center justify-between h-full px-4 md:px-8">
                
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => toggleSidebar(true)}
                        className="md:hidden p-2 text-gray-500 hover:text-[#2A45C2] hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                    >
                        <FaBars size={22} />
                    </button>

                    {/* Dynamic Page Name[cite: 38] */}
                    <div className="hidden sm:flex items-center">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            {getPageName()}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-5">
                    
                    {/* Removed the notification bell and divider completely */}

                    {/* Profile Dropdown Wrapper[cite: 38] */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-colors pr-3 border border-transparent hover:border-gray-200 text-left focus:outline-none"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2A45C2] border-2 border-blue-200 flex items-center justify-center font-bold shadow-sm uppercase tracking-wider">
                                {getInitials(userFullName)}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-bold text-gray-700 leading-tight mb-0.5">
                                    {userFullName}
                                </p>
                                <Badge variant="primary" className="text-[10px] px-2 py-0">Member</Badge>
                            </div>
                            <FaChevronDown className={`hidden md:block text-gray-400 text-xs ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu[cite: 38] */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in-down">
                                <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                                    <p className="text-sm font-bold text-gray-900">{userFullName}</p>
                                    <p className="text-xs text-gray-500">Member</p>
                                </div>
                                
                                <Link 
                                    to="/user-dashboard/profile"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#2A45C2] transition-colors w-full"
                                >
                                    <FaUser className="text-gray-400" /> My Profile
                                </Link>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                >
                                    <FaSignOutAlt className="text-red-400" /> Log out
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Navbar;