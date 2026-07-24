import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import Shimmer from '../ui/Shimmer';

const SearchBar = ({ isLoading }) => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Search Bar State
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [expDropdownOpen, setExpDropdownOpen] = useState(false);
    const [selectedExp, setSelectedExp] = useState('');
    const [experiences, setExperiences] = useState(['Fresher', '1 - 2 years', '2 - 5 years']); // Fallbacks

    const expRef = useRef(null);

    // Fetch dynamic experiences from the database
    useEffect(() => {
        const fetchDynamicExperiences = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/jobs`);
                if (res.ok) {
                    const data = await res.json();
                    const activeJobs = data.filter(job => job.status === 'Active');

                    // Extract unique experiences from jobs, filter out null/empty, and sort them
                    const uniqueExps = [...new Set(activeJobs.map(job => job.experience).filter(Boolean))].sort();

                    if (uniqueExps.length > 0) {
                        setExperiences(uniqueExps);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch experiences for SearchBar:', error);
            }
        };

        fetchDynamicExperiences();
    }, [apiUrl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (expRef.current && !expRef.current.contains(event.target)) {
                setExpDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (keyword.trim()) params.append('q', keyword.trim());
        if (location.trim()) params.append('loc', location.trim());
        if (selectedExp) params.append('exp', selectedExp);

        // Navigate to jobs page with the search queries attached
        navigate(`/user-dashboard/jobs?${params.toString()}`);
    };

    const handleClear = () => {
        setKeyword('');
        setLocation('');
        setSelectedExp('');
        navigate('/user-dashboard/jobs'); // Clears URL params globally
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    if (isLoading) {
        return <Shimmer className="w-full h-[40px] rounded-full" />;
    }

    const hasActiveInput = keyword || location || selectedExp;

    return (
        <div className="flex w-full items-center bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus-within:bg-white focus-within:border-[#2A45C2]/40 focus-within:ring-4 focus-within:ring-[#2A45C2]/10 rounded-full transition-all duration-300 h-[40px] relative shadow-sm">
            {/* Keyword/Designation Input */}
            <div className="flex-[2] pl-5 pr-3 h-full flex items-center border-r border-gray-200/80">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Skills, Designations, Companies..."
                    className="w-full text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent font-medium"
                />
            </div>

            {/* Experience Dropdown */}
            <div
                className="relative h-full flex items-center border-r border-gray-200/80 cursor-pointer min-w-[122px] px-3.5 hover:bg-gray-100/50 transition-colors"
                onClick={() => setExpDropdownOpen(!expDropdownOpen)}
                ref={expRef}
            >
                <span className={`text-sm font-medium flex-1 truncate ${selectedExp ? 'text-gray-800' : 'text-gray-400'}`}>
                    {selectedExp || 'Experience'}
                </span>
                <FaChevronDown className={`text-gray-400 text-[10px] ml-2 shrink-0 transition-transform duration-300 ${expDropdownOpen ? 'rotate-180' : ''}`} />

                {expDropdownOpen && (
                    <div className="absolute top-[48px] left-0 w-52 bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgba(20,27,60,0.1)] py-2 z-50 animate-fade-in-up max-h-[300px] overflow-y-auto">
                        <div
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            onClick={() => { setSelectedExp(''); setExpDropdownOpen(false); }}
                        >
                            Any Experience
                        </div>
                        {experiences.map(exp => (
                            <div
                                key={exp}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#2A45C2] cursor-pointer transition-colors"
                                onClick={() => { setSelectedExp(exp); setExpDropdownOpen(false); }}
                            >
                                {exp}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Location Input */}
            <div className="flex-1 pl-3.5 pr-2 h-full flex items-center min-w-[110px]">
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Location"
                    className="w-full text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent font-medium"
                />
            </div>

            {/* Clear Button */}
            {hasActiveInput && (
                <div className="flex items-center px-1">
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-red-500 p-1.5 transition-colors rounded-full hover:bg-red-50"
                        title="Clear Search"
                    >
                        <FaTimes size={12} />
                    </button>
                </div>
            )}

            {/* Search Button */}
            <div className="pr-1.5 pl-1 h-full flex items-center">
                <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] hover:shadow-lg text-white rounded-full px-5 h-[32px] text-sm font-bold flex items-center transition-all shadow-md hover:-translate-y-0.5 tracking-wide"
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default SearchBar;