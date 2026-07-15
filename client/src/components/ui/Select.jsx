import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const Select = React.forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
    return (
        <div className={`flex flex-col w-full ${className}`}>
            {label && (
                <label className="mb-1.5 text-sm font-bold text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 transition-all text-gray-700
                        ${error
                            ? 'border-red-500 focus:ring-red-200'
                            : 'border-gray-200 focus:border-[#2A45C2] focus:ring-[#2A45C2]/20'
                        }`}
                    {...props}
                >
                    <option value="" disabled selected hidden>Select an option</option>
                    {options.map((opt, index) => (
                        <option key={index} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                    <FaChevronDown size={12} />
                </div>
            </div>
            {error && <span className="mt-1.5 text-xs font-semibold text-red-500">{error}</span>}
        </div>
    );
});

Select.displayName = 'Select';
export default Select;