import React, { useState, useEffect } from 'react';
import {
    FaSearch, FaStar, FaPlayCircle, FaCertificate, FaHeart, FaRegHeart,
    FaChalkboardTeacher, FaClock, FaBookOpen, FaGlobe, FaFileDownload,
    FaTh, FaList, FaTimes, FaCheckCircle, FaUserCircle, FaCalendarAlt
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Shimmer from '../../ui/Shimmer';

const UserAcademyCom = () => {
    const SIMULATED_USER_ID = 1;

    const [activeTab, setActiveTab] = useState('browse');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeLevel, setActiveLevel] = useState('All');
    const [maxPrice, setMaxPrice] = useState('All');
    const [viewMode, setViewMode] = useState('grid');

    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [isLoading, setIsLoading] = useState(true);

    const [favorites, setFavorites] = useState(new Set());
    const [enrolledCourses, setEnrolledCourses] = useState(new Set());

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchAcademyData = async () => {
            try {
                const resCourses = await fetch(`${apiUrl}/api/courses`);
                if (resCourses.ok) {
                    const data = await resCourses.json();
                    const activeCourses = data.filter(course => course.status === 'Active');
                    setCourses(activeCourses);
                    const uniqueCategories = [...new Set(activeCourses.map(course => course.category))];
                    setCategories(['All', ...uniqueCategories]);
                }

                const resEnrollments = await fetch(`${apiUrl}/api/courses/user/enrollments?userId=${SIMULATED_USER_ID}`);
                if (resEnrollments.ok) {
                    const enrolledIds = await resEnrollments.json();
                    setEnrolledCourses(new Set(enrolledIds));
                }

                const resWishlist = await fetch(`${apiUrl}/api/courses/user/wishlist?userId=${SIMULATED_USER_ID}`);
                if (resWishlist.ok) {
                    const wishlistIds = await resWishlist.json();
                    setFavorites(new Set(wishlistIds));
                }
            } catch (error) {
                console.error('Error fetching academy data:', error);
                toast.error('Failed to load academy data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAcademyData();
    }, [apiUrl]);

    const toggleFavorite = async (e, courseId) => {
        e.stopPropagation();

        const newFavs = new Set(favorites);
        const isCurrentlySaved = newFavs.has(courseId);

        if (isCurrentlySaved) {
            newFavs.delete(courseId);
        } else {
            newFavs.add(courseId);
        }
        setFavorites(newFavs);

        try {
            const res = await fetch(`${apiUrl}/api/courses/${courseId}/wishlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: SIMULATED_USER_ID })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.action === 'added') toast.success('Saved to wishlist');
                if (data.action === 'removed') toast.success('Removed from wishlist');
            } else {
                throw new Error('Database sync failed');
            }
        } catch (error) {
            toast.error('Failed to update wishlist.');
            const revertFavs = new Set(favorites);
            setFavorites(revertFavs);
        }
    };

    const handleEnroll = async (courseId, courseTitle) => {
        if (enrolledCourses.has(courseId)) {
            toast.success(`You are already enrolled in ${courseTitle}.`);
            setIsDetailsModalOpen(false);
            return;
        }

        const loadingToast = toast.loading(`Enrolling in ${courseTitle}...`);

        try {
            const res = await fetch(`${apiUrl}/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: SIMULATED_USER_ID })
            });

            if (res.ok) {
                const newEnrolled = new Set(enrolledCourses);
                newEnrolled.add(courseId);
                setEnrolledCourses(newEnrolled);

                toast.success(`Successfully enrolled! Saved to your DB account.`, { id: loadingToast });
                setIsDetailsModalOpen(false);
            } else {
                throw new Error('Enrollment failed');
            }
        } catch (error) {
            toast.error('Could not process database enrollment.', { id: loadingToast });
        }
    };

    const handleOpenDetails = (course) => {
        setSelectedCourse(course);
        setIsDetailsModalOpen(true);
    };

    const handleDownloadBrochure = () => {
        toast.success('Downloading course brochure PDF...');
    };

    const getMockRating = (id) => (4.0 + (id % 10) / 10).toFixed(1);
    const getMockReviews = (id) => 40 + (id * 47) % 1500;
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        const parsed = parseInt(priceStr.replace(/\D/g, ''), 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    const filteredCourses = courses.filter((course) => {
        if (activeTab === 'wishlist' && !favorites.has(course.id)) return false;
        if (activeTab === 'learning' && !enrolledCourses.has(course.id)) return false;

        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
        const matchesLevel = activeLevel === 'All' || course.course_level === activeLevel;

        let matchesPrice = true;
        if (maxPrice !== 'All') {
            const numPrice = parsePrice(course.discount_price || course.price);
            matchesPrice = numPrice <= parseInt(maxPrice, 10);
        }

        return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    const getTabTitle = () => {
        if (activeTab === 'wishlist') return 'My Database Wishlist';
        if (activeTab === 'learning') return 'My Enrolled Courses';
        return 'Curriculum Catalog';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-2.5 p-2 md:p-3 rounded-2xl bg-[#F5F6FC] relative">
            <Toaster position="top-right" />

            <div className="relative overflow-hidden rounded-2xl px-4 py-4 md:px-6 md:py-4 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0]">
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="pointer-events-none absolute -right-14 -top-14 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

                <div className="relative flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                        <FaBookOpen className="text-white" size={14} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight leading-none">Academy</h1>
                        <p className="text-white/70 text-[11px] font-medium mt-1">Browse courses, track learning, and manage your wishlist</p>
                    </div>
                </div>
            </div>

            <div className="flex bg-white border border-[#EBEBEB] p-1 rounded-xl shadow-sm">
                <button
                    onClick={() => setActiveTab('browse')}
                    className={`flex-1 font-bold py-2 rounded-lg text-sm transition-all ${activeTab === 'browse' ? 'bg-blue-50 text-[#2A45C2] shadow-sm border border-[#2A45C2]/10' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Browse Courses
                </button>
                <button
                    onClick={() => setActiveTab('learning')}
                    className={`flex-1 font-bold py-2 rounded-lg text-sm transition-all ${activeTab === 'learning' ? 'bg-blue-50 text-[#2A45C2] shadow-sm border border-[#2A45C2]/10' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    My Learning ({enrolledCourses.size})
                </button>
                <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`flex-1 font-bold py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'wishlist' ? 'bg-blue-50 text-[#2A45C2] shadow-sm border border-[#2A45C2]/10' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FaHeart className={activeTab === 'wishlist' ? 'text-[#2A45C2]' : 'text-red-400'} /> Wishlist ({favorites.size})
                </button>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-[#EBEBEB] space-y-2.5">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={15} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search bioinformatics, graphic design, programming..."
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:border-[#2A45C2] focus:bg-white transition-colors text-sm font-medium"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                    <select
                        value={activeLevel}
                        onChange={(e) => setActiveLevel(e.target.value)}
                        className="flex-1 p-2 bg-gray-50 border border-transparent rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:border-[#2A45C2] focus:bg-white transition-colors"
                    >
                        <option value="All">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    <select
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="flex-1 p-2 bg-gray-50 border border-transparent rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:border-[#2A45C2] focus:bg-white transition-colors"
                    >
                        <option value="All">Any Price</option>
                        <option value="100">Under 100</option>
                        <option value="300">Under 300</option>
                        <option value="500">Under 500</option>
                        <option value="1000">Under 1000</option>
                    </select>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pt-0.5 custom-scrollbar">
                    {!isLoading ? (
                        categories.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveCategory(filter)}
                                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${activeCategory === filter
                                    ? 'bg-blue-50 text-[#2A45C2] border border-[#2A45C2]/20'
                                    : 'bg-white border border-[#EBEBEB] text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))
                    ) : (
                        Array(5).fill(0).map((_, idx) => (
                            <Shimmer key={idx} className="w-20 h-8 rounded-lg shrink-0" />
                        ))
                    )}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2.5 px-0.5">
                    <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">{getTabTitle()}</h2>

                    <div className="flex items-center gap-2">
                        <span className="text-[#2A45C2] font-bold text-[11px] hidden sm:block bg-blue-50 border border-[#EBEBEB] px-2.5 py-1 rounded-md">
                            {isLoading ? '...' : filteredCourses.length} results
                        </span>
                        <div className="flex bg-white border border-[#EBEBEB] p-0.5 rounded-lg">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`}>
                                <FaTh size={13} />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`}>
                                <FaList size={13} />
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col gap-2.5"}>
                        {Array(6).fill(0).map((_, idx) => (
                            <div key={idx} className="bg-white border border-[#EBEBEB] rounded-xl h-64 shadow-[0_2px_16px_rgba(30,41,89,0.02)]">
                                <Shimmer className="w-full h-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : filteredCourses.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col gap-2.5"}>
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => handleOpenDetails(course)}
                                className={`bg-white border border-[#EBEBEB] rounded-xl overflow-hidden flex cursor-pointer shadow-[0_2px_16px_rgba(30,41,89,0.04)] hover:shadow-[0_10px_28px_rgba(42,69,194,0.12)] hover:border-[#2A45C2]/30 hover:-translate-y-0.5 transition-all duration-200 group relative ${viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row h-auto sm:h-40'}`}
                            >
                                <div className="absolute top-2.5 right-2.5 z-10 flex gap-2">
                                    <button onClick={(e) => toggleFavorite(e, course.id)} className="bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
                                        {favorites.has(course.id) ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
                                    </button>
                                </div>
                                {course.is_featured && (
                                    <div className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-sm flex items-center gap-1 uppercase tracking-wider">
                                        <FaStar size={10} /> Featured
                                    </div>
                                )}

                                <div className={`${viewMode === 'grid' ? 'w-full h-36' : 'w-full sm:w-56 h-40 sm:h-full'} bg-gray-100 relative overflow-hidden flex-shrink-0`}>
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-[#2A45C2]/10 flex flex-col items-center justify-center text-[#2A45C2]">
                                            <FaPlayCircle size={36} className="opacity-50 mb-1.5" />
                                            <span className="font-bold text-sm opacity-50">No Preview</span>
                                        </div>
                                    )}
                                    {course.has_certificate && (
                                        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-700 flex items-center gap-1 shadow-sm">
                                            <FaCertificate className="text-blue-500" /> Certificate
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-extrabold text-[#2A45C2] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{course.category}</span>
                                            <span className="text-[10px] font-bold text-gray-500">{course.course_level}</span>
                                        </div>
                                        <h3 className="text-[15px] font-black text-gray-900 leading-tight mb-1.5 group-hover:text-[#2A45C2] transition-colors line-clamp-2">{course.title}</h3>

                                        <div className="flex items-center text-xs font-bold gap-1.5 mb-2 text-gray-600">
                                            <FaChalkboardTeacher className="text-gray-400" />
                                            <span>{course.instructor_name || 'Expert Instructor'}</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-2">
                                            <span className="flex items-center gap-1"><FaStar className="text-yellow-400" size={12} /> <span className="font-bold text-gray-700">{getMockRating(course.id)}</span> ({getMockReviews(course.id)})</span>
                                            <span className="flex items-center gap-1"><FaClock size={10} /> {course.duration || 'Flexible'}</span>
                                            <span className="flex items-center gap-1"><FaBookOpen size={10} /> {course.lessons_count} Lessons</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-2.5 border-t border-[#EBEBEB] flex items-center justify-between">
                                        <div className="flex flex-col">
                                            {course.discount_price ? (
                                                <>
                                                    <span className="font-black text-gray-900 text-[15px]">{course.discount_price}</span>
                                                    <span className="line-through text-xs text-gray-400 font-medium">{course.price}</span>
                                                </>
                                            ) : (
                                                <span className="font-black text-gray-900 text-[15px]">{course.price}</span>
                                            )}
                                        </div>
                                        <Button className="rounded-lg px-5 py-1.5 bg-[#2A45C2] text-white border-0 font-bold text-sm shadow-sm hover:scale-105 transition-transform">
                                            {enrolledCourses.has(course.id) ? 'View Course' : 'View Details'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl shadow-sm">
                        {activeTab === 'wishlist' && favorites.size === 0 ? (
                            <p className="text-gray-500 font-medium text-sm mb-3">Your database wishlist is currently empty.</p>
                        ) : activeTab === 'learning' && enrolledCourses.size === 0 ? (
                            <p className="text-gray-500 font-medium text-sm mb-3">You haven't enrolled in any courses in the database yet.</p>
                        ) : (
                            <>
                                <p className="text-gray-500 font-medium text-sm mb-3">No courses found matching your criteria.</p>
                                <Button variant="outline" className="rounded-lg border-[#EBEBEB] text-gray-700 text-sm font-bold" onClick={() => { setSearchTerm(''); setActiveCategory('All'); setActiveLevel('All'); setMaxPrice('All'); }}>
                                    Clear All Filters
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {isDetailsModalOpen && selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/70 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:max-h-[88vh] flex flex-col relative overflow-hidden">

                        <div className="absolute top-3.5 right-3.5 z-20">
                            <button onClick={() => setIsDetailsModalOpen(false)} className="bg-black/50 hover:bg-black/70 backdrop-blur text-white p-2 rounded-full transition-colors">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="w-full h-48 sm:h-60 bg-black relative flex-shrink-0">
                            {selectedCourse.preview_video_url ? (
                                <iframe
                                    src={selectedCourse.preview_video_url}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Course Preview"
                                ></iframe>
                            ) : selectedCourse.thumbnail_url ? (
                                <div className="w-full h-full relative">
                                    <img src={selectedCourse.thumbnail_url} alt="Cover" className="w-full h-full object-cover opacity-60" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center text-white">
                                            <FaPlayCircle size={50} className="mb-2 opacity-80 cursor-not-allowed" />
                                            <p className="font-bold">Preview Video Unavailable</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                    <FaPlayCircle size={50} className="mb-2 opacity-50" />
                                    <p className="font-bold">No Media Available</p>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row bg-gray-50">

                            <div className="w-full md:w-2/3 p-4 sm:p-5 space-y-5 bg-white">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-blue-50 text-[#2A45C2] border-blue-100 font-bold px-2 py-0.5">{selectedCourse.category}</Badge>
                                        <Badge className="bg-gray-100 text-gray-600 border-gray-200 font-bold px-2 py-0.5">{selectedCourse.course_level}</Badge>
                                        {selectedCourse.is_featured && <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 font-bold px-2 py-0.5 flex items-center gap-1"><FaStar /> Featured</Badge>}
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-2.5">{selectedCourse.title}</h1>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {selectedCourse.description || "Detailed description for this course is currently being updated. Please check back later or review the syllabus in the brochure."}
                                    </p>
                                </div>

                                <section className="border border-[#EBEBEB] rounded-xl p-4 bg-gray-50 flex items-start gap-3.5">
                                    <div className="w-14 h-14 bg-white border border-[#EBEBEB] rounded-full flex items-center justify-center text-gray-300 flex-shrink-0 shadow-sm">
                                        <FaUserCircle size={34} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-0.5">Meet Your Instructor</h3>
                                        <p className="font-bold text-[#2A45C2] text-base">{selectedCourse.instructor_name || 'Expert Faculty'}</p>
                                        <p className="text-xs text-gray-500 mt-1">Industry professional with years of specialized experience leading advanced curriculum and mentoring students worldwide.</p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3 border-b border-[#EBEBEB] pb-2">What's Included</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                            <div className="p-1.5 bg-blue-50 text-[#2A45C2] rounded-lg"><FaClock size={14} /></div>
                                            <span className="font-bold">{selectedCourse.duration || 'Self-paced'}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                            <div className="p-1.5 bg-blue-50 text-[#2A45C2] rounded-lg"><FaBookOpen size={14} /></div>
                                            <span className="font-bold">{selectedCourse.lessons_count} Comprehensive Lessons</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                            <div className="p-1.5 bg-blue-50 text-[#2A45C2] rounded-lg"><FaGlobe size={14} /></div>
                                            <span className="font-bold">Language: {selectedCourse.language}</span>
                                        </div>
                                        {selectedCourse.has_certificate && (
                                            <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                                <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><FaCertificate size={14} /></div>
                                                <span className="font-bold text-green-700">Verifiable Certificate of Completion</span>
                                            </div>
                                        )}
                                        {selectedCourse.start_date && (
                                            <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                                <div className="p-1.5 bg-blue-50 text-[#2A45C2] rounded-lg"><FaCalendarAlt size={14} /></div>
                                                <span className="font-bold">Starts: {new Date(selectedCourse.start_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-2 mb-3">
                                        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Student Reviews</h3>
                                        <div className="flex items-center gap-2">
                                            <FaStar className="text-yellow-400" size={15} />
                                            <span className="font-black text-base text-gray-900">{getMockRating(selectedCourse.id)}</span>
                                            <span className="text-xs text-gray-500 font-medium">({getMockReviews(selectedCourse.id)} ratings)</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { name: "James T.", date: "1 month ago", rating: 5, text: "Absolutely phenomenal course. The structure was easy to follow and the concepts were explained clearly." },
                                            { name: "Sarah K.", date: "3 months ago", rating: 4, text: "Great material and fantastic instructor. I learned a lot of practical skills that I can apply immediately." }
                                        ].map((review, idx) => (
                                            <div key={idx} className="border-b border-[#EBEBEB] last:border-0 pb-3 last:pb-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="w-8 h-8 bg-[#2A45C2] text-white rounded-full flex items-center justify-center font-bold text-xs">{review.name.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 leading-none">{review.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex text-yellow-400 text-[10px]">
                                                                {[...Array(5)].map((_, i) => <FaStar key={i} className={i < review.rating ? '' : 'text-gray-200'} />)}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400">{review.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 pl-10">{review.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="w-full md:w-1/3 bg-gray-50 border-l border-[#EBEBEB] p-4 sm:p-5 flex flex-col gap-4 sticky top-0">

                                <div className="bg-white p-5 rounded-2xl border border-[#EBEBEB] shadow-lg text-center">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Enrollment Fee</p>
                                    {selectedCourse.discount_price ? (
                                        <div className="flex flex-col items-center mb-3">
                                            <span className="text-3xl font-black text-gray-900">{selectedCourse.discount_price}</span>
                                            <span className="text-sm text-gray-400 line-through font-medium mt-1">{selectedCourse.price}</span>
                                            <Badge className="mt-2 bg-red-50 text-red-600 border-red-200 font-bold">Limited Time Offer</Badge>
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-black text-gray-900 mb-4">{selectedCourse.price}</div>
                                    )}

                                    <div className="space-y-2.5">
                                        <Button
                                            onClick={() => handleEnroll(selectedCourse.id, selectedCourse.title)}
                                            className={`w-full py-3 text-white border-0 font-black text-md shadow-md transition-transform ${enrolledCourses.has(selectedCourse.id) ? 'bg-green-600' : 'bg-[#2A45C2] hover:-translate-y-0.5'}`}
                                        >
                                            {enrolledCourses.has(selectedCourse.id) ? 'Continue Learning' : 'Enroll Now'}
                                        </Button>
                                        <Button onClick={(e) => toggleFavorite(e, selectedCourse.id)} variant="outline" className={`w-full py-2.5 font-bold border-2 ${favorites.has(selectedCourse.id) ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100' : 'border-[#EBEBEB] text-gray-700 bg-white hover:bg-gray-50'}`}>
                                            {favorites.has(selectedCourse.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium mt-3">30-Day Money-Back Guarantee</p>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-[#EBEBEB] shadow-sm">
                                    <h4 className="font-extrabold text-gray-900 text-sm mb-1.5 flex items-center gap-2"><FaFileDownload className="text-[#2A45C2]" /> Course Brochure</h4>
                                    <p className="text-xs text-gray-500 mb-3">Download the full syllabus, module breakdowns, and technical prerequisites.</p>
                                    <Button onClick={handleDownloadBrochure} variant="outline" className="w-full text-xs py-2 border-[#2A45C2]/30 text-[#2A45C2] font-bold hover:bg-blue-50">
                                        Download PDF
                                    </Button>
                                </div>

                                {selectedCourse.has_certificate && (
                                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl shadow-md text-white">
                                        <FaCertificate className="text-yellow-400 text-2xl mb-1.5" />
                                        <h4 className="font-bold text-sm mb-1">Earn Your Certificate</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            Complete all curriculum modules to receive an industry-recognized certification to boost your digital portfolio and resume.
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAcademyCom;