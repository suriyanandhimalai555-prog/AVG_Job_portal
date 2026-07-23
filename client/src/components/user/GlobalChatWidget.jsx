import React, { useState, useEffect, useRef } from 'react';
import {
    FaCommentDots, FaTimes, FaChevronLeft, FaPaperPlane,
    FaSearch, FaLock
} from 'react-icons/fa';
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';

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

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
                const decryptedText = decryptMessage(text, payload.id, senderId);

                setContacts(prev => {
                    const exists = prev.find(c => c.id === senderId);
                    if (!exists) {
                        return [{ id: senderId, name: senderName, role: senderRole, online: true, lastMsg: decryptedText }, ...prev];
                    }
                    return prev.map(c => c.id === senderId ? { ...c, lastMsg: decryptedText } : c);
                });

                setActiveChat(currentActive => {
                    if (currentActive && currentActive.id === senderId) {
                        setMessages(prev => [...prev, { id: Date.now(), sender: 'them', text: decryptedText, time }]);
                    }
                    return currentActive;
                });
            });

            return () => newSocket.disconnect();
        } catch (error) {
            console.error("Socket initialization failed:", error);
        }
    }, [apiUrl]);

    // 3. Fetch Initial Contacts List on Load (Fixed mapping to handle DB structure)
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

                    // Decrypt the last message for each historical contact safely
                    const decryptedContacts = data.map(contact => ({
                        id: contact.id || contact.contact_id,
                        name: contact.full_name || contact.name || 'Unknown User',
                        role: contact.role || 'Member',
                        online: false,
                        lastMsg: contact.lastMessage
                            ? decryptMessage(contact.lastMessage, currentUser.id, (contact.id || contact.contact_id))
                            : 'Click to view history'
                    }));

                    setContacts(decryptedContacts);
                } else {
                    console.error("Failed to fetch historical contacts, status:", res.status);
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
                lastMsg: 'Click to view history'
            };

            setContacts(prev => {
                if (!prev.find(c => c.id === formattedUser.id)) return [formattedUser, ...prev];
                return prev;
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
        setContacts(prev => prev.map(c => c.id === activeChat.id ? { ...c, lastMsg: messageInput } : c));

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

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(42,69,194,0.4)] hover:scale-105 transition-transform duration-300 relative group">
                    <FaCommentDots size={24} />
                    {contacts.length > 0 && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>}
                </button>
            )}

            {isOpen && (
                <div className="w-[340px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(30,41,89,0.2)] border border-[#E7E9F7] flex flex-col overflow-hidden animate-fade-in-up">
                    <div className="bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0] px-4 py-3.5 flex justify-between items-center text-white shrink-0">
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
                                        <h3 className="font-bold text-sm leading-tight">{activeChat.name}</h3>
                                        <p className="text-[10px] text-white/80 font-medium">{activeChat.role}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <FaCommentDots size={18} />
                                <h3 className="font-bold text-sm tracking-wide">Live Messages</h3>
                            </div>
                        )}
                        <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                            <FaTimes size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col bg-[#F5F6FC]">
                        {!activeChat ? (
                            <div className="flex flex-col h-full">
                                <div className="bg-[#EEF1FE] px-3 py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#2A45C2] border-b border-[#E7E9F7]">
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
                                            onClick={() => setActiveChat(contact)}
                                            className="flex items-center gap-3 p-2.5 bg-white hover:bg-[#EEF1FE] rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#2A45C2]/20"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] flex items-center justify-center text-white font-bold shrink-0 relative">
                                                {contact.name.charAt(0).toUpperCase()}
                                                {contact.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{contact.name}</h4>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{contact.lastMsg}</p>
                                            </div>
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
                                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E7E9F7] flex gap-2 items-center shrink-0">
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