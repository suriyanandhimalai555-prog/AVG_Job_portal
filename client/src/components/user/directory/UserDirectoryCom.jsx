import React, { useState, useEffect } from 'react';
import {
    FaSearch, FaMapMarkerAlt, FaHeart, FaRegHeart, FaStar, FaTh, FaList,
    FaMap, FaCheckCircle, FaGlobe, FaEnvelope, FaPhone, FaShareAlt,
    FaDirections, FaTimes, FaImage, FaPaperPlane, FaUserCircle
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';

const UserDirectoryCom = () => {
    // --- State Management ---
    const [searchTerm, setSearchTerm] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Categories');
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'map'
    const [showNearby, setShowNearby] = useState(false);

    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [favorites, setFavorites] = useState(new Set());
    const [selectedBiz, setSelectedBiz] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // --- Fetch Data ---
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
                toast.error('Failed to load businesses.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBusinesses();
    }, [apiUrl]);

    // --- Utility & Handlers ---
    const getMockRating = (id) => (4.0 + (id % 10) / 10).toFixed(1);

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        const newFavs = new Set(favorites);
        if (newFavs.has(id)) {
            newFavs.delete(id);
            toast.success('Removed from favorites');
        } else {
            newFavs.add(id);
            toast.success('Saved to favorites!');
        }
        setFavorites(newFavs);
    };

    const handleShare = (e, bizName) => {
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.href);
        toast.success(`Link for ${bizName} copied to clipboard!`);
    };

    const handleOpenDetails = async (biz) => {
        setSelectedBiz(biz);
        setIsDetailsModalOpen(true);

        // Optional: Trigger a "view" increment to the backend analytics here
        try {
            await fetch(`${apiUrl}/api/businesses/${biz.id}/view`, { method: 'POST' });
        } catch (e) { /* silent fail for analytics */ }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            toast.success(`Message sent to ${selectedBiz.name}!`);
            setContactForm({ name: '', email: '', message: '' });
            setIsSending(false);
        }, 1000);
    };

    // --- Filtering Logic ---
    const filterOptions = ['All Categories', ...categories];

    const filteredBusinesses = businesses.filter((biz) => {
        const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            biz.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = biz.location.toLowerCase().includes(locationSearch.toLowerCase());
        const matchesCategory = activeCategory === 'All Categories' || biz.category === activeCategory;

        // Mock "Nearby" logic (just filters randomly for demonstration if toggled)
        const matchesNearby = showNearby ? (biz.id % 2 === 0) : true;

        return matchesSearch && matchesLocation && matchesCategory && matchesNearby;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl shadow-sm bg-[#EEF2FF] relative">
            <Toaster position="top-right" />

            {/* --- Advanced Search Bar --- */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-[#EBEBEB] flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search businesses, services..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:border-[#2A45C2] focus:bg-white transition-colors text-sm"
                    />
                </div>
                <div className="relative flex-1">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Location (e.g. City, Area)"
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:border-[#2A45C2] focus:bg-white transition-colors text-sm"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowNearby(!showNearby)}
                    className={`py-2.5 px-5 font-bold rounded-lg whitespace-nowrap border transition-colors flex items-center gap-2 text-sm ${showNearby ? 'bg-blue-50 text-[#2A45C2] border-[#2A45C2]/30' : 'bg-white text-gray-600 border-[#EBEBEB] hover:bg-gray-50'}`}
                >
                    <FaDirections className={showNearby ? 'text-[#2A45C2]' : 'text-gray-400'} /> Nearby
                </Button>
            </div>

            {/* --- Category Filters --- */}
            <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
                {!isLoading && filterOptions.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveCategory(filter)}
                        className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-bold transition-all ${activeCategory === filter
                            ? 'bg-blue-50 text-[#2A45C2] border border-[#2A45C2]/20'
                            : 'bg-white border border-[#EBEBEB] text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* --- Content Area --- */}
            <div>
                <div className="flex justify-between items-center mb-4 px-1 mt-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-extrabold text-gray-900">Directory Results</h2>
                        <Badge variant="primary" className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-[#2A45C2] border border-[#EBEBEB] font-bold">
                            {filteredBusinesses.length} found
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-[#EBEBEB] p-1 rounded-lg">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`} title="Grid View">
                            <FaTh size={14} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`} title="List View">
                            <FaList size={14} />
                        </button>
                        <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`} title="Map View">
                            <FaMap size={14} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl">
                        <p className="text-gray-500 font-medium">Loading businesses...</p>
                    </div>
                ) : filteredBusinesses.length > 0 ? (

                    /* --- MAP VIEW --- */
                    viewMode === 'map' ? (
                        <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm h-[600px] flex overflow-hidden">
                            <div className="w-1/3 border-r border-[#EBEBEB] overflow-y-auto custom-scrollbar p-3 space-y-3 bg-gray-50">
                                {filteredBusinesses.map(biz => (
                                    <div key={biz.id} onClick={() => handleOpenDetails(biz)} className="bg-white p-3 rounded-lg border border-[#EBEBEB] shadow-sm cursor-pointer hover:border-[#2A45C2] transition-colors">
                                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                                            {biz.name} {biz.is_verified && <FaCheckCircle className="text-blue-500" size={10} />}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><FaMapMarkerAlt className="text-[#2A45C2]" /> {biz.location}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="w-2/3 bg-gray-200 relative flex items-center justify-center">
                                {/* Mock Map Placeholder */}
                                <div className="text-center p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-100">
                                    <FaMap className="text-[#2A45C2] mx-auto mb-3" size={40} />
                                    <h3 className="font-bold text-gray-900">Interactive Map View</h3>
                                    <p className="text-sm text-gray-500 mt-1">Displays pins for {filteredBusinesses.length} businesses based on geolocation data.</p>
                                </div>
                            </div>
                        </div>
                    ) :

                        /* --- GRID / LIST VIEW --- */
                        (
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                                {filteredBusinesses.map((biz) => (
                                    <div
                                        key={biz.id}
                                        onClick={() => handleOpenDetails(biz)}
                                        className={`bg-white border border-[#EBEBEB] p-5 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all group ${viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-4' : 'flex flex-col relative'}`}
                                    >

                                        {/* Featured Badge Absolute (Grid only) */}
                                        {biz.is_featured && viewMode === 'grid' && (
                                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                                <FaStar size={10} /> Featured
                                            </div>
                                        )}

                                        <div className={`flex items-start gap-4 ${viewMode === 'grid' ? 'mb-5' : 'flex-1'}`}>
                                            <div className="w-14 h-14 bg-gray-50 border border-[#EBEBEB] flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 shadow-sm group-hover:border-[#2A45C2]/30 transition-colors">
                                                {biz.logo_url ? (
                                                    <img src={biz.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[#2A45C2] text-xl font-black">{biz.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-md font-bold text-gray-900 leading-tight mb-1 flex items-center gap-1.5">
                                                    {biz.name}
                                                    {biz.is_verified && <FaCheckCircle className="text-blue-500" title="Verified" size={14} />}
                                                    {biz.is_featured && viewMode === 'list' && <FaStar className="text-yellow-500" title="Featured" size={14} />}
                                                </h3>
                                                <p className="text-xs font-bold text-[#2A45C2] bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">{biz.category}</p>
                                            </div>
                                        </div>

                                        <div className={`${viewMode === 'grid' ? 'mt-auto pt-4 border-t border-[#EBEBEB]' : 'sm:w-auto w-full border-t sm:border-t-0 border-[#EBEBEB] pt-3 sm:pt-0'} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                                            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                                                <div className="flex items-center text-xs font-medium text-gray-500 gap-1.5">
                                                    <FaMapMarkerAlt className="text-[#2A45C2]" size={12} />
                                                    <span className="truncate max-w-[150px]">{biz.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1 font-bold text-sm">
                                                    <FaStar className="text-yellow-400" size={14} />
                                                    <span className="text-gray-900">{getMockRating(biz.id)}</span>
                                                    <span className="text-[10px] text-gray-400 font-normal ml-1">(42 Reviews)</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={(e) => handleShare(e, biz.name)} className="text-gray-400 p-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-[#EBEBEB] transition-colors">
                                                    <FaShareAlt size={14} />
                                                </button>
                                                <button onClick={(e) => toggleFavorite(e, biz.id)} className={`${favorites.has(biz.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'} p-2 rounded-full border border-[#EBEBEB] transition-colors`}>
                                                    {favorites.has(biz.id) ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                ) : (
                    <div className="text-center py-10 bg-white border border-[#EBEBEB] rounded-xl">
                        <p className="text-gray-500 font-medium">No businesses found matching your criteria.</p>
                        <Button variant="outline" className="mt-3 rounded-lg border-[#EBEBEB] text-gray-700 text-sm" onClick={() => { setSearchTerm(''); setLocationSearch(''); setActiveCategory('All Categories'); setShowNearby(false); }}>
                            Clear All Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* --- Advanced Business Details Modal --- */}
            {isDetailsModalOpen && selectedBiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:max-h-[90vh] overflow-hidden border border-[#EBEBEB] flex flex-col relative">

                        {/* Header Banner */}
                        <div className="h-18 relative flex-shrink-0">
                            <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-4 right-4 bg-[#2a45c2] backdrop-blur text-white p-1 rounded-full transition-colors z-10">
                                <FaTimes size={12} />
                            </button>
                        </div>

                        {/* Profile Header Content */}
                        <div className="px-6 sm:px-8 relative pb-4 border-b border-[#EBEBEB] bg-white flex-shrink-0">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-2">
                                <div className="flex items-end gap-4">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-1 shadow-lg border border-[#EBEBEB] z-10 relative">
                                        {selectedBiz.logo_url ? (
                                            <img src={selectedBiz.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-4xl font-black text-[#2A45C2]">
                                                {selectedBiz.name.charAt(0)}
                                            </div>
                                        )}
                                        {selectedBiz.is_verified && (
                                            <div className="absolute -bottom-2 -right-2 bg-white p-0.5 rounded-full shadow-sm">
                                                <FaCheckCircle className="text-blue-500 text-2xl" title="Verified Business" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
                                            {selectedBiz.name}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge variant="primary" className="bg-blue-50 text-[#2A45C2] border border-blue-100 text-xs font-bold px-2 py-0.5">{selectedBiz.category}</Badge>
                                            <span className="flex items-center gap-1 font-bold text-sm text-gray-700">
                                                <FaStar className="text-yellow-400" /> {getMockRating(selectedBiz.id)} <span className="font-medium text-gray-400 text-xs underline cursor-pointer">(42 Reviews)</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 sm:mb-2 w-full sm:w-auto">
                                    <Button onClick={(e) => handleShare(e, selectedBiz.name)} variant="outline" className="flex-1 sm:flex-none border-[#EBEBEB] text-gray-700 font-bold shadow-sm py-2">
                                        <FaShareAlt /> Share
                                    </Button>
                                    <Button onClick={(e) => toggleFavorite(e, selectedBiz.id)} className={`flex-1 sm:flex-none py-2 font-bold shadow-sm ${favorites.has(selectedBiz.id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-[#2A45C2] text-white border-0'}`}>
                                        {favorites.has(selectedBiz.id) ? <><FaHeart /> Saved</> : <><FaRegHeart /> Save</>}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Body - Grid Layout */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 flex flex-col md:flex-row">

                            {/* Main Content Column */}
                            <div className="w-full md:w-2/3 p-6 sm:p-8 space-y-8">

                                {/* About Section */}
                                <section>
                                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">About the Business</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm">
                                        {selectedBiz.description || "No description provided for this business yet. Please contact them directly for more information regarding their services."}
                                    </p>
                                </section>

                                {/* Mock Gallery */}
                                <section>
                                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2"><FaImage className="text-[#2A45C2]" /> Business Gallery</h3>
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="aspect-video bg-gray-200 rounded-lg border border-[#EBEBEB] flex items-center justify-center overflow-hidden hover:opacity-90 cursor-pointer transition-opacity">
                                                <img src={`https://picsum.photos/seed/${selectedBiz.id}${i}/400/300`} alt="Gallery placeholder" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Mock Reviews */}
                                <section>
                                    <div className="flex justify-between items-end mb-4">
                                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Ratings & Reviews</h3>
                                        <Button className="text-xs py-1.5 px-3 bg-white text-[#2A45C2] border border-[#2A45C2]/30 font-bold">Write a Review</Button>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { name: "Alice M.", rating: 5, date: "2 weeks ago", text: "Excellent service! Very professional and timely." },
                                            { name: "John D.", rating: 4, date: "1 month ago", text: "Great experience overall. Would recommend to others in the area." }
                                        ].map((review, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl border border-[#EBEBEB] shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <FaUserCircle className="text-gray-300 text-2xl" />
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 leading-none">{review.name}</p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{review.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-yellow-400 text-xs">
                                                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < review.rating ? '' : 'text-gray-200'} />)}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600">{review.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                            </div>

                            {/* Sidebar Column */}
                            <div className="w-full md:w-1/3 bg-white border-l border-[#EBEBEB] p-6 sm:p-8 space-y-6">

                                {/* Contact Info */}
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4 border-b border-[#EBEBEB] pb-2">Contact Details</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5 p-2 bg-blue-50 text-[#2A45C2] rounded-lg"><FaMapMarkerAlt /></div>
                                            <div>
                                                <span className="block font-bold text-gray-900 text-xs mb-0.5">Address</span>
                                                <span className="text-gray-600">{selectedBiz.location}</span>
                                                {selectedBiz.google_maps_url && (
                                                    <a href={selectedBiz.google_maps_url} target="_blank" rel="noreferrer" className="block text-[#2A45C2] text-[10px] font-bold mt-1 hover:underline flex items-center gap-1">
                                                        <FaDirections /> Get Directions
                                                    </a>
                                                )}
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5 p-2 bg-blue-50 text-[#2A45C2] rounded-lg"><FaPhone /></div>
                                            <div>
                                                <span className="block font-bold text-gray-900 text-xs mb-0.5">Phone</span>
                                                <span className="text-gray-600">{selectedBiz.phone || 'Not provided'}</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5 p-2 bg-blue-50 text-[#2A45C2] rounded-lg"><FaEnvelope /></div>
                                            <div>
                                                <span className="block font-bold text-gray-900 text-xs mb-0.5">Email</span>
                                                {selectedBiz.email ? (
                                                    <a href={`mailto:${selectedBiz.email}`} className="text-[#2A45C2] hover:underline">{selectedBiz.email}</a>
                                                ) : <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5 p-2 bg-blue-50 text-[#2A45C2] rounded-lg"><FaGlobe /></div>
                                            <div>
                                                <span className="block font-bold text-gray-900 text-xs mb-0.5">Website</span>
                                                {selectedBiz.website ? (
                                                    <a href={selectedBiz.website} target="_blank" rel="noreferrer" className="text-[#2A45C2] hover:underline truncate max-w-[150px] block">{selectedBiz.website}</a>
                                                ) : <span className="text-gray-500">Not provided</span>}
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Direct Message Form */}
                                <div className="bg-gray-50 p-5 rounded-xl border border-[#EBEBEB]">
                                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-3"><FaPaperPlane className="text-[#2A45C2]" /> Message Business</h3>
                                    <form onSubmit={handleContactSubmit} className="space-y-3">
                                        <Input
                                            name="name" type="text" placeholder="Your Name" required
                                            value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                            className="bg-white border-[#EBEBEB] text-xs py-2"
                                        />
                                        <Input
                                            name="email" type="email" placeholder="Your Email" required
                                            value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                            className="bg-white border-[#EBEBEB] text-xs py-2"
                                        />
                                        <textarea
                                            name="message" rows="3" placeholder="How can they help you?" required
                                            value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#2A45C2] text-xs resize-none"
                                        ></textarea>
                                        <Button type="submit" disabled={isSending} className="w-full bg-[#2A45C2] text-white py-2 text-sm font-bold border-0">
                                            {isSending ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDirectoryCom;