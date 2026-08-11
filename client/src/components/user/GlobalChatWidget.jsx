import React, { useState, useEffect, useRef } from 'react';
import {
    FaCommentDots, FaTimes, FaChevronLeft, FaPaperPlane,
    FaSearch, FaLock, FaBell
} from 'react-icons/fa';
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import { toast, Toaster } from 'react-hot-toast';

// --- LocalStorage Helpers for Persistent Unread Counts ---
const getUnreadCounts = (userId) => {
    try {
        return JSON.parse(localStorage.getItem(`unread_msgs_${userId}`)) || {};
    } catch (e) {
        return {};
    }
};

const setUnreadCount = (userId, contactId, count) => {
    if (!userId) return;
    const counts = getUnreadCounts(userId);
    counts[contactId] = count;
    localStorage.setItem(`unread_msgs_${userId}`, JSON.stringify(counts));
};

const incrementUnreadCount = (userId, contactId) => {
    if (!userId) return 1;
    const counts = getUnreadCounts(userId);
    counts[contactId] = (counts[contactId] || 0) + 1;
    localStorage.setItem(`unread_msgs_${userId}`, JSON.stringify(counts));
    return counts[contactId];
};

const GlobalChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');

    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);
    const [socket, setSocket] = useState(null);

    const messagesEndRef = useRef(null);
    const activeChatRef = useRef(activeChat);
    const currentUserRef = useRef(currentUser);
    const isOpenRef = useRef(isOpen);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    // Keep refs updated for socket callbacks to prevent stale closures
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    // 1. Encryption / Decryption Handlers
    const generateSharedKey = (id1, id2) => {
        return [id1, id2].sort().join('-') + '-avg-secret-salt';
    };

    const encryptMessage = (text, myId, receiverId) => {
        const key = generateSharedKey(myId, receiverId);
        return CryptoJS.AES.encrypt(text, key).toString();
    };

    const decryptMessage = (cipherText, myId, senderId) => {
        try {
            const key = generateSharedKey(myId, senderId);
            const bytes = CryptoJS.AES.decrypt(cipherText, key);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            return "🔒 [Encrypted]";
        }
    };

    // --- Request Browser Notification Permission on Mount ---
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    // 2. Initialize User & Socket Connection
    useEffect(() => {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser({ id: payload.id, name: payload.fullName, role: payload.role });

            const newSocket = io(apiUrl, { auth: { token } });
            setSocket(newSocket);

            newSocket.on('receive_message', (encryptedPayload) => {
                const { senderId, senderName, senderRole, text, time } = encryptedPayload;

                // Prevent echoing your own messages
                if (senderId === payload.id) return;

                const decryptedText = decryptMessage(text, payload.id, senderId);
                const isCurrentlyActive = isOpenRef.current && activeChatRef.current && activeChatRef.current.id === senderId;

                let newUnreadCount = 0;

                if (!isCurrentlyActive) {
                    newUnreadCount = incrementUnreadCount(payload.id, senderId);

                    // --- OUT-OF-APP BACKGROUND NOTIFICATION ---
                    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                        const notification = new Notification(`New message from ${senderName}`, {
                            body: decryptedText,
                            icon: '/favicon.ico'
                        });

                        notification.onclick = () => {
                            window.focus();
                            setIsOpen(true);
                            const incomingContact = { id: senderId, name: senderName, role: senderRole, online: true, unreadCount: 0, lastMsg: decryptedText };
                            setActiveChat(incomingContact);
                            setUnreadCount(payload.id, senderId, 0);
                            setContacts(prev => prev.map(c => c.id === senderId ? { ...c, unreadCount: 0 } : c));
                            notification.close();
                        };
                    }
                    // --- IN-APP TOAST NOTIFICATION ---
                    else {
                        toast.custom((t) => (
                            <div
                                className={`${t.visible ? 'animate-fade-in-up' : 'opacity-0'} max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex border border-[#E7E9F7] cursor-pointer hover:border-[#2A45C2]/30 transition-all`}
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    setIsOpen(true);
                                    const incomingContact = { id: senderId, name: senderName, role: senderRole, online: true, unreadCount: 0, lastMsg: decryptedText };
                                    setActiveChat(incomingContact);
                                    setUnreadCount(payload.id, senderId, 0);
                                    setContacts(prev => prev.map(c => c.id === senderId ? { ...c, unreadCount: 0 } : c));
                                }}
                            >
                                <div className="flex-1 w-0 p-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-0.5">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center text-white font-bold shadow-md">
                                                {senderName.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-black text-gray-900">{senderName}</p>
                                            <p className="mt-1 text-xs font-medium text-gray-500 truncate">{decryptedText}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ), { duration: 5000, position: 'bottom-right' });
                    }
                } else {
                    setUnreadCount(payload.id, senderId, 0);
                }

                setContacts(prev => {
                    const exists = prev.find(c => c.id === senderId);
                    let updatedContacts = [];

                    if (!exists) {
                        updatedContacts = [{
                            id: senderId,
                            name: senderName,
                            role: senderRole,
                            online: true,
                            lastMsg: decryptedText,
                            unreadCount: newUnreadCount
                        }, ...prev];
                    } else {
                        const otherContacts = prev.filter(c => c.id !== senderId);
                        const updatedContact = {
                            ...exists,
                            lastMsg: decryptedText,
                            unreadCount: newUnreadCount
                        };
                        updatedContacts = [updatedContact, ...otherContacts];
                    }
                    return updatedContacts;
                });

                setActiveChat(currentActive => {
                    if (currentActive && currentActive.id === senderId) {
                        setMessages(prev => {
                            const isDuplicate = prev.some(m => m.sender === 'them' && m.text === decryptedText && m.time === time);
                            if (isDuplicate) return prev;
                            return [...prev, { id: Date.now() + Math.random(), sender: 'them', text: decryptedText, time }];
                        });
                    }
                    return currentActive;
                });
            });

            return () => newSocket.disconnect();
        } catch (error) {
            console.error("Socket initialization failed:", error);
        }
    }, [apiUrl]);

    // 3. Fetch Initial Contacts List on Load
    useEffect(() => {
        const fetchInitialContacts = async () => {
            if (!currentUser) return;

            try {
                const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                const res = await fetch(`${apiUrl}/api/chat/contacts/${currentUser.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const unreadMap = getUnreadCounts(currentUser.id);

                    const decryptedContacts = data.map(contact => {
                        const cid = contact.id || contact.contact_id;
                        return {
                            id: cid,
                            name: contact.full_name || contact.name || 'Unknown User',
                            role: contact.role || 'Member',
                            online: false,
                            unreadCount: unreadMap[cid] || 0,
                            lastMsg: contact.lastMessage
                                ? decryptMessage(contact.lastMessage, currentUser.id, cid)
                                : 'Click to view history'
                        };
                    });

                    setContacts(decryptedContacts);
                }
            } catch (err) {
                console.error("Failed to load historical contacts", err);
            }
        };

        fetchInitialContacts();
    }, [currentUser, apiUrl]);

    // 4. Fetch Chat History When Active Chat Changes
    useEffect(() => {
        const fetchHistory = async () => {
            if (!activeChat || !currentUser) return;
            setIsLoadingHistory(true);

            try {
                const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                const res = await fetch(`${apiUrl}/api/chat/history/${currentUser.id}/${activeChat.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const history = await res.json();
                    const decryptedHistory = history.map(msg => {
                        const isMe = msg.sender_id === currentUser.id;
                        const decryptionTargetId = isMe ? activeChat.id : msg.sender_id;

                        return {
                            id: msg.id,
                            sender: isMe ? 'me' : 'them',
                            text: decryptMessage(msg.ciphertext, currentUser.id, decryptionTargetId),
                            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                    });
                    setMessages(decryptedHistory);
                }
            } catch (err) {
                console.error("Failed to load chat history", err);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [activeChat, currentUser, apiUrl]);

    // 5. Listen for Profile Page Custom Events
    useEffect(() => {
        const handleOpenChat = (event) => {
            const user = event.detail;
            const formattedUser = {
                id: user.id,
                name: user.full_name || user.name || 'Unknown User',
                role: user.role || 'Member',
                online: true,
                unreadCount: 0,
                lastMsg: 'Click to view history'
            };

            if (currentUserRef.current) {
                setUnreadCount(currentUserRef.current.id, user.id, 0);
            }

            setContacts(prev => {
                const exists = prev.find(c => c.id === formattedUser.id);
                if (!exists) return [formattedUser, ...prev];
                return prev.map(c => c.id === formattedUser.id ? { ...c, unreadCount: 0 } : c);
            });

            setIsOpen(true);
            setActiveChat(formattedUser);
        };

        window.addEventListener('open-global-chat', handleOpenChat);
        return () => window.removeEventListener('open-global-chat', handleOpenChat);
    }, []);

    // 6. Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeChat, isOpen]);

    // 7. Send Message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !socket || !currentUser || !activeChat) return;

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newMsg = { id: Date.now(), sender: 'me', text: messageInput, time: timeString };
        setMessages(prev => [...prev, newMsg]);

        setContacts(prev => {
            const exists = prev.find(c => c.id === activeChat.id);
            const others = prev.filter(c => c.id !== activeChat.id);
            if (exists) {
                return [{ ...exists, lastMsg: messageInput }, ...others];
            }
            return prev;
        });

        const encryptedText = encryptMessage(messageInput, currentUser.id, activeChat.id);

        socket.emit('send_message', {
            receiverId: activeChat.id,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            text: encryptedText,
            time: timeString
        });

        setMessageInput('');
    };

    const handleContactClick = (contact) => {
        setActiveChat(contact);
        if (currentUser) {
            setUnreadCount(currentUser.id, contact.id, 0);
        }
        setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
    };

    const handleOpenWidget = () => {
        setIsOpen(true);
        if (activeChat && currentUser) {
            setUnreadCount(currentUser.id, activeChat.id, 0);
            setContacts(prev => prev.map(c => c.id === activeChat.id ? { ...c, unreadCount: 0 } : c));
        }
    };

    const handleCloseWidget = () => {
        setIsOpen(false);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnreadCount = contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0);

    // --- NEW: Update Document Title & Broadcast Unread Count to Navbar ---
    useEffect(() => {
        // Dispatch event for Navbar to pick up
        window.dispatchEvent(new CustomEvent('chat-unread-update', { detail: totalUnreadCount }));

        if (totalUnreadCount > 0) {
            document.title = `(${totalUnreadCount}) AVG | Job Portal`;
        } else {
            document.title = 'AVG | Job Portal';
        }
    }, [totalUnreadCount]);

    return (
        <div className={`fixed z-[100] transition-all ${isOpen
            ? 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[500px]'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6'
            }`}>
            {!isOpen && (
                <button onClick={handleOpenWidget} className="w-14 h-14 bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(42,69,194,0.4)] hover:scale-105 transition-transform duration-300 relative group">
                    <FaCommentDots size={24} />
                    {totalUnreadCount > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="w-full h-[100dvh] sm:h-full bg-white sm:rounded-2xl shadow-none sm:shadow-[0_10px_40px_rgba(30,41,89,0.2)] border-0 sm:border border-[#E7E9F7] flex flex-col overflow-hidden sm:animate-fade-in-up">
                    <div className="bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] px-4 py-3.5 flex justify-between items-center text-white shrink-0 shadow-sm z-10">
                        {activeChat ? (
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveChat(null)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                                    <FaChevronLeft size={14} />
                                </button>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm border border-white/30 backdrop-blur-sm relative">
                                        {activeChat.name.charAt(0).toUpperCase()}
                                        {activeChat.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#2A45C2] rounded-full"></span>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight truncate max-w-[150px] sm:max-w-[200px]">{activeChat.name}</h3>
                                        <p className="text-[10px] text-white/80 font-medium truncate max-w-[150px]">{activeChat.role}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <FaCommentDots size={18} />
                                <h3 className="font-bold text-sm tracking-wide">Live Messages</h3>
                            </div>
                        )}
                        <button onClick={handleCloseWidget} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                            <FaTimes size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col bg-[#F5F6FC]">
                        {!activeChat ? (
                            <div className="flex flex-col h-full">
                                <div className="bg-[#EEF1FE] px-3 py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#2A45C2] border-b border-[#E7E9F7] shrink-0">
                                    <FaLock /> Secured by End-to-End Encryption
                                </div>
                                <div className="p-3 bg-white border-b border-[#E7E9F7] shrink-0">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                                        <input
                                            type="text"
                                            placeholder="Search active chats..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-[#F5F6FC] border border-transparent focus:bg-white focus:border-[#2A45C2] rounded-lg pl-8 pr-3 py-2 text-xs outline-none transition-colors text-gray-700 font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            onClick={() => handleContactClick(contact)}
                                            className="flex items-center gap-3 p-2.5 bg-white hover:bg-[#EEF1FE] rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#2A45C2]/20 relative"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center text-white font-bold shrink-0 relative">
                                                {contact.name.charAt(0).toUpperCase()}
                                                {contact.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h4 className={`text-sm truncate ${contact.unreadCount > 0 ? 'font-black text-gray-900' : 'font-bold text-gray-900'}`}>{contact.name}</h4>
                                                </div>
                                                <p className={`text-xs truncate ${contact.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{contact.lastMsg}</p>
                                            </div>
                                            {contact.unreadCount > 0 && (
                                                <div className="absolute right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                                    {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 flex flex-col items-center justify-center h-full text-gray-400 text-xs font-medium">
                                            <FaCommentDots size={24} className="mb-2 text-gray-300" />
                                            No active conversations. <br /> Visit a profile to start chatting.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="bg-[#FFF9E6] px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-bold text-[#D4A017] border-b border-[#F2C14E]/30 text-center shrink-0">
                                    <FaLock /> Messages are end-to-end encrypted. Nobody outside of this chat can read them.
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {isLoadingHistory ? (
                                        <div className="text-center text-[11px] text-[#2A45C2] font-medium my-4 animate-pulse">
                                            Decrypting message history...
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-[11px] text-gray-400 font-medium my-4">
                                            Start the conversation with {activeChat.name}
                                        </div>
                                    ) : (
                                        messages.map((msg) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[80%] p-3 text-sm font-medium shadow-sm ${msg.sender === 'me'
                                                    ? 'bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] text-white rounded-2xl rounded-tr-sm'
                                                    : 'bg-white border border-[#E7E9F7] text-gray-800 rounded-2xl rounded-tl-sm'
                                                    }`}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[9px] text-gray-400 mt-1 font-medium px-1">{msg.time}</span>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form
                                    onSubmit={handleSendMessage}
                                    className="p-3 bg-white border-t border-[#E7E9F7] flex gap-2 items-center shrink-0"
                                    style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
                                >
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder={`Message ${activeChat.name}...`}
                                        className="flex-1 bg-[#F5F6FC] border border-[#E7E9F7] focus:bg-white focus:border-[#2A45C2] rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-medium text-gray-700"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        className="bg-[#2A45C2] text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#5B4FE0] transition-colors shrink-0 shadow-sm"
                                    >
                                        <FaPaperPlane size={12} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A45C2; }
                .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default GlobalChatWidget;