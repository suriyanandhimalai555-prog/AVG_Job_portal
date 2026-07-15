import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/user/Navbar';
import Sidebar from '../components/user/Sidebar';

const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = (state) => {
    setIsSidebarOpen(state);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Main content area where nested routes will render */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;