import React, { useState, useEffect } from 'react';
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
    const [viewMode, setViewMode] = useState('list');
    const [courses, setCourses] = useState([]);
    const [filterOptions, setFilterOptions] = useState(['All']);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/courses`);
                if (res.ok) {
                    const data = await res.json();
                    const activeCourses = data.filter(course => course.status === 'Active');
                    setCourses(activeCourses);
                    const uniqueCategories = [...new Set(activeCourses.map(course => course.category))];
                    setFilterOptions(['All', ...uniqueCategories]);
                }
            } catch (error) {
                console.error('Error fetching courses data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [apiUrl]);

    const getCourseIcon = (categoryName) => {
        const name = categoryName.toLowerCase();
        if (name.includes('market')) return <FaChartLine size={28} className="text-[#2A45C2]" />;
        if (name.includes('business') || name.includes('finance')) return <FaChartBar size={28} className="text-[#2A45C2]" />;
        if (name.includes('it') || name.includes('software') || name.includes('web')) return <FaLaptop size={28} className="text-[#2A45C2]" />;
        return <FaChartLine size={28} className="text-[#2A45C2]" />;
    };

    const getMockRating = (id) => (4.0 + (id % 10) / 10).toFixed(1);
    const getMockReviews = (id) => 100 + (id * 47) % 1500;

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' || course.category === activeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl shadow-sm bg-[#EEF2FF]">
            <div className="flex bg-white border border-[#EBEBEB] p-1 rounded-xl mb-2 shadow-sm">
                <button className="flex-1 bg-blue-50 text-[#2A45C2] font-bold py-2.5 rounded-lg shadow-sm text-sm border border-[#2A45C2]/10">
                    Browse Courses
                </button>
                <button className="flex-1 text-gray-500 hover:text-gray-700 font-bold py-2.5 rounded-lg text-sm transition-all">
                    My Courses (0)
                </button>
            </div>

            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={16} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses by title or category..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#EBEBEB] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-gray-700 placeholder-gray-400 font-medium"
                />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {!isLoading && filterOptions.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-bold transition-all ${activeFilter === filter
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
                    <h2 className="text-lg font-extrabold text-gray-900">Popular Courses</h2>

                    <div className="flex items-center gap-3">
                        <span className="text-[#2A45C2] font-bold text-xs hidden sm:block bg-blue-50 border border-[#EBEBEB] px-2.5 py-1 rounded-md">
                            {filteredCourses.length} found
                        </span>
                        <div className="flex bg-white border border-[#EBEBEB] p-1 rounded-lg">
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
                </div>

                {isLoading ? (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl">
                        <p className="text-gray-500 font-medium">Loading courses...</p>
                    </div>
                ) : filteredCourses.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                        {filteredCourses.map((course) => (
                            <div key={course.id} className={`bg-white border border-[#EBEBEB] rounded-xl p-4 flex ${viewMode === 'grid' ? 'flex-col gap-4' : 'flex-col sm:flex-row gap-4 sm:gap-5'} shadow-sm`}>

                                <div className={`${viewMode === 'grid' ? 'w-full h-36' : 'w-full sm:w-28 md:w-32 h-36 sm:h-auto sm:min-h-[100px]'} bg-blue-50 border border-[#EBEBEB] rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    {getCourseIcon(course.category)}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="mb-3 sm:mb-0">
                                        <h3 className="text-md font-bold text-gray-900 leading-tight mb-1">{course.title}</h3>
                                        <p className="text-xs font-medium text-gray-500 mb-2">{course.category}</p>
                                        <div className="flex items-center text-xs font-bold gap-1.5">
                                            <FaStar className="text-yellow-400" size={14} />
                                            <span className="text-gray-900">{getMockRating(course.id)}</span>
                                            <span className="text-gray-400 font-medium">({getMockReviews(course.id)} reviews)</span>
                                        </div>
                                    </div>

                                    <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'mt-3 pt-3 border-t border-[#EBEBEB]' : 'mt-auto'}`}>
                                        <span className="text-[#2A45C2] font-extrabold text-lg">{course.price}</span>
                                        <Button className="rounded-lg px-5 py-2 bg-[#2A45C2] text-white border-0 font-bold text-sm">
                                            Enroll
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl">
                        <p className="text-gray-500 font-medium">No courses found matching your criteria.</p>
                        <Button
                            variant="outline"
                            className="mt-3 rounded-lg border-[#EBEBEB] text-gray-700 text-sm"
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