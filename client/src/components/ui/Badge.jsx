import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700 border border-gray-200',
        primary: 'bg-blue-50 text-[#2A45C2] border border-blue-100',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        danger: 'bg-red-50 text-red-700 border border-red-100',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;