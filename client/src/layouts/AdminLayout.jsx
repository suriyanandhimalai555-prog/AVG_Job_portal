import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminNavbar toggleSidebar={setIsSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;