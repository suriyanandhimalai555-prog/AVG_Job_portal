import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {

    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-[#2A45C2] text-white hover:bg-blue-800 focus:ring-[#2A45C2] shadow-sm',
        secondary: 'bg-blue-50 text-[#2A45C2] hover:bg-blue-100 focus:ring-blue-200',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-[#2A45C2]',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;