import React, { useState, useEffect } from 'react';
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
    FaList,
    FaBriefcase
} from 'react-icons/fa';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const UserDirectoryCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Categories');
    const [viewMode, setViewMode] = useState('grid');

    // Dynamic State
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch real data on component mount
    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/businesses`);
                if (res.ok) {
                    const data = await res.json();

                    // 1. Filter only 'Active' businesses for the public user view
                    const activeBusinesses = data.filter(biz => biz.status === 'Active');
                    setBusinesses(activeBusinesses);

                    // 2. Extract unique categories dynamically from the active businesses
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

    // UI Helper: Get dynamic icon based on category name
    const getCategoryIcon = (categoryName) => {
        const name = categoryName.toLowerCase();
        if (name.includes('it') || name.includes('tech') || name.includes('software')) return <FaLaptop size={24} />;
        if (name.includes('construct') || name.includes('build')) return <FaHardHat size={24} />;
        if (name.includes('consult') || name.includes('advis')) return <FaLightbulb size={24} />;
        if (name.includes('market') || name.includes('advert')) return <FaBullhorn size={24} />;
        return <FaBriefcase size={24} />; // Default Icon
    };

    // UI Helper: Generate consistent background color based on business name
    const getBgColor = (name) => {
        const bgColors = ['bg-[#1E293B]', 'bg-[#D97706]', 'bg-[#E11D48]', 'bg-[#2A45C2]', 'bg-[#10B981]', 'bg-[#8B5CF6]'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return bgColors[Math.abs(hash) % bgColors.length];
    };

    // UI Helper: Generate a pseudo-random rating for visual purposes (since it's not in DB yet)
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
        <div className="max-w-6xl mx-auto space-y-8 pb-8">
            {/* Search Bar */}
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

            {/* Dynamic Filter Pills */}
            <div className="flex gap-3 pb-2 overflow-x-auto custom-scrollbar">
                {!isLoading && filterOptions.map((filter) => (
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

            {/* Dynamic Category Cards */}
            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-xl font-extrabold text-gray-900">Categories</h2>
                </div>
                {isLoading ? (
                    <div className="text-sm text-gray-500">Loading categories...</div>
                ) : categories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat, index) => (
                            <div
                                key={index}
                                onClick={() => setActiveCategory(cat)}
                                className={`bg-white border p-6 rounded-md shadow-sm flex flex-col items-center justify-center transition-all cursor-pointer group ${activeCategory === cat ? 'border-[#2A45C2] ring-1 ring-[#2A45C2]' : 'border-gray-100 hover:border-blue-100 hover:shadow-md'}`}
                            >
                                <div className="text-[#2A45C2] mb-3 group-hover:scale-110 transition-transform duration-200">
                                    {getCategoryIcon(cat)}
                                </div>
                                <h3 className="text-sm font-bold text-gray-700 text-center">{cat}</h3>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">No categories available.</div>
                )}
            </div>

            {/* Business Listings */}
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

                {isLoading ? (
                    <div className="text-center py-12 bg-white border border-gray-100 rounded-md">
                        <p className="text-gray-500 font-medium">Loading businesses...</p>
                    </div>
                ) : filteredBusinesses.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
                        {filteredBusinesses.map((biz) => (
                            viewMode === 'grid' ? (
                                <div key={biz.id} className="bg-white border border-gray-100 p-5 rounded-md shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 ${getBgColor(biz.name)} text-white flex items-center justify-center rounded-md text-xl font-bold flex-shrink-0`}>
                                                {biz.name.charAt(0).toUpperCase()}
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
                                            <span className="text-gray-800">{getMockRating(biz.id)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div key={biz.id} className="bg-white border border-gray-100 p-4 rounded-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${getBgColor(biz.name)} text-white flex items-center justify-center rounded-md text-xl font-bold flex-shrink-0`}>
                                            {biz.name.charAt(0).toUpperCase()}
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
                                            <span className="text-gray-800">{getMockRating(biz.id)}</span>
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