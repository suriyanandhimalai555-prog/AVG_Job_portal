import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaHome,
    FaAddressBook,
    FaBriefcase,
    FaGraduationCap,
    FaUserPlus,
    FaUser,
    FaTimes
} from 'react-icons/fa';
import Button from '../ui/Button';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: 'Home', path: '/user-dashboard', icon: <FaHome /> },
        { name: 'Directory', path: '/user-dashboard/directory', icon: <FaAddressBook /> },
        { name: 'Jobs', path: '/user-dashboard/jobs', icon: <FaBriefcase /> },
        { name: 'Academy', path: '/user-dashboard/academy', icon: <FaGraduationCap /> },
        { name: 'Refer', path: '/user-dashboard/refer', icon: <FaUserPlus /> },
        { name: 'Profile', path: '/user-dashboard/profile', icon: <FaUser /> },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => toggleSidebar(false)}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.jpg"
                            alt="AVG Job Portal Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">AVG Job Portal</h2>
                    </div>

                    <button
                        onClick={() => toggleSidebar(false)}
                        className="md:hidden p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-4 pb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                        Main Menu
                    </p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/user-dashboard'}
                            onClick={() => toggleSidebar(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded transition-all duration-200 group ${isActive
                                    ? 'bg-[#2A45C2] text-white shadow-md shadow-blue-200/50'
                                    : 'text-gray-500 hover:bg-blue-50 hover:text-[#2A45C2]'
                                }`
                            }
                        >
                            <span className={`text-lg transition-transform duration-200 group-hover:scale-110`}>
                                {item.icon}
                            </span>
                            <span className="font-semibold">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 m-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 mb-1">Need Help?</h3>
                    <p className="text-xs text-blue-700 mb-3 leading-relaxed">
                        Contact our support team for any dashboard issues.
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                    >
                        Contact Support
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;