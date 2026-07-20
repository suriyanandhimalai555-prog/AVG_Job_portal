import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaHome,
    FaAddressBook,
    FaBriefcase,
    FaGraduationCap,
    FaUserPlus,
    FaUser,
    FaTimes,
    FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: 'Dashboard', path: '/user-dashboard', icon: <FaHome /> },
        { name: 'Business Directory', path: '/user-dashboard/directory', icon: <FaAddressBook /> },
        { name: 'Job Portal', path: '/user-dashboard/jobs', icon: <FaBriefcase /> },
        { name: 'Academy', path: '/user-dashboard/academy', icon: <FaGraduationCap /> },
        { name: 'Referrals', path: '/user-dashboard/refer', icon: <FaUserPlus /> },
        { name: 'My Profile', path: '/user-dashboard/profile', icon: <FaUser /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#0B101E]/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => toggleSidebar(false)}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E7E9F7] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between h-[72px] px-6 border-b border-[#E7E9F7] bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2A45C2] to-[#5B4FE0] rounded-xl flex items-center justify-center p-1 shadow-md">
                            <img
                                src="/logo.jpg"
                                alt="Logo"
                                className="w-full h-full object-contain rounded-lg bg-white"
                            />
                        </div>
                        <h2 className="text-lg font-black text-[#0B0F19] tracking-tight">Agila Vetri</h2>
                    </div>

                    <button
                        onClick={() => toggleSidebar(false)}
                        className="md:hidden p-2 text-gray-400 hover:text-[#0B0F19] hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar bg-[#FDFDFE]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Main Menu</p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/user-dashboard'}
                            onClick={() => toggleSidebar(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-[#141B3C] to-[#2A45C2] text-white font-bold shadow-md'
                                    : 'text-gray-500 hover:bg-[#EEF1FE] hover:text-[#2A45C2] font-semibold'
                                }`
                            }
                        >
                            <span className={`text-[1.1rem] transition-colors ${window.location.pathname === item.path ? 'text-blue-200' : 'text-gray-400 group-hover:text-[#2A45C2]'}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm tracking-wide">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-5 border-t border-[#E7E9F7] bg-white shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2.5 w-full px-4 py-3 text-sm font-bold text-red-500 bg-red-50/50 hover:bg-red-50 border border-red-100 hover:border-red-200 rounded-xl transition-all"
                    >
                        <FaSignOutAlt size={16} />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;