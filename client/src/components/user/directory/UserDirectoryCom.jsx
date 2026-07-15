import React, { useState } from 'react';
import {
    FaSearch,
    FaLaptop,
    FaHardHat,
    FaLightbulb,
    FaBullhorn,
    FaMapMarkerAlt,
    FaRegHeart,
    FaStar,
    FaTh,
    FaList
} from 'react-icons/fa';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const UserDirectoryCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Categories');
    const [viewMode, setViewMode] = useState('grid');

    const categories = [
        { name: 'IT Services', icon: <FaLaptop size={24} />, color: 'text-[#2A45C2]' },
        { name: 'Construction', icon: <FaHardHat size={24} />, color: 'text-[#2A45C2]' },
        { name: 'Consulting', icon: <FaLightbulb size={24} />, color: 'text-[#2A45C2]' },
        { name: 'Marketing', icon: <FaBullhorn size={24} />, color: 'text-[#2A45C2]' },
    ];

    const filterOptions = ['All Categories', 'IT Services', 'Construction', 'Consulting', 'Marketing'];

    const businesses = [
        {
            name: 'ABC IT Solutions',
            category: 'IT Services',
            location: 'Dubai, UAE',
            rating: '4.8',
            initial: 'A',
            bgColor: 'bg-[#1E293B]',
        },
        {
            name: 'BuildTech Contracting',
            category: 'Construction',
            location: 'Sharjah, UAE',
            rating: '4.6',
            initial: 'B',
            bgColor: 'bg-[#D97706]',
        },
        {
            name: 'Digital Marketers Hub',
            category: 'Marketing',
            location: 'Dubai, UAE',
            rating: '4.7',
            initial: 'D',
            bgColor: 'bg-[#E11D48]',
        },
    ];

    const filteredBusinesses = businesses.filter((biz) => {
        const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            biz.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All Categories' || biz.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-8">
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search business or service"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2A45C2] text-gray-700 placeholder-gray-400"
                />
            </div>

            <div className="flex gap-3 pb-2 overflow-x-auto custom-scrollbar">
                {filterOptions.map((filter) => (
                    <Button
                        key={filter}
                        variant={activeCategory === filter ? 'primary' : 'outline'}
                        onClick={() => setActiveCategory(filter)}
                        className={`rounded-md whitespace-nowrap ${activeCategory !== filter ? 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50' : 'shadow-sm'}`}
                    >
                        {filter}
                    </Button>
                ))}
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-xl font-extrabold text-gray-900">Categories</h2>
                    <button className="text-[#2A45C2] font-bold text-sm hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`bg-white border p-6 rounded-md shadow-sm flex flex-col items-center justify-center transition-all cursor-pointer group ${activeCategory === cat.name ? 'border-[#2A45C2] ring-1 ring-[#2A45C2]' : 'border-gray-100 hover:border-blue-100 hover:shadow-md'}`}
                        >
                            <div className={`${cat.color} mb-3 group-hover:scale-110 transition-transform duration-200`}>
                                {cat.icon}
                            </div>
                            <h3 className="text-sm font-bold text-gray-700">{cat.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-extrabold text-gray-900">Top Businesses</h2>
                        <Badge variant="primary" className="text-sm px-3 py-1 rounded-md">
                            {filteredBusinesses.length} found
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2A45C2]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FaTh size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#2A45C2]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FaList size={16} />
                        </button>
                    </div>
                </div>

                {filteredBusinesses.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
                        {filteredBusinesses.map((biz, index) => (
                            viewMode === 'grid' ? (
                                <div key={index} className="bg-white border border-gray-100 p-5 rounded-md shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 ${biz.bgColor} text-white flex items-center justify-center rounded-md text-xl font-bold flex-shrink-0`}>
                                                {biz.initial}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 leading-tight mb-0.5">{biz.name}</h3>
                                                <p className="text-sm text-gray-500">{biz.category}</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-300 hover:text-red-500 transition-colors">
                                            <FaRegHeart size={18} />
                                        </button>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-500 gap-1.5">
                                            <FaMapMarkerAlt className="text-gray-400" />
                                            <span>{biz.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            <FaStar className="text-yellow-400" size={16} />
                                            <span className="text-gray-800">{biz.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div key={index} className="bg-white border border-gray-100 p-4 rounded-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${biz.bgColor} text-white flex items-center justify-center rounded-md text-xl font-bold flex-shrink-0`}>
                                            {biz.initial}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 leading-tight mb-0.5">{biz.name}</h3>
                                            <p className="text-sm text-gray-500">{biz.category}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 sm:w-auto w-full border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0">
                                        <div className="flex items-center text-sm text-gray-500 gap-1.5">
                                            <FaMapMarkerAlt className="text-gray-400" />
                                            <span>{biz.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            <FaStar className="text-yellow-400" size={16} />
                                            <span className="text-gray-800">{biz.rating}</span>
                                        </div>
                                        <button className="text-gray-300 hover:text-red-500 transition-colors ml-2">
                                            <FaRegHeart size={18} />
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white border border-gray-100 rounded-md">
                        <p className="text-gray-500 font-medium">No businesses found matching your criteria.</p>
                        <Button
                            variant="outline"
                            className="mt-4 rounded-md"
                            onClick={() => {
                                setSearchTerm('');
                                setActiveCategory('All Categories');
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

export default UserDirectoryCom;