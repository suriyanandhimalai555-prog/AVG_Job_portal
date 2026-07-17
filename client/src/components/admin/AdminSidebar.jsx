import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaChartPie,
    FaAddressBook,
    FaBriefcase,
    FaGraduationCap,
    FaTimes,
    FaSignOutAlt,
    FaUser
} from 'react-icons/fa';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: 'Dashboard', path: '/admin-dashboard', icon: <FaChartPie /> },
        { name: 'Directory', path: '/admin-dashboard/directory', icon: <FaAddressBook /> },
        { name: 'Jobs', path: '/admin-dashboard/jobs', icon: <FaBriefcase /> },
        { name: 'Academy', path: '/admin-dashboard/academy', icon: <FaGraduationCap /> },
        { name: 'Profile List', path: '/admin-dashboard/profile-list', icon: <FaUser /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-login';
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => toggleSidebar(false)}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EBEBEB] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static shadow-sm ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-[#EBEBEB]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#2A45C2] rounded-lg flex items-center justify-center p-1 shadow-sm">
                            <img
                                src="/logo.jpg"
                                alt="Logo"
                                className="w-full h-full object-contain rounded-md"
                            />
                        </div>
                        <h2 className="text-lg font-extrabold text-[#2A45C2] tracking-tight">Agila Vetri</h2>
                    </div>

                    <button
                        onClick={() => toggleSidebar(false)}
                        className="md:hidden p-2 text-gray-400 hover:text-[#2A45C2] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin-dashboard'}
                            onClick={() => toggleSidebar(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3.5 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-[#2A45C2] text-white font-bold shadow-md'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-[#2A45C2] font-medium'
                                }`
                            }
                        >
                            <span className={`text-[1.1rem] ${window.location.pathname === item.path ? 'text-blue-200' : 'text-gray-400 group-hover:text-[#2A45C2]'}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#EBEBEB]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 border border-[#EBEBEB] hover:border-red-100 rounded-lg transition-all"
                    >
                        <FaSignOutAlt size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;