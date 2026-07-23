import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import {
    FaImage,
    FaRegSmile,
    FaTimes,
    FaEllipsisH,
    FaThumbsUp,
    FaRegCommentDots,
    FaShare,
    FaCaretDown,
    FaPaperPlane,
    FaEdit,
    FaTrash,
    FaLink,
    FaWhatsapp,
    FaTwitter,
    FaLinkedin,
    FaHeart,
    FaLightbulb,
    FaLaughBeam,
    FaHandHoldingHeart,
    FaSignLanguage,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa';

const PostCom = ({ userName, userIdState, apiUrl }) => {
    const fileInputRef = useRef(null);

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editPostId, setEditPostId] = useState(null);
    const [postContent, setPostContent] = useState('');
    const [postImages, setPostImages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [feedPosts, setFeedPosts] = useState([]);
    const [sortBy, setSortBy] = useState('latest');

    // Follow State for Feed
    const [followedUsers, setFollowedUsers] = useState({});

    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [visibleCommentsCount, setVisibleCommentsCount] = useState({});

    const [expandedPost, setExpandedPost] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [activePostOptions, setActivePostOptions] = useState(null);
    const [activeShareMenu, setActiveShareMenu] = useState(null);
    const [hoveredReactionPostId, setHoveredReactionPostId] = useState(null);
    const [toastMsg, setToastMsg] = useState('');
    const [postToDelete, setPostToDelete] = useState(null);

    const reactions = [
        { type: 'like', Icon: FaThumbsUp, label: 'Like', color: 'text-blue-600', bgColor: 'bg-blue-600', textColor: 'text-white' },
        { type: 'celebrate', Icon: FaSignLanguage, label: 'Celebrate', color: 'text-green-600', bgColor: 'bg-green-600', textColor: 'text-white' },
        { type: 'support', Icon: FaHandHoldingHeart, label: 'Support', color: 'text-purple-500', bgColor: 'bg-purple-500', textColor: 'text-white' },
        { type: 'love', Icon: FaHeart, label: 'Love', color: 'text-red-500', bgColor: 'bg-red-500', textColor: 'text-white' },
        { type: 'insightful', Icon: FaLightbulb, label: 'Insightful', color: 'text-yellow-500', bgColor: 'bg-yellow-500', textColor: 'text-white' },
        { type: 'funny', Icon: FaLaughBeam, label: 'Funny', color: 'text-teal-500', bgColor: 'bg-teal-500', textColor: 'text-white' }
    ];

    const getReactionDetails = (reactionType) => {
        return reactions.find(r => r.type === reactionType) || reactions[0];
    };

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3500);
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/posts?userId=${userIdState}`);
            if (res.ok) {
                const data = await res.json();
                setFeedPosts(data);
            }
        } catch (e) { console.error(e) }
    };

    const fetchFollowStats = async () => {
        if (!userIdState) return;
        try {
            const res = await fetch(`${apiUrl}/api/users/${userIdState}/follow-stats`);
            if (res.ok) {
                const data = await res.json();
                const map = {};
                data.following_ids.forEach(id => map[id] = true);
                setFollowedUsers(map);
            }
        } catch (e) { console.error(e) }
    };

    useEffect(() => {
        if (userIdState) {
            fetchPosts();
            fetchFollowStats();
        }
    }, [userIdState, apiUrl]);

    useEffect(() => {
        if (expandedPost) {
            const updated = feedPosts.find(p => p.id === expandedPost.id);
            if (updated) setExpandedPost(updated);
        }
    }, [feedPosts, expandedPost]);

    // NEW LOGIC: Follow / Unfollow from the feed
    const handleToggleFollow = async (targetId) => {
        const isFollowing = followedUsers[targetId];

        // Optimistic update
        setFollowedUsers(prev => ({ ...prev, [targetId]: !isFollowing }));
        showToast(isFollowing ? "User unfollowed" : "Following user");

        try {
            await fetch(`${apiUrl}/api/users/${targetId}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followerId: userIdState })
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleEmojiClick = (emojiData) => setPostContent(prev => prev + emojiData.emoji);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setPostImages(prev => [...prev, reader.result]);
            reader.readAsDataURL(file);
        });
        e.target.value = null;
    };

    const removePreviewImage = (indexToRemove) => setPostImages(prev => prev.filter((_, idx) => idx !== indexToRemove));

    const handleSavePost = async () => {
        if (!postContent.trim() && postImages.length === 0) return;
        try {
            if (editPostId) {
                await fetch(`${apiUrl}/api/posts/${editPostId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userIdState, content: postContent, images: postImages })
                });
                showToast("Post updated successfully!");
            } else {
                await fetch(`${apiUrl}/api/posts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userIdState, authorName: userName, content: postContent, images: postImages })
                });
                showToast("Post created successfully!");
            }
            setPostContent('');
            setPostImages([]);
            setEditPostId(null);
            setShowEmojiPicker(false);
            setIsPostModalOpen(false);
            fetchPosts();
        } catch (e) { console.error(e) }
    };

    const handleEditInit = (post) => {
        setEditPostId(post.id);
        setPostContent(post.content);
        setPostImages(post.images || (post.image ? [post.image] : []));
        setIsPostModalOpen(true);
        setActivePostOptions(null);
    };

    const handleDeletePost = async (postId) => {
        try {
            await fetch(`${apiUrl}/api/posts/${postId}?userId=${userIdState}`, { method: 'DELETE' });
            fetchPosts();
            setActivePostOptions(null);
            setPostToDelete(null);
            showToast("Post deleted successfully!");
        } catch (e) { console.error(e) }
    };

    const handleReaction = async (postId, reactionType) => {
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userIdState, reactionType })
            });
            fetchPosts();
            setHoveredReactionPostId(null);
        } catch (e) { console.error(e) }
    };

    const generatePostLink = (postId) => `${window.location.origin}/user-dashboard?postId=${postId}`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("Link copied to clipboard!");
    };

    const handleShareClick = async (postId, platform) => {
        const link = generatePostLink(postId);
        const text = encodeURIComponent(`Check out this post on Agila Vetri: ${link}`);
        if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
        else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        else if (platform === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank');
        else if (platform === 'copy') copyToClipboard(link);

        try {
            await fetch(`${apiUrl}/api/posts/${postId}/share`, { method: 'POST' });
            fetchPosts();
        } catch (e) { console.error(e) }
        setActiveShareMenu(null);
    };

    const submitComment = async (postId) => {
        if (!commentText.trim()) return;
        try {
            await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userIdState, authorName: userName, content: commentText })
            });
            setCommentText('');
            fetchPosts();
        } catch (e) { console.error(e) }
    };

    const handleSeeMoreComments = (postId) => setVisibleCommentsCount(prev => ({ ...prev, [postId]: (prev[postId] || 5) + 10 }));

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const sortedFeedPosts = [...feedPosts].sort((a, b) => {
        if (sortBy === 'top') {
            const scoreA = parseInt(a.likes_count || 0) + parseInt(a.comments_count || 0);
            const scoreB = parseInt(b.likes_count || 0) + parseInt(b.comments_count || 0);
            return scoreB - scoreA;
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const getImagesArray = (post) => post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);

    const renderPostImagesGrid = (post) => {
        const images = getImagesArray(post);
        if (images.length === 0) return null;
        const handleImageClick = (idx) => { setExpandedPost(post); setCurrentImageIndex(idx); };

        if (images.length === 1) {
            return (
                <div className="w-full mt-2 bg-gray-50 border-t border-b border-gray-100 cursor-pointer" onClick={() => handleImageClick(0)}>
                    <img src={images[0]} alt="Post content" className="w-full h-auto max-h-[350px] object-cover" />
                </div>
            );
        }
        if (images.length === 2) {
            return (
                <div className="grid grid-cols-2 gap-0.5 mt-2 bg-white max-h-[400px] overflow-hidden cursor-pointer">
                    <img src={images[0]} onClick={() => handleImageClick(0)} className="w-full h-[400px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <img src={images[1]} onClick={() => handleImageClick(1)} className="w-full h-[400px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                </div>
            );
        }
        if (images.length === 3) {
            return (
                <div className="grid grid-cols-2 gap-0.5 mt-2 bg-white max-h-[400px] overflow-hidden cursor-pointer">
                    <img src={images[0]} onClick={() => handleImageClick(0)} className="w-full h-[400px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <div className="grid grid-rows-2 gap-0.5 h-[400px]">
                        <img src={images[1]} onClick={() => handleImageClick(1)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                        <img src={images[2]} onClick={() => handleImageClick(2)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    </div>
                </div>
            );
        }
        if (images.length >= 4) {
            return (
                <div className="grid grid-cols-2 grid-rows-2 gap-0.5 mt-2 bg-white h-[400px] overflow-hidden cursor-pointer">
                    <img src={images[0]} onClick={() => handleImageClick(0)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <img src={images[1]} onClick={() => handleImageClick(1)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <img src={images[2]} onClick={() => handleImageClick(2)} className="w-full h-[198px] object-cover hover:opacity-90 transition-opacity bg-gray-100" />
                    <div className="relative h-[198px] w-full bg-gray-100" onClick={() => handleImageClick(3)}>
                        <img src={images[3]} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                        {images.length > 4 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-3xl font-medium tracking-wide">
                                +{images.length - 4}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    };

    return (
        <>
            {toastMsg && (
                <div className="fixed top-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-2xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {toastMsg}
                </div>
            )}

            {postToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTrash className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-2">Delete Post?</h3>
                        <p className="text-sm text-gray-500 mb-6">This action cannot be undone. Are you sure you want to permanently delete this post?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setPostToDelete(null)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={() => handleDeletePost(postToDelete)} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:h-[calc(180vh-100px)] lg:overflow-y-auto hidden-scrollbar space-y-4 pb-10">
                <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-gray-200 p-4">
                    <div className="flex gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <button onClick={() => setIsPostModalOpen(true)} className="flex-1 text-left bg-white border border-gray-300 hover:bg-gray-50 rounded-full px-5 text-gray-500 font-medium text-sm transition-colors">
                            Start a post...
                        </button>
                    </div>
                    <div className="flex items-center px-2 text-gray-500 font-semibold text-sm">
                        <button onClick={() => setIsPostModalOpen(true)} className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                            <FaImage className="text-blue-500 text-lg" /> Media
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <div className="flex items-center gap-1 group relative cursor-pointer pr-1">
                        <span className="text-xs font-semibold text-gray-400">Sort by:</span>
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1 hover:text-gray-900 capitalize">
                            {sortBy} <FaCaretDown />
                        </span>
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden py-1">
                            <button onClick={() => setSortBy('latest')} className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${sortBy === 'latest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>Latest</button>
                            <button onClick={() => setSortBy('top')} className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${sortBy === 'top' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>Top</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {sortedFeedPosts.map(post => {
                        const activeReaction = post.user_reaction ? getReactionDetails(post.user_reaction) : null;
                        const ActiveIcon = activeReaction ? activeReaction.Icon : FaThumbsUp;

                        return (
                            <div key={post.id} className="bg-white rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-gray-200 relative">
                                <div className="p-4 flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                                            {post.author_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            {/* AUTHOR NAME AND FOLLOW BUTTON */}
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900 text-sm leading-tight hover:text-[#2A45C2] cursor-pointer">{post.author_name}</h4>
                                                {post.user_id !== userIdState && (
                                                    <button
                                                        onClick={() => handleToggleFollow(post.user_id)}
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${followedUsers[post.user_id] ? 'bg-gray-100 text-gray-500' : 'bg-[#EEF1FE] text-[#2A45C2] hover:bg-[#2A45C2] hover:text-white'}`}
                                                    >
                                                        {followedUsers[post.user_id] ? 'Following' : '+ Follow'}
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{post.author_title || 'Job Seeker'}</p>
                                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                {formatTime(post.created_at)} • <i className="fas fa-globe-americas"></i>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <button onClick={() => setActivePostOptions(activePostOptions === post.id ? null : post.id)} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                                            <FaEllipsisH />
                                        </button>
                                        {activePostOptions === post.id && (
                                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1">
                                                <button onClick={() => { copyToClipboard(generatePostLink(post.id)); setActivePostOptions(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaLink /> Copy Link</button>
                                                {post.user_id === userIdState && (
                                                    <>
                                                        <button onClick={() => handleEditInit(post)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaEdit /> Edit Post</button>
                                                        <button onClick={() => setPostToDelete(post.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><FaTrash /> Delete Post</button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-4 pb-2">
                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                </div>

                                {renderPostImagesGrid(post)}

                                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center text-[11px] text-gray-500 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex -space-x-1 hover:-space-x-0 transition-all cursor-pointer">
                                            {post.reaction_types && post.reaction_types.length > 0 ? (
                                                post.reaction_types.slice(0, 3).map((rt, idx) => {
                                                    const RTypeData = getReactionDetails(rt);
                                                    const RIcon = RTypeData.Icon;
                                                    return (
                                                        <div key={idx} className={`w-4 h-4 rounded-full flex items-center justify-center ${RTypeData.bgColor} border border-white relative z-${30 - idx * 10}`}>
                                                            <RIcon size={8} className="text-white" />
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-600 border border-white">
                                                    <FaThumbsUp size={8} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="hover:text-blue-600 hover:underline cursor-pointer transition-colors">{post.likes_count}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="hover:text-blue-600 hover:underline cursor-pointer transition-colors" onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}>{post.comments_count} comments</span>
                                        <span className="hover:text-blue-600 hover:underline cursor-pointer transition-colors">{post.share_count} shares</span>
                                    </div>
                                </div>

                                <div className="px-2 py-1 flex items-center justify-between border-b border-gray-50 relative">
                                    <div
                                        className="relative flex-1 flex justify-center"
                                        onMouseEnter={() => setHoveredReactionPostId(post.id)}
                                        onMouseLeave={() => setHoveredReactionPostId(null)}
                                    >
                                        <button onClick={() => handleReaction(post.id, activeReaction ? activeReaction.type : 'like')} className={`flex items-center gap-2 font-bold text-[13px] flex-1 justify-center py-3 rounded-lg transition-colors ${activeReaction ? activeReaction.color : 'text-gray-500 hover:bg-gray-100'}`}>
                                            <ActiveIcon className="text-[19px]" />
                                            <span className="capitalize hidden sm:block">{activeReaction ? activeReaction.label : 'Like'}</span>
                                        </button>

                                        {hoveredReactionPostId === post.id && (
                                            <div className="absolute bottom-full mb-1 left-2 flex items-center gap-1 bg-white border border-gray-100 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-1.5 z-30 animate-fade-in-up transition-all duration-200">
                                                {reactions.map(r => {
                                                    const ReactionIcon = r.Icon;
                                                    return (
                                                        <button
                                                            key={r.type}
                                                            onClick={(e) => { e.stopPropagation(); handleReaction(post.id, r.type); }}
                                                            className={`w-10 h-10 rounded-full hover:-translate-y-2 hover:scale-110 transition-all duration-200 flex items-center justify-center ${r.bgColor} shadow-sm border border-transparent hover:border-gray-200`}
                                                            title={r.label}
                                                        >
                                                            <ReactionIcon className="text-xl text-white" />
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center gap-2 text-gray-500 font-bold text-[13px] hover:bg-gray-100 flex-1 justify-center py-3 rounded-lg transition-colors">
                                        <FaRegCommentDots className="text-[19px]" /> <span className="hidden sm:block">Comment</span>
                                    </button>

                                    <div className="relative flex-1 flex justify-center">
                                        <button onClick={() => setActiveShareMenu(activeShareMenu === post.id ? null : post.id)} className="flex items-center gap-2 text-gray-500 font-bold text-[13px] hover:bg-gray-100 flex-1 justify-center py-3 rounded-lg transition-colors">
                                            <FaShare className="text-[19px]" /> <span className="hidden sm:block">Share</span>
                                        </button>

                                        {activeShareMenu === post.id && (
                                            <div className="absolute bottom-full mb-1 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1 right-0 sm:left-1/2 sm:transform sm:-translate-x-1/2">
                                                <button onClick={() => handleShareClick(post.id, 'whatsapp')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaWhatsapp className="text-green-500 text-lg" /> WhatsApp</button>
                                                <button onClick={() => handleShareClick(post.id, 'twitter')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaTwitter className="text-blue-400 text-lg" /> Twitter</button>
                                                <button onClick={() => handleShareClick(post.id, 'linkedin')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaLinkedin className="text-blue-700 text-lg" /> LinkedIn</button>
                                                <button onClick={() => handleShareClick(post.id, 'copy')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FaLink className="text-gray-500 text-lg" /> Copy Link</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {activeCommentPostId === post.id && (
                                    <div className="bg-gray-50 rounded-b-xl border-t border-gray-100">
                                        <div className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                                    {userName.charAt(0).toUpperCase()}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors"
                                                    onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                                                />
                                                <button onClick={() => submitComment(post.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                                                    <FaPaperPlane size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {post.comments_data && post.comments_data.length > 0 && (() => {
                                            const visibleCount = visibleCommentsCount[post.id] || 5;
                                            const remainingCount = post.comments_data.length - visibleCount;

                                            return (
                                                <div className="px-4 pb-4 max-h-[300px] overflow-y-auto">
                                                    {post.comments_data.slice(0, visibleCount).map(comment => (
                                                        <div key={comment.id} className="mb-3 flex gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden mt-1">
                                                                {comment.author_name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-200 flex-1 shadow-sm">
                                                                <div className="flex justify-between items-start">
                                                                    <span className="font-bold text-[13px] text-gray-900 block">{comment.author_name}</span>
                                                                    <span className="text-[10px] text-gray-400 block">{formatTime(comment.created_at)}</span>
                                                                </div>
                                                                <span className="text-[13px] text-gray-700 mt-1 block leading-snug">{comment.content}</span>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {remainingCount > 0 && (
                                                        <button onClick={() => handleSeeMoreComments(post.id)} className="text-[13px] font-bold text-gray-500 hover:text-blue-600 transition-colors ml-10 mt-1">
                                                            Load more comments ({remainingCount} remaining)
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {isPostModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-fade-in">
                    <div className="bg-white w-full sm:w-[650px] sm:rounded-xl shadow-2xl flex flex-col h-full sm:h-auto max-h-screen relative">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <div className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 cursor-pointer">
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{userName}</h3>
                                        <FaCaretDown className="text-gray-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Post to Anyone</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsPostModalOpen(false); setShowEmojiPicker(false); setPostImages([]); setEditPostId(null); setPostContent(''); }} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 min-h-[150px] flex flex-col">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="What do you want to talk about?"
                                className="w-full flex-1 text-lg outline-none resize-none placeholder-gray-500 text-gray-800 min-h-[100px]"
                                autoFocus
                            />
                            {postImages.length > 0 && (
                                <div className={`grid gap-2 mt-4 ${postImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {postImages.map((img, idx) => (
                                        <div key={idx} className="relative inline-block border border-gray-200 rounded-lg p-1 bg-gray-50">
                                            <img src={img} alt={`Preview ${idx}`} className="w-full h-auto max-h-[150px] object-cover rounded-md" />
                                            <button onClick={() => removePreviewImage(idx)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm">
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {showEmojiPicker && (
                            <div className="absolute bottom-[70px] left-4 z-50 shadow-xl rounded-lg">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}

                        <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-xl">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors">
                                    <FaRegSmile size={22} />
                                </button>
                                <button onClick={() => fileInputRef.current.click()} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors">
                                    <FaImage size={20} />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSavePost}
                                    disabled={!postContent.trim() && postImages.length === 0}
                                    className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${postContent.trim() || postImages.length > 0
                                        ? 'bg-[#0a66c2] text-white hover:bg-[#004182] shadow-md'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {editPostId ? 'Update' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {expandedPost && (
                <div className="fixed inset-0 z-[120] flex bg-black/95 animate-fade-in flex-col md:flex-row">
                    <div className="flex-1 relative flex items-center justify-center h-[60vh] md:h-screen">
                        <button onClick={() => setExpandedPost(null)} className="absolute top-4 left-4 text-white p-2 bg-black/50 hover:bg-white/20 rounded-full transition-colors z-20">
                            <FaTimes size={20} />
                        </button>
                        {getImagesArray(expandedPost).length > 1 && (
                            <>
                                <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? getImagesArray(expandedPost).length - 1 : prev - 1)} className="absolute left-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 hidden md:block">
                                    <FaChevronLeft size={20} />
                                </button>
                                <button onClick={() => setCurrentImageIndex(prev => prev === getImagesArray(expandedPost).length - 1 ? 0 : prev + 1)} className="absolute right-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 hidden md:block">
                                    <FaChevronRight size={20} />
                                </button>
                            </>
                        )}
                        <img src={getImagesArray(expandedPost)[currentImageIndex]} className="max-w-full max-h-full object-contain" />
                    </div>

                    <div className="w-full md:w-[380px] lg:w-[450px] bg-white flex flex-col h-[40vh] md:h-screen overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 hidden md:flex">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-base shrink-0">
                                    {expandedPost.author_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{expandedPost.author_name}</h4>
                                    <p className="text-[11px] text-gray-500">{expandedPost.author_title || 'Job Seeker'}</p>
                                </div>
                            </div>
                            <button onClick={() => setExpandedPost(null)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{expandedPost.content}</p>

                            <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-[11px] text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="bg-blue-50 text-blue-600 p-1 rounded-full"><FaThumbsUp size={10} /></div>
                                    <span>{expandedPost.likes_count}</span>
                                </div>
                                <div className="flex gap-3">
                                    <span>{expandedPost.comments_count} comments</span>
                                    <span>{expandedPost.share_count} shares</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-y border-gray-50 py-1 relative">
                                <button onClick={() => handleReaction(expandedPost.id, expandedPost.user_reaction ? expandedPost.user_reaction : 'like')} className={`flex items-center gap-2 font-bold text-[13px] flex-1 justify-center py-2.5 rounded-lg transition-colors ${expandedPost.user_reaction ? getReactionDetails(expandedPost.user_reaction).color : 'text-gray-500 hover:bg-gray-100'}`}>
                                    {expandedPost.user_reaction ? (
                                        <span className="text-lg">{getReactionDetails(expandedPost.user_reaction).Icon({})}</span>
                                    ) : (
                                        <FaThumbsUp className="text-lg" />
                                    )}
                                    <span className="capitalize">{expandedPost.user_reaction ? getReactionDetails(expandedPost.user_reaction).label : 'Like'}</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 font-bold text-[13px] hover:bg-gray-100 flex-1 justify-center py-2.5 rounded-lg transition-colors">
                                    <FaRegCommentDots className="text-[19px]" /> Comment
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#2A45C2] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors"
                                    onKeyDown={(e) => e.key === 'Enter' && submitComment(expandedPost.id)}
                                />
                                <button onClick={() => submitComment(expandedPost.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                                    <FaPaperPlane size={12} />
                                </button>
                            </div>

                            {expandedPost.comments_data && expandedPost.comments_data.length > 0 && (
                                <div className="pt-2">
                                    {expandedPost.comments_data.map(comment => (
                                        <div key={comment.id} className="mb-3 flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden mt-1">
                                                {comment.author_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl flex-1 shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-[13px] text-gray-900 block">{comment.author_name}</span>
                                                    <span className="text-[10px] text-gray-400 block">{formatTime(comment.created_at)}</span>
                                                </div>
                                                <span className="text-[13px] text-gray-700 mt-1 block leading-snug">{comment.content}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostCom;