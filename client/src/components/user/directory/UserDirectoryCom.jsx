import React, { useState, useEffect } from 'react';
import {
    FaSearch, FaMapMarkerAlt, FaHeart, FaRegHeart, FaStar, FaTh, FaList,
    FaMap, FaCheckCircle, FaGlobe, FaEnvelope, FaPhone, FaShareAlt,
    FaDirections, FaTimes, FaImage, FaPaperPlane, FaUserCircle, FaCrown
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';
import Shimmer from '../../ui/Shimmer';

const UserDirectoryCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Categories');
    const [viewMode, setViewMode] = useState('grid');
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

        try {
            await fetch(`${apiUrl}/api/businesses/${biz.id}/view`, { method: 'POST' });
        } catch (e) { }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setIsSending(true);
        setTimeout(() => {
            toast.success(`Message sent to ${selectedBiz.name}!`);
            setContactForm({ name: '', email: '', message: '' });
            setIsSending(false);
        }, 1000);
    };

    const filterOptions = ['All Categories', ...categories];

    const filteredBusinesses = businesses.filter((biz) => {
        const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            biz.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = biz.location.toLowerCase().includes(locationSearch.toLowerCase());
        const matchesCategory = activeCategory === 'All Categories' || biz.category === activeCategory;
        const matchesNearby = showNearby ? (biz.id % 2 === 0) : true;

        return matchesSearch && matchesLocation && matchesCategory && matchesNearby;
    });

    return (
        <div className="max-w-7xl mx-auto p-3 md:p-4 rounded-2xl bg-[#F5F6FC] relative">
            <Toaster position="top-right" />

            <div className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-7 md:py-6 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] mb-3">
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                <div className="pointer-events-none absolute -right-14 -top-14 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

                <div className="relative">
                    <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-3">Business Directory</h1>

                    <div className="bg-white/95 backdrop-blur rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-[0_8px_30px_rgba(20,27,60,0.25)]">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={14} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search businesses, services..."
                                className="w-full pl-10 pr-3 py-2 bg-[#F5F6FC] border border-transparent rounded-lg focus:outline-none focus:border-[#2A45C2] focus:bg-white transition-colors text-sm"
                            />
                        </div>
                        <div className="relative flex-1">
                            <FaMapMarkerAlt className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                placeholder="Location (e.g. City, Area)"
                                className="w-full pl-10 pr-3 py-2 bg-[#F5F6FC] border border-transparent rounded-lg focus:outline-none focus:border-[#2A45C2] focus:bg-white transition-colors text-sm"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowNearby(!showNearby)}
                            className={`py-2 px-4 font-bold rounded-lg whitespace-nowrap border transition-colors flex items-center gap-1.5 text-sm ${showNearby ? 'bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-transparent' : 'bg-white text-gray-600 border-[#E4E7F2] hover:bg-gray-50'}`}
                        >
                            <FaDirections className={showNearby ? 'text-white' : 'text-gray-400'} size={13} /> Nearby
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex gap-1.5 py-2.5 overflow-x-auto custom-scrollbar">
                {!isLoading ? (
                    filterOptions.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveCategory(filter)}
                            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${activeCategory === filter
                                ? 'bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white shadow-[0_4px_12px_rgba(42,69,194,0.25)]'
                                : 'bg-white border border-[#E4E7F2] text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {filter}
                        </button>
                    ))
                ) : (
                    Array(5).fill(0).map((_, idx) => (
                        <Shimmer key={idx} className="w-24 h-8 rounded-lg shrink-0" />
                    ))
                )}
            </div>

            <div>
                <div className="flex justify-between items-center mb-2.5 px-0.5">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Directory Results</h2>
                        <Badge variant="primary" className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-[#2A45C2] border border-[#E4E7F2] font-bold">
                            {isLoading ? '...' : filteredBusinesses.length} found
                        </Badge>
                    </div>

                    <div className="flex items-center gap-0.5 bg-white border border-[#E4E7F2] p-0.5 rounded-lg">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`} title="Grid View">
                            <FaTh size={13} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`} title="List View">
                            <FaList size={13} />
                        </button>
                        <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-blue-50 text-[#2A45C2]' : 'text-gray-400'}`} title="Map View">
                            <FaMap size={13} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5" : "flex flex-col gap-2"}>
                        {Array(6).fill(0).map((_, idx) => (
                            <div key={idx} className="bg-white border border-[#E4E7F2] p-3.5 rounded-2xl h-[120px] shadow-[0_2px_16px_rgba(30,41,89,0.02)]">
                                <Shimmer className="w-full h-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : filteredBusinesses.length > 0 ? (
                    viewMode === 'map' ? (
                        <div className="bg-white border border-[#E4E7F2] rounded-xl h-[560px] flex overflow-hidden shadow-[0_2px_16px_rgba(30,41,89,0.05)]">
                            <div className="w-1/3 border-r border-[#E4E7F2] overflow-y-auto custom-scrollbar p-2 space-y-2 bg-[#F7F8FC]">
                                {filteredBusinesses.map(biz => (
                                    <div key={biz.id} onClick={() => handleOpenDetails(biz)} className="bg-white p-2.5 rounded-lg border border-[#E4E7F2] cursor-pointer hover:border-[#2A45C2] transition-colors">
                                        <h4 className="font-bold text-gray-900 text-[13px] flex items-center gap-1">
                                            {biz.name} {biz.is_verified && <FaCheckCircle className="text-[#2A45C2]" size={10} />}
                                        </h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1"><FaMapMarkerAlt className="text-[#2A45C2]" size={10} /> {biz.location}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="w-2/3 bg-gray-200 relative flex items-center justify-center">
                                <div className="text-center p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-100">
                                    <FaMap className="text-[#2A45C2] mx-auto mb-3" size={36} />
                                    <h3 className="font-bold text-gray-900 text-sm">Interactive Map View</h3>
                                    <p className="text-xs text-gray-500 mt-1">Displays pins for {filteredBusinesses.length} businesses based on geolocation data.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5" : "flex flex-col gap-2"}>
                            {filteredBusinesses.map((biz) => (
                                <div
                                    key={biz.id}
                                    onClick={() => handleOpenDetails(biz)}
                                    className={`bg-white border border-[#E7E9F7] p-3.5 rounded-2xl cursor-pointer shadow-[0_2px_16px_rgba(30,41,89,0.05)] hover:shadow-[0_10px_28px_rgba(42,69,194,0.14)] hover:-translate-y-0.5 transition-all duration-200 group ${viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-3' : 'flex flex-col relative'}`}
                                >

                                    {biz.is_featured && viewMode === 'grid' && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#D4A017] to-[#F2C14E] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-[0_4px_12px_rgba(212,160,23,0.35)] flex items-center gap-1">
                                            <FaStar size={10} /> Featured
                                        </div>
                                    )}

                                    <div className={`flex items-start gap-3 ${viewMode === 'grid' ? 'mb-3.5' : 'flex-1'}`}>
                                        <div className="w-11 h-11 bg-gradient-to-br from-[#2A45C2] to-[#5B4FE0] flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 shadow-[0_4px_10px_rgba(42,69,194,0.25)] group-hover:scale-105 transition-transform">
                                            {biz.logo_url ? (
                                                <img src={biz.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-base font-black">{biz.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-[13px] font-bold text-gray-900 leading-tight mb-1 flex items-center gap-1.5 truncate">
                                                {biz.name}
                                                {biz.is_verified && <FaCheckCircle className="text-[#2A45C2] shrink-0" title="Verified" size={12} />}
                                                {biz.is_featured && viewMode === 'list' && <FaStar className="text-[#D4A017] shrink-0" title="Featured" size={12} />}
                                            </h3>
                                            <p className="text-[10px] font-bold text-[#2A45C2] bg-blue-50 inline-block px-1.5 py-0.5 rounded border border-blue-100">{biz.category}</p>
                                        </div>
                                    </div>

                                    <div className={`${viewMode === 'grid' ? 'mt-auto pt-3 border-t border-[#EDEFF7]' : 'sm:w-auto w-full border-t sm:border-t-0 border-[#EDEFF7] pt-2.5 sm:pt-0'} flex flex-col sm:flex-row items-center justify-between gap-3`}>
                                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                                            <div className="flex items-center text-[11px] font-medium text-gray-500 gap-1.5">
                                                <FaMapMarkerAlt className="text-[#2A45C2]" size={11} />
                                                <span className="truncate max-w-[150px]">{biz.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1 font-bold text-xs">
                                                <FaStar className="text-[#F2C14E]" size={12} />
                                                <span className="text-gray-900">{getMockRating(biz.id)}</span>
                                                <span className="text-[10px] text-gray-400 font-normal ml-1">(42 Reviews)</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-1.5">
                                            <button onClick={(e) => handleShare(e, biz.name)} className="text-gray-400 p-1.5 bg-[#F7F8FC] hover:bg-gray-100 rounded-full border border-[#E4E7F2] transition-colors">
                                                <FaShareAlt size={12} />
                                            </button>
                                            <button onClick={(e) => toggleFavorite(e, biz.id)} className={`${favorites.has(biz.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-[#F7F8FC] hover:bg-gray-100'} p-1.5 rounded-full border border-[#E4E7F2] transition-colors`}>
                                                {favorites.has(biz.id) ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-10 bg-white border border-[#E4E7F2] rounded-xl">
                        <p className="text-gray-500 font-medium text-sm">No businesses found matching your criteria.</p>
                        <Button variant="outline" className="mt-3 rounded-lg border-[#E4E7F2] text-gray-700 text-sm" onClick={() => { setSearchTerm(''); setLocationSearch(''); setActiveCategory('All Categories'); setShowNearby(false); }}>
                            Clear All Filters
                        </Button>
                    </div>
                )}
            </div>

            {isDetailsModalOpen && selectedBiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:max-h-[90vh] overflow-hidden border border-[#E4E7F2] flex flex-col relative">

                        <div className="h-16 relative flex-shrink-0 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 30%, rgba(255,255,255,0.16), transparent 45%)' }} />
                            <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-3 right-3 bg-white/15 hover:bg-white/25 backdrop-blur text-white p-1.5 rounded-full transition-colors z-10">
                                <FaTimes size={12} />
                            </button>
                        </div>

                        <div className="px-5 sm:px-7 relative pb-3.5 border-b border-[#E4E7F2] bg-white flex-shrink-0">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-9 sm:-mt-11 mb-1.5">
                                <div className="flex items-end gap-3.5">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl p-1 shadow-[0_8px_24px_rgba(20,27,60,0.2)] border border-[#E4E7F2] z-10 relative">
                                        {selectedBiz.logo_url ? (
                                            <img src={selectedBiz.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#2A45C2] to-[#5B4FE0] rounded-xl flex items-center justify-center text-3xl font-black text-white">
                                                {selectedBiz.name.charAt(0)}
                                            </div>
                                        )}
                                        {selectedBiz.is_verified && (
                                            <div className="absolute -bottom-1.5 -right-1.5 bg-white p-0.5 rounded-full shadow-sm">
                                                <FaCheckCircle className="text-[#2A45C2] text-xl" title="Verified Business" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-1.5">
                                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                                            {selectedBiz.name}
                                        </h2>
                                        <div className="flex items-center gap-2.5 mt-1">
                                            <Badge variant="primary" className="bg-blue-50 text-[#2A45C2] border border-blue-100 text-[11px] font-bold px-2 py-0.5">{selectedBiz.category}</Badge>
                                            <span className="flex items-center gap-1 font-bold text-xs text-gray-700">
                                                <FaStar className="text-[#F2C14E]" size={12} /> {getMockRating(selectedBiz.id)} <span className="font-medium text-gray-400 text-[11px] underline cursor-pointer">(42 Reviews)</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 sm:mb-1.5 w-full sm:w-auto">
                                    <Button onClick={(e) => handleShare(e, selectedBiz.name)} variant="outline" className="flex-1 sm:flex-none border-[#E4E7F2] text-gray-700 font-bold py-1.5 text-sm">
                                        <FaShareAlt size={13} /> Share
                                    </Button>
                                    <Button onClick={(e) => toggleFavorite(e, selectedBiz.id)} className={`flex-1 sm:flex-none py-1.5 font-bold text-sm ${favorites.has(selectedBiz.id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white border-0'}`}>
                                        {favorites.has(selectedBiz.id) ? <><FaHeart size={13} /> Saved</> : <><FaRegHeart size={13} /> Save</>}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F7F8FC] flex flex-col md:flex-row">

                            <div className="w-full md:w-2/3 p-5 sm:p-6 space-y-5">

                                <section>
                                    <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">About the Business</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-[#E4E7F2]">
                                        {selectedBiz.description || "No description provided for this business yet. Please contact them directly for more information regarding their services."}
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FaImage className="text-[#2A45C2]" size={12} /> Business Gallery</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="aspect-video bg-gray-200 rounded-lg border border-[#E4E7F2] flex items-center justify-center overflow-hidden hover:opacity-90 cursor-pointer transition-opacity">
                                                <img src={`https://picsum.photos/seed/${selectedBiz.id}${i}/400/300`} alt="Gallery placeholder" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex justify-between items-end mb-2.5">
                                        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Ratings & Reviews</h3>
                                        <Button className="text-[11px] py-1.5 px-3 bg-white text-[#2A45C2] border border-[#2A45C2]/30 font-bold">Write a Review</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { name: "Alice M.", rating: 5, date: "2 weeks ago", text: "Excellent service! Very professional and timely." },
                                            { name: "John D.", rating: 4, date: "1 month ago", text: "Great experience overall. Would recommend to others in the area." }
                                        ].map((review, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#E4E7F2]">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <FaUserCircle className="text-gray-300 text-xl" />
                                                        <div>
                                                            <p className="text-[13px] font-bold text-gray-900 leading-none">{review.name}</p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{review.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-[#F2C14E] text-[11px]">
                                                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < review.rating ? '' : 'text-gray-200'} />)}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600">{review.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                            </div>

                            <div className="w-full md:w-1/3 bg-white border-l border-[#E4E7F2] p-5 sm:p-6 space-y-5">

                                <div>
                                    <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3 border-b border-[#E4E7F2] pb-2">Contact Details</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2.5 text-sm">
                                            <div className="mt-0.5 p-1.5 bg-blue-50 text-[#2A45C2] rounded-lg"><FaMapMarkerAlt size={13} /></div>
                                            <div>
                                                <span className="block font-bold text-gray-900 text-[11px] mb-0.5">Address</span>
                                                <span className="text-gray-600 text-[13px]">{selectedBiz.location}</span>
                                                {selectedBiz.google_maps_url && (
                                                    <a href={selectedBiz.google_maps_url} target="_blank" rel="noreferrer" className="text-[#2A45C2] text-[10px] font-bold mt-1 hover:underline flex items-center gap-1">
                                                        <FaDirections size={10} /> Get Directions
                                                    </a>
                                                )}
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2.5 text-sm">
                                            <div className="mt-0.5 p-1.5 bg-blue-50 text-[#2A45C2] rounded-lg"><FaPhone size={13} /></div>
                                            <div>
                                                <span className="block font-bold text-gray-900 text-[11px] mb-0.5">Phone</span>
                                                <span className="text-gray-600 text-[13px]">{selectedBiz.phone || 'Not provided'}</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2.5 text-sm">
                                            <div className="mt-0.5 p-1.5 bg-blue-50 text-[#2A45C2] rounded-lg"><FaEnvelope size={13} /></div>
                                            <div>
                                                <span className="block font-bold text-gray-900 text-[11px] mb-0.5">Email</span>
                                                {selectedBiz.email ? (
                                                    <a href={`mailto:${selectedBiz.email}`} className="text-[#2A45C2] hover:underline text-[13px]">{selectedBiz.email}</a>
                                                ) : <span className="text-gray-500 text-[13px]">Not provided</span>}
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2.5 text-sm">
                                            <div className="mt-0.5 p-1.5 bg-blue-50 text-[#2A45C2] rounded-lg"><FaGlobe size={13} /></div>
                                            <div>
                                                <span className="block font-bold text-gray-900 text-[11px] mb-0.5">Website</span>
                                                {selectedBiz.website ? (
                                                    <a href={selectedBiz.website} target="_blank" rel="noreferrer" className="text-[#2A45C2] hover:underline truncate max-w-[150px] block text-[13px]">{selectedBiz.website}</a>
                                                ) : <span className="text-gray-500 text-[13px]">Not provided</span>}
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-[#F7F8FC] p-4 rounded-xl border border-[#E4E7F2]">
                                    <h3 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5 mb-2.5"><FaPaperPlane className="text-[#2A45C2]" size={12} /> Message Business</h3>
                                    <form onSubmit={handleContactSubmit} className="space-y-2.5">
                                        <Input
                                            name="name" type="text" placeholder="Your Name" required
                                            value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                            className="bg-white border-[#E4E7F2] text-xs py-2"
                                        />
                                        <Input
                                            name="email" type="email" placeholder="Your Email" required
                                            value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                            className="bg-white border-[#E4E7F2] text-xs py-2"
                                        />
                                        <textarea
                                            name="message" rows="3" placeholder="How can they help you?" required
                                            value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-[#E4E7F2] rounded-lg focus:outline-none focus:border-[#2A45C2] text-xs resize-none"
                                        ></textarea>
                                        <Button type="submit" disabled={isSending} className="w-full bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white py-2 text-sm font-bold border-0">
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