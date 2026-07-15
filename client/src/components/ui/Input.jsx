import React from 'react';

const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className={`flex flex-col w-full ${className}`}>
            {label && (
                <label className="mb-1.5 text-sm font-bold text-gray-700">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                    ${error
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-[#2A45C2] focus:ring-[#2A45C2]/20'
                    }`}
                {...props}
            />

            {error && <span className="mt-1.5 text-xs font-semibold text-red-500">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;