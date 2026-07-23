import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/user/Navbar';
import GlobalChatWidget from '../components/user/GlobalChatWidget';

const UserLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] overflow-hidden relative">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
      
      <GlobalChatWidget />
    </div>
  );
};

export default UserLayout;