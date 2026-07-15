import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaChartPie,
    FaAddressBook,
    FaBriefcase,
    FaGraduationCap,
    FaTimes,
    FaCog
} from 'react-icons/fa';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: 'Overview', path: '/admin-dashboard', icon: <FaChartPie /> },
        { name: 'Manage Directory', path: '/admin-dashboard/directory', icon: <FaAddressBook /> },
        { name: 'Manage Jobs', path: '/admin-dashboard/jobs', icon: <FaBriefcase /> },
        { name: 'Manage Academy', path: '/admin-dashboard/academy', icon: <FaGraduationCap /> },
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
                            alt="AVG Admin Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Admin Portal</h2>
                    </div>

                    <button
                        onClick={() => toggleSidebar(false)}
                        className="md:hidden p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-4 pb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                        Administration
                    </p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin-dashboard'}
                            onClick={() => toggleSidebar(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 group ${isActive
                                    ? 'bg-[#2A45C2] text-white shadow-md shadow-blue-200/50'
                                    : 'text-gray-500 hover:bg-blue-50 hover:text-[#2A45C2]'
                                }`
                            }
                        >
                            <span className={`text-lg transition-transform duration-200 group-hover:scale-110`}>
                                {item.icon}
                            </span>
                            <span className="font-semibold text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default AdminSidebar;