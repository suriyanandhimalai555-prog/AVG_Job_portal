import React, { useState } from 'react';
import {
    FaSearch,
    FaStar,
    FaChartLine,
    FaChartBar,
    FaLaptop,
    FaTh,
    FaList
} from 'react-icons/fa';
import Button from '../../ui/Button';

const UserAcademyCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [viewMode, setViewMode] = useState('list'); // Default to list to match original style, toggleable to grid

    const courses = [
        {
            id: 1,
            title: 'Digital Marketing Master Course',
            category: 'Marketing',
            rating: '4.8',
            reviews: '1,200',
            price: 'AED 299',
            icon: <FaChartLine size={28} className="text-red-400" />
        },
        {
            id: 2,
            title: 'Business Growth Strategies',
            category: 'Business',
            rating: '4.7',
            reviews: '950',
            price: 'AED 249',
            icon: <FaChartBar size={28} className="text-green-400" />
        },
        {
            id: 3,
            title: 'Web Development Bootcamp',
            category: 'IT & Software',
            rating: '4.9',
            reviews: '1,500',
            price: 'AED 399',
            icon: <FaLaptop size={28} className="text-gray-300" />
        }
    ];

    const filterOptions = ['All', 'Business', 'IT & Software', 'Marketing'];

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' || course.category === activeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* Top Tabs */}
            <div className="flex bg-gray-50 p-1.5 rounded-md mb-2 border border-gray-100">
                <button className="flex-1 bg-white text-[#2A45C2] font-bold py-3 rounded-md shadow-sm text-sm transition-all">
                    Browse Courses
                </button>
                <button className="flex-1 text-gray-500 font-bold py-3 rounded-md text-sm hover:text-gray-700 transition-all">
                    My Courses (0)
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses by title or category..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-gray-700 placeholder-gray-400"
                />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
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

            {/* Courses Section */}
            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-xl font-bold text-gray-900">Popular Courses</h2>

                    <div className="flex items-center gap-4">
                        <span className="text-[#2A45C2] font-bold text-sm hidden sm:block">
                            {filteredCourses.length} found
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

                {filteredCourses.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
                        {filteredCourses.map((course) => (
                            <div key={course.id} className={`bg-white border border-gray-200 rounded-md p-4 md:p-5 flex ${viewMode === 'grid' ? 'flex-col gap-4' : 'flex-col sm:flex-row gap-4 sm:gap-5'} hover:shadow-md transition-shadow`}>

                                <div className={`${viewMode === 'grid' ? 'w-full h-40' : 'w-full sm:w-28 md:w-32 h-40 sm:h-auto sm:min-h-[100px]'} bg-[#0F172A] rounded-md flex items-center justify-center flex-shrink-0`}>
                                    {course.icon}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="mb-4 sm:mb-0">
                                        <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{course.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{course.category}</p>
                                        <div className="flex items-center text-sm font-bold gap-1.5">
                                            <FaStar className="text-yellow-400" size={14} />
                                            <span className="text-gray-900">{course.rating}</span>
                                            <span className="text-gray-400 font-medium">({course.reviews})</span>
                                        </div>
                                    </div>

                                    <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'mt-4 pt-4 border-t border-gray-50' : 'mt-auto'}`}>
                                        <span className="text-[#2A45C2] font-extrabold text-lg">{course.price}</span>
                                        <Button size="sm" className="rounded-md px-6">
                                            Enroll
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white border border-gray-100 rounded-md">
                        <p className="text-gray-500 font-medium">No courses found matching your criteria.</p>
                        <Button
                            variant="outline"
                            className="mt-4 rounded-md"
                            onClick={() => {
                                setSearchTerm('');
                                setActiveFilter('All');
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

export default UserAcademyCom;