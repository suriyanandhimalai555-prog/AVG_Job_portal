import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartPie, FaAddressBook, FaBriefcase, FaGraduationCap, FaTimes, FaSignOutAlt, FaUserShield } from 'react-icons/fa';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: 'Dashboard', path: '/admin-dashboard', icon: <FaChartPie /> },
        { name: 'Directory', path: '/admin-dashboard/directory', icon: <FaAddressBook /> },
        { name: 'Jobs', path: '/admin-dashboard/jobs', icon: <FaBriefcase /> },
        { name: 'Academy', path: '/admin-dashboard/academy', icon: <FaGraduationCap /> },
        { name: 'User List', path: '/admin-dashboard/profile-list', icon: <FaUserShield /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-login';
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-[#0B101E]/60 backdrop-blur-sm z-40 md:hidden" onClick={() => toggleSidebar(false)}></div>}
            
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E7E9F7] flex flex-col transform transition-transform duration-300 md:translate-x-0 md:static shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-[72px] px-6 border-b border-[#E7E9F7] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#141B3C] to-[#2A45C2] rounded-xl flex items-center justify-center p-1 shadow-md">
                            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-lg bg-white" />
                        </div>
                        <h2 className="text-sm font-black text-[#0B0F19] tracking-tight">Agila Vetri Admin</h2>
                    </div>
                    <button onClick={() => toggleSidebar(false)} className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><FaTimes size={16} /></button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin-dashboard'}
                            onClick={() => toggleSidebar(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-sm font-black font-bold ${isActive
                                    ? 'bg-gradient-to-r from-[#141B3C] to-[#2A45C2] text-white shadow-md'
                                    : 'text-gray-500 hover:bg-[#EEF1FE] hover:text-[#2A45C2]'
                                }`
                            }
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-5 border-t border-[#E7E9F7] shrink-0">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-black text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-all">
                        <FaSignOutAlt size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;