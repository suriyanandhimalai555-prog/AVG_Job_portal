import React from 'react';
import { Link } from 'react-router-dom';

const DemoCom = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F8FF] p-4 font-sans">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col items-center text-center max-w-lg w-full">
                
                <div className="w-16 h-16 bg-[linear-gradient(135deg,#2B6CF0_0%,#1E40AF_100%)] text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl mb-6 shadow-sm">
                    <img
                        src="/logo.jpg"
                        alt="Agila Vetri Logo"
                        className="w-10 h-10 object-contain rounded-xl"
                    />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                    AGILA VETRI
                </h1>
                <p className="text-sm font-bold text-[#2B6CF0] tracking-widest mb-6 uppercase">
                    Business Ecosystem
                </p>
                <p className="text-base text-gray-500 font-medium mb-8 leading-relaxed">
                    Your one-stop solution for job searching, business directory, and career growth. Please select your portal to continue.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Link 
                        to="/register" 
                        className="flex-1 flex items-center justify-center px-6 py-4 rounded-xl bg-[linear-gradient(135deg,#2B6CF0_0%,#1E40AF_100%)] text-white font-bold text-base transition-all hover:opacity-90 shadow-sm"
                    >
                        User Login
                    </Link>
                    
                    <Link 
                        to="/admin-login" 
                        className="flex-1 flex items-center justify-center px-6 py-4 rounded-xl bg-[#F4F8FF] text-[#2B6CF0] font-bold text-base transition-all hover:bg-blue-50 border border-blue-50"
                    >
                        Admin Login
                    </Link>
                </div>
                
            </div>
        </div>
    );
};

export default DemoCom;