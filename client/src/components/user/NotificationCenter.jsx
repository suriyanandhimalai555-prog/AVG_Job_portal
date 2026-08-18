import React, { useState, useEffect, useCallback } from 'react';
import {
    FaBell, FaCheckDouble, FaTrashAlt, FaCircle, FaCommentDots
} from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import Shimmer from '../ui/Shimmer';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

// --- Helpers for Decryption, Formatting, and Unread Counts ---
const getUnreadCounts = (userId) => {
    try {
        return JSON.parse(localStorage.getItem(`unread_msgs_${userId}`)) || {};
    } catch (e) {
        return {};
    }
};

const generateSharedKey = (id1, id2) => {
    return [id1, id2].sort().join('-') + '-avg-secret-salt';
};

const decryptMessage = (cipherText, myId, senderId) => {
    try {
        if (!cipherText) return "";
        const key = generateSharedKey(myId, senderId);
        const bytes = CryptoJS.AES.decrypt(cipherText, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "🔒 [Encrypted message]";
    }
};

// FIX: Added formatter to prevent Base64 audio strings from displaying as raw text
const formatPreviewText = (text) => {
    if (typeof text === 'string' && text.startsWith('data:audio')) {
        return '🎤 Voice Message';
    }
    return text;
};

const NotificationCenter = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'
    const [notifications, setNotifications] = useState([]);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    // Main function to fetch and decrypt chat notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;

            const res = await fetch(`${apiUrl}/api/chat/contacts/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const unreadMap = getUnreadCounts(userId);

                // Filter only contacts who have sent an unread message
                const chatNotifications = data
                    .filter(contact => {
                        const cid = contact.id || contact.contact_id;
                        return unreadMap[cid] && unreadMap[cid] > 0;
                    })
                    .map(contact => {
                        const cid = contact.id || contact.contact_id;
                        const contactName = contact.full_name || contact.name || 'Unknown User';

                        const decryptedMsg = contact.lastMessage
                            ? decryptMessage(contact.lastMessage, userId, cid)
                            : `You have ${unreadMap[cid]} new message(s)`;

                        // FIX: Apply the preview formatter to hide the raw Base64 data
                        const previewMessage = formatPreviewText(decryptedMsg);

                        return {
                            id: `chat_${cid}`,
                            contactId: cid,
                            rawContact: contact, // Store raw data to pass to the chat widget
                            type: 'chat',
                            title: `New message from ${contactName}`,
                            message: previewMessage,
                            time: "New",
                            isRead: false,
                            icon: <FaCommentDots />,
                            color: "text-[#2A45C2]",
                            bg: "bg-[#EEF1FE]"
                        };
                    });

                setNotifications(chatNotifications);
            }
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    // Fetch on initial mount
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Listen to real-time chat updates to auto-refresh notifications
    useEffect(() => {
        const handleUnreadUpdate = () => {
            fetchNotifications();
        };
        window.addEventListener('chat-unread-update', handleUnreadUpdate);
        return () => window.removeEventListener('chat-unread-update', handleUnreadUpdate);
    }, [fetchNotifications]);

    const handleMarkAllAsRead = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const counts = getUnreadCounts(payload.id);

            // Zero out all active notifications
            notifications.forEach(n => {
                if (n.type === 'chat') {
                    counts[n.contactId] = 0;
                }
            });

            localStorage.setItem(`unread_msgs_${payload.id}`, JSON.stringify(counts));

            // Broadcast that counts are clear
            window.dispatchEvent(new CustomEvent('chat-unread-update', { detail: 0 }));
        }

        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const handleClearAll = () => {
        handleMarkAllAsRead(); // Mark read first to clear the red dots
        setNotifications([]);
    };

    const handleNotificationClick = (notif) => {
        if (notif.type === 'chat') {
            // 1. Dispatch custom event to open GlobalChatWidget to this exact user
            window.dispatchEvent(new CustomEvent('open-global-chat', {
                detail: notif.rawContact
            }));

            // 2. Clear their unread count in local storage
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const counts = getUnreadCounts(payload.id);
                counts[notif.contactId] = 0;
                localStorage.setItem(`unread_msgs_${payload.id}`, JSON.stringify(counts));

                // 3. Update the global Navbar UI red dot
                const totalUnreadCount = Object.values(counts).reduce((sum, count) => sum + (count || 0), 0);
                window.dispatchEvent(new CustomEvent('chat-unread-update', { detail: totalUnreadCount }));
            }
        }

        // 4. Mark visually as read in this list
        setNotifications(notifications.map(n =>
            n.id === notif.id ? { ...n, isRead: true } : n
        ));
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // --- SHIMMER LOADING STATE ---
    if (isLoading) {
        return (
            <div className="max-w-[1000px] mx-auto space-y-4 p-2 md:p-4 rounded-2xl bg-[#F5F6FC] min-h-screen">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_rgba(30,41,89,0.04)] border border-[#E7E9F7]">
                    <div className="flex justify-between items-center mb-8 border-b border-[#E7E9F7] pb-4">
                        <div>
                            <Shimmer className="w-48 h-8 rounded mb-2 bg-gray-200" />
                            <Shimmer className="w-64 h-4 rounded bg-gray-200" />
                        </div>
                        <Shimmer className="w-32 h-10 rounded-xl bg-gray-200" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 rounded-2xl border border-gray-100 flex gap-4">
                                <Shimmer className="w-12 h-12 rounded-full shrink-0 bg-gray-200" />
                                <div className="flex-1">
                                    <Shimmer className="w-1/3 h-5 rounded mb-2 bg-gray-200" />
                                    <Shimmer className="w-2/3 h-4 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-4 p-2 md:p-4 rounded-2xl bg-[#F5F6FC] min-h-screen animate-fade-in">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_rgba(30,41,89,0.04)] border border-[#E7E9F7]">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-[#E7E9F7] pb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <Badge className="bg-red-100 text-red-600 border-red-200 text-xs px-2 py-0.5">
                                    {unreadCount} New
                                </Badge>
                            )}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">Stay updated on your active chat messages and alerts.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleMarkAllAsRead}
                            disabled={notifications.length === 0}
                            className="text-gray-500 hover:text-[#2A45C2] text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaCheckDouble /> Mark all as read
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleClearAll}
                            disabled={notifications.length === 0}
                            className="text-gray-500 hover:text-red-500 text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaTrashAlt /> Clear all
                        </Button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-[#141B3C] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'unread' ? 'bg-[#141B3C] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Unread
                    </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${notification.isRead
                                    ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                    : 'bg-[#F9FAFF] border-[#2A45C2]/20 shadow-sm hover:border-[#2A45C2]/40 hover:shadow-md'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-lg ${notification.bg} ${notification.color}`}>
                                    {notification.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-base truncate pr-2 ${notification.isRead ? 'font-bold text-gray-800' : 'font-black text-gray-900'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap mt-1">
                                            {notification.time}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-gray-500 font-medium' : 'text-gray-700 font-bold'}`}>
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="shrink-0 mt-2">
                                        <FaCircle className="text-[#2A45C2] text-[10px] animate-pulse" />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-gray-300">
                                <FaBell size={28} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-1">You're all caught up!</h3>
                            <p className="text-sm font-medium text-gray-500">No new notifications to show right now.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;