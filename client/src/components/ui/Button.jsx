import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {

    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]';

    const variants = {
        primary: 'bg-[#2A45C2] text-white hover:bg-[#141B3C] focus:ring-[#2A45C2] shadow-md hover:shadow-lg hover:-translate-y-0.5',
        
        gradient: 'bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white focus:ring-[#5B4FE0] shadow-md hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5',
        
        secondary: 'bg-[#EEF1FE] text-[#2A45C2] hover:bg-[#D9E2FC] focus:ring-[#2A45C2]',
        
        outline: 'border-2 border-[#E7E9F7] text-gray-700 hover:border-[#2A45C2] hover:text-[#2A45C2] hover:bg-gray-50 focus:ring-[#2A45C2]',
        
        ghost: 'bg-transparent text-gray-600 hover:text-[#2A45C2] hover:bg-[#F5F6FC]',
        
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md hover:-translate-y-0.5',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-8 py-3.5 text-base',
        icon: 'p-2.5',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;