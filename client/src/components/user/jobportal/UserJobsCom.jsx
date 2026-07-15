import React, { useState } from 'react';
import {
    FaSearch,
    FaBriefcase,
    FaMapMarkerAlt,
    FaStar,
    FaTh,
    FaList
} from 'react-icons/fa';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const UserJobsCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Jobs');
    const [viewMode, setViewMode] = useState('grid');

    const jobs = [
        {
            id: 1,
            title: 'Marketing Executive',
            company: 'ABC Marketing',
            location: 'Dubai, UAE',
            type: 'Full Time',
            salary: 'AED 4,000 - 6,000',
        },
        {
            id: 2,
            title: 'Accountant',
            company: 'Finance Hub',
            location: 'Sharjah, UAE',
            type: 'Full Time',
            salary: 'AED 3,500 - 5,000',
        },
        {
            id: 3,
            title: 'Sales Manager',
            company: 'Global Sales LLC',
            location: 'Dubai, UAE',
            type: 'Full Time',
            salary: 'AED 6,000 - 10,000',
        }
    ];

    const filterOptions = ['All Jobs', 'Full Time', 'Part Time', 'Remote'];

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All Jobs' || job.type === activeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search job title or company"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-gray-700 placeholder-gray-400"
                />
            </div>

            <div className="flex gap-3 pb-2 overflow-x-auto custom-scrollbar">
                {filterOptions.map((filter) => (
                    <Button
                        key={filter}
                        variant={activeFilter === filter ? 'primary' : 'outline'}
                        onClick={() => setActiveFilter(filter)}
                        className={`whitespace-nowrap rounded-md px-6 ${activeFilter !== filter ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'shadow-sm'}`}
                    >
                        {filter}
                    </Button>
                ))}
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-xl font-bold text-gray-900">Featured Jobs</h2>

                    <div className="flex items-center gap-4">
                        <span className="text-[#2A45C2] font-bold text-sm hidden sm:block">
                            {filteredJobs.length} open
                        </span>
                        <div className="flex bg-gray-100 p-1 rounded-md">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2A45C2]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <FaTh size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#2A45C2]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <FaList size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {filteredJobs.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
                        {filteredJobs.map((job) => (
                            <div key={job.id} className={`bg-white border border-gray-200 rounded-md p-5 shadow-sm hover:shadow-md transition-shadow ${viewMode === 'grid' ? 'flex flex-col justify-between h-full' : 'flex flex-col md:flex-row md:items-center justify-between gap-4'}`}>

                                <div className={`flex ${viewMode === 'grid' ? 'justify-between items-start mb-4' : 'items-center gap-4 flex-1'}`}>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                                            <FaBriefcase size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                                            <p className="text-sm text-gray-500 mb-1">{job.company}</p>
                                            <div className="flex items-center text-xs text-gray-400 gap-1.5">
                                                <FaMapMarkerAlt />
                                                <span>{job.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {viewMode === 'grid' && (
                                        <Badge variant="default" className="bg-gray-100 text-gray-600 px-3 py-1 text-[10px] rounded-md">
                                            {job.type}
                                        </Badge>
                                    )}
                                </div>

                                <div className={`${viewMode === 'grid' ? 'mt-4 pt-4 border-t border-gray-100 flex items-center justify-between' : 'flex items-center flex-wrap gap-4 md:gap-6 justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 mt-4 md:mt-0'}`}>

                                    {viewMode === 'list' && (
                                        <Badge variant="default" className="bg-gray-100 text-gray-600 px-3 py-1 text-[10px] rounded-md">
                                            {job.type}
                                        </Badge>
                                    )}

                                    <div className="flex items-center gap-1.5 font-bold text-sm">
                                        <FaStar className="text-yellow-400" size={14} />
                                        <span className="text-[#D97706]">{job.salary}</span>
                                    </div>

                                    <Button size="sm" className="rounded-md px-6">
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white border border-gray-100 rounded-md">
                        <p className="text-gray-500 font-medium">No jobs found matching your criteria.</p>
                        <Button
                            variant="outline"
                            className="mt-4 rounded-md"
                            onClick={() => {
                                setSearchTerm('');
                                setActiveFilter('All Jobs');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserJobsCom;