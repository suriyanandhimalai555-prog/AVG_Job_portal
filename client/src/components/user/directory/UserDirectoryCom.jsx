import React, { useState, useEffect } from 'react';
import {
    FaSearch,
    FaMapMarkerAlt,
    FaHeart,
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
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/businesses`);
                if (res.ok) {
                    const data = await res.json();
                    const activeBusinesses = data.filter(biz => biz.status === 'Active');
                    setBusinesses(activeBusinesses);
                    const uniqueCategories = [...new Set(activeBusinesses.map(biz => biz.category))];
                    setCategories(uniqueCategories);
                }
            } catch (error) {
                console.error('Error fetching directory data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBusinesses();
    }, [apiUrl]);

    const getMockRating = (id) => {
        return (4.0 + (id % 10) / 10).toFixed(1);
    };

    const filterOptions = ['All Categories', ...categories];

    const filteredBusinesses = businesses.filter((biz) => {
        const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            biz.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All Categories' || biz.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl">
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={16} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search business or service..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#EBEBEB] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-gray-700 placeholder-gray-400 font-medium"
                />
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
                {!isLoading && filterOptions.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveCategory(filter)}
                        className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-bold transition-all ${activeCategory === filter
                            ? 'bg-blue-50 text-[#2A45C2] border border-[#2A45C2]/20'
                            : 'bg-white border border-[#EBEBEB] text-gray-500'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 px-1 mt-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-extrabold text-gray-900">Top Businesses</h2>
                        <Badge variant="primary" className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-[#2A45C2] border border-[#EBEBEB] font-bold">
                            {filteredBusinesses.length} found
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-[#EBEBEB] p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`}
                        >
                            <FaTh size={14} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`}
                        >
                            <FaList size={14} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl">
                        <p className="text-gray-500 font-medium">Loading businesses...</p>
                    </div>
                ) : filteredBusinesses.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                        {filteredBusinesses.map((biz) => (
                            viewMode === 'grid' ? (
                                <div key={biz.id} className="bg-white border border-[#EBEBEB] p-5 rounded-xl shadow-sm flex flex-col">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-[#2A45C2] text-white flex items-center justify-center rounded-lg text-lg font-bold flex-shrink-0 shadow-sm">
                                                {biz.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-md font-bold text-gray-900 leading-tight mb-1">{biz.name}</h3>
                                                <p className="text-xs font-medium text-gray-500">{biz.category}</p>
                                            </div>
                                        </div>
                                        <button className="text-[#2A45C2] p-2 bg-blue-50 rounded-full border border-[#EBEBEB]">
                                            <FaHeart size={14} />
                                        </button>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-[#EBEBEB] flex items-center justify-between">
                                        <div className="flex items-center text-xs font-medium text-gray-500 gap-1.5">
                                            <FaMapMarkerAlt className="text-[#2A45C2]" size={12} />
                                            <span>{biz.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            <FaStar className="text-yellow-400" size={14} />
                                            <span className="text-gray-900">{getMockRating(biz.id)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div key={biz.id} className="bg-white border border-[#EBEBEB] p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#2A45C2] text-white flex items-center justify-center rounded-lg text-lg font-bold flex-shrink-0 shadow-sm">
                                            {biz.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-md font-bold text-gray-900 leading-tight mb-0.5">{biz.name}</h3>
                                            <p className="text-xs font-medium text-gray-500">{biz.category}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-5 sm:w-auto w-full border-t sm:border-t-0 border-[#EBEBEB] pt-3 sm:pt-0">
                                        <div className="flex items-center text-xs font-medium text-gray-500 gap-1.5">
                                            <FaMapMarkerAlt className="text-[#2A45C2]" size={12} />
                                            <span>{biz.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            <FaStar className="text-yellow-400" size={14} />
                                            <span className="text-gray-900">{getMockRating(biz.id)}</span>
                                        </div>
                                        <button className="text-[#2A45C2] p-2 bg-blue-50 rounded-full border border-[#EBEBEB] ml-1">
                                            <FaHeart size={14} />
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl">
                        <p className="text-gray-500 font-medium">No businesses found matching your criteria.</p>
                        <Button
                            variant="outline"
                            className="mt-3 rounded-lg border-[#EBEBEB] text-gray-700 text-sm"
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