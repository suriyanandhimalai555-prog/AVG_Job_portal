import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaRobot, FaPhoneAlt, FaCheckCircle, FaChartPie,
    FaHeadset, FaStar, FaPhoneVolume, FaUserCheck, FaLifeRing,
    FaPlay, FaPause, FaTimes, FaVolumeUp, FaComments, FaCalendarCheck, FaClock, FaUserShield
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Shimmer from '../../ui/Shimmer';

// --- DEMO SCENARIOS DATA ---
const SCENARIOS = [
    {
        id: 'recruitment',
        name: 'Recruitment Screening',
        isSimulated: false,
        dialogue: [
            { speaker: 'AI Recruiter', isAI: true, audioSrc: "/audio/sample-calling/adam-1.mp3", text: "Hi, am I speaking with Alex? I'm calling from the AI recruitment team regarding your application for the Bioinformatics Analyst position. Do you have a couple of minutes for a brief screening?" },
            { speaker: 'Candidate', isAI: false, audioSrc: "/audio/sample-calling/belle-1.mp3", text: "Yes, hi! I have a few minutes, that sounds great." },
            { speaker: 'AI Recruiter', isAI: true, audioSrc: "/audio/sample-calling/adam-2.mp3", text: "Excellent. To start, could you briefly describe your hands-on experience with PCR techniques and analyzing large biological datasets using Python or R?" },
            { speaker: 'Candidate', isAI: false, audioSrc: "/audio/sample-calling/belle-2.mp3", text: "Sure! During my second year in college, I spent a lot of time in the lab running PCR assays. I also used Python scripts to parse the output data for my final project." }
        ]
    },
    {
        id: 'lead_verification',
        name: 'Lead Verification',
        isSimulated: true,
        dialogue: [
            { speaker: 'AI Agent', isAI: true, text: "Hello! Is this Sarah? I'm calling from Agila Vetri regarding your recent inquiry on our website." },
            { speaker: 'Sarah', isAI: false, text: "Yes, this is Sarah. I was looking at your enterprise plans." },
            { speaker: 'AI Agent', isAI: true, text: "Perfect. To connect you with the right specialist, are you looking to process more than 5,000 calls a month?" },
            { speaker: 'Sarah', isAI: false, text: "Yes, we handle about 10,000 inquiries monthly." },
            { speaker: 'AI Agent', isAI: true, text: "Great. I've updated your profile. Would you like me to book a demo for Tuesday?" }
        ]
    },
    {
        id: 'customer_support',
        name: 'Customer Support',
        isSimulated: true,
        dialogue: [
            { speaker: 'AI Support', isAI: true, text: "Thanks for calling Support. I see you are calling from the number ending in 2834. Are you calling about your recent invoice?" },
            { speaker: 'Customer', isAI: false, text: "Yes, I was overcharged by $20 on my last bill." },
            { speaker: 'AI Support', isAI: true, text: "I apologize for that. I've analyzed your bill and see the system accidentally added a late fee. I have reversed the $20 charge, and it will reflect in 3-5 business days." },
            { speaker: 'Customer', isAI: false, text: "Wow, that was fast. Thank you!" }
        ]
    },
    {
        id: 'appointment_booking',
        name: 'Appointment Booking',
        isSimulated: true,
        dialogue: [
            { speaker: 'AI Agent', isAI: true, text: "Hello! Calling from the dental clinic to help you book your annual checkup. We have openings next Monday at 10 AM or 2 PM. Do either of those work?" },
            { speaker: 'Patient', isAI: false, text: "Monday at 10 AM works for me." },
            { speaker: 'AI Agent', isAI: true, text: "Done! I have booked you for Monday at 10 AM. I will send a confirmation SMS shortly. See you then!" }
        ]
    }
];

const AICallingCom = () => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    const [isLoading, setIsLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly');

    const [showSampleModal, setShowSampleModal] = useState(false);
    const [selectedScenarioId, setSelectedScenarioId] = useState('recruitment');
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTimeDisplay, setCurrentTimeDisplay] = useState('00:00');
    const [durationDisplay, setDurationDisplay] = useState('00:00');

    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const currentTurnRef = useRef(0);
    const audioRef = useRef(null);

    const activeScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // --- REAL RAZORPAY INTEGRATION ---
    const handleSubscribe = async (planName) => {
        const toastId = toast.loading(`Initiating secure payment for ${planName}...`);
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || '';
        
        try {
            if (!token) throw new Error("Authentication required. Please log in.");

            const resLoaded = await loadRazorpayScript();
            if (!resLoaded) {
                toast.error("Razorpay SDK failed to load. Please check your connection.", { id: toastId });
                return;
            }

            // 1. Create Order on Backend
            const orderRes = await fetch(`${apiUrl}/api/ai-calling/create-order`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ plan: planName, billingCycle })
            });

            const contentType = orderRes.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Backend route not found or server is down.");
            }

            const orderData = await orderRes.json();
            
            if (!orderRes.ok || !orderData.success) {
                throw new Error(orderData.error || "Failed to create order. Check backend keys.");
            }

            toast.dismiss(toastId);

            // 2. Open Actual Razorpay Checkout Modal
            const options = {
                // CRITICAL FIX: Use the exact key returned from the backend to eliminate 401 mismatches
                key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: 'Agila Vetri AI Platform',
                description: `${planName} Subscription (${billingCycle})`,
                order_id: orderData.order.id,
                theme: { color: '#2A45C2' },
                handler: async function (response) {
                    const verificationToast = toast.loading("Verifying payment...");
                    try {
                        // 3. Verify Payment Signature on Backend
                        const verifyRes = await fetch(`${apiUrl}/api/ai-calling/verify-payment`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan: planName,
                                billingCycle
                            })
                        });

                        const verifyData = await verifyRes.json();
                        
                        if (verifyData.success) {
                            toast.success(`Payment successful! Welcome to the ${planName} plan.`, { id: verificationToast, duration: 3000 });
                            setTimeout(() => navigate('/user-dashboard/ai-calling-dashboard'), 1500);
                        } else {
                            throw new Error(verifyData.error || "Payment verification failed");
                        }
                    } catch (err) {
                        toast.error(err.message || "Payment verification failed.", { id: verificationToast });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                toast.error(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (error) {
            console.error("Subscription Error:", error);
            toast.error(error.message || "Subscription process failed.", { id: toastId, duration: 4000 });
            if (error.message.includes("Authentication")) {
                setTimeout(() => navigate('/login'), 1500);
            }
        }
    };

    const playTurn = async (index) => {
        if (index >= activeScenario.dialogue.length) {
            setIsPlaying(false);
            currentTurnRef.current = 0;
            setCurrentTurnIndex(0);
            return;
        }

        setCurrentTurnIndex(index);
        currentTurnRef.current = index;

        if (!activeScenario.isSimulated) {
            const url = activeScenario.dialogue[index].audioSrc;
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play().catch(e => {
                    console.error("Play error:", e);
                    setIsPlaying(false);
                    toast.error("Failed to play audio file. Check file paths.");
                });
            }
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            if (!activeScenario.isSimulated && audioRef.current) audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            if (!activeScenario.isSimulated && audioRef.current && audioRef.current.src && audioRef.current.currentTime > 0 && !audioRef.current.ended) {
                audioRef.current.play();
            } else {
                playTurn(currentTurnRef.current);
            }
        }
    };

    useEffect(() => {
        let simTimer;
        let simProgressInterval;

        if (isPlaying && activeScenario.isSimulated) {
            setDurationDisplay("00:45");

            simTimer = setTimeout(() => {
                const nextIndex = currentTurnRef.current + 1;
                if (nextIndex < activeScenario.dialogue.length) {
                    currentTurnRef.current = nextIndex;
                    setCurrentTurnIndex(nextIndex);
                } else {
                    setIsPlaying(false);
                    currentTurnRef.current = 0;
                    setCurrentTurnIndex(0);
                    setProgress(0);
                    setCurrentTimeDisplay("00:00");
                }
            }, 4000);

            simProgressInterval = setInterval(() => {
                setProgress(prev => {
                    const totalTurns = activeScenario.dialogue.length;
                    const baseProgress = (currentTurnRef.current / totalTurns) * 100;
                    const currentAddition = Math.min((prev - baseProgress) + 1, (100 / totalTurns));
                    return baseProgress + currentAddition;
                });

                setCurrentTimeDisplay(prev => {
                    let parts = prev.split(':');
                    let secs = parseInt(parts[1]) + 1;
                    return `00:${secs.toString().padStart(2, '0')}`;
                });
            }, 500);
        }

        return () => {
            clearTimeout(simTimer);
            clearInterval(simProgressInterval);
        };
    }, [isPlaying, currentTurnIndex, activeScenario]);

    const handleTimeUpdate = () => {
        if (!audioRef.current || activeScenario.isSimulated) return;
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        if (duration > 0) {
            setProgress((current / duration) * 100);
            setCurrentTimeDisplay(formatTime(current));
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current && !activeScenario.isSimulated) {
            setDurationDisplay(formatTime(audioRef.current.duration));
        }
    };

    const handleAudioEnded = () => {
        if (activeScenario.isSimulated) return;
        setProgress(0);
        const nextIndex = currentTurnRef.current + 1;
        currentTurnRef.current = nextIndex;

        if (nextIndex < activeScenario.dialogue.length) {
            setTimeout(() => { if (isPlaying) playTurn(nextIndex); }, 600);
        } else {
            setIsPlaying(false);
            currentTurnRef.current = 0;
            setCurrentTurnIndex(0);
            setCurrentTimeDisplay('00:00');
        }
    };

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const closeSampleModal = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "";
        }
        setShowSampleModal(false);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTimeDisplay('00:00');
        currentTurnRef.current = 0;
        setCurrentTurnIndex(0);
    };

    const handleScenarioChange = (e) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setProgress(0);
        setCurrentTimeDisplay('00:00');
        setDurationDisplay('00:00');
        currentTurnRef.current = 0;
        setCurrentTurnIndex(0);
        setSelectedScenarioId(e.target.value);
    };

    if (isLoading) {
        return (
            <div className="max-w-[1400px] mx-auto space-y-3 p-2 md:p-3 rounded-2xl bg-[#F5F6FC] min-h-screen">
                <div className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-8 md:py-7 bg-gray-200 h-[220px] shadow-sm">
                    <Shimmer className="absolute inset-0 w-full h-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-[#E7E9F7] h-[135px]">
                            <Shimmer className="w-11 h-11 rounded-xl mb-3 bg-gray-200" />
                            <Shimmer className="w-3/4 h-5 rounded mb-2 bg-gray-200" />
                            <Shimmer className="w-full h-3 rounded mb-1.5 bg-gray-200" />
                            <Shimmer className="w-5/6 h-3 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-5 p-2 md:p-4 rounded-2xl bg-[#F5F6FC] min-h-screen relative overflow-x-hidden">
            <Toaster position="top-right" />

            {/* EXPANDED PLATFORM HERO SECTION */}
            <div className="relative overflow-hidden rounded-[24px] px-6 py-10 md:px-12 md:py-14 bg-gradient-to-br from-[#0A1128] via-[#1C2D88] to-[#4537C9] shadow-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="relative z-10 max-w-3xl">
                    <Badge className="bg-white/10 text-white border-white/20 font-extrabold px-3 py-1.5 mb-4 backdrop-blur-md rounded-full shadow-lg">
                        <FaRobot className="inline mr-1.5 text-blue-300" size={14} /> Complete AI Engagement Platform
                    </Badge>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 tracking-tight text-white drop-shadow-md leading-tight">
                        AI Voice Calling for Every Customer Conversation
                    </h1>
                    <p className="text-blue-100/90 font-medium text-sm md:text-base leading-relaxed mb-6 max-w-2xl">
                        Automate inbound and outbound calls with AI voice agents that verify leads, engage customers, book appointments, handle support conversations, perform follow-ups, and provide complete call analytics.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                        <Button className="bg-white text-[#1C2D88] hover:bg-gray-50 font-black shadow-xl border-none px-6 py-3" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>
                            Explore AI Calling
                        </Button>
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold px-6 py-3 backdrop-blur-sm" onClick={() => setShowSampleModal(true)}>
                            <FaVolumeUp className="mr-2" /> Listen to Sample Call
                        </Button>
                    </div>
                </div>

                <div className="relative z-10 hidden lg:flex flex-col gap-4 shrink-0 pr-8">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 border border-green-400/50"><FaPhoneAlt size={18} /></div>
                        <div><p className="text-white font-bold text-sm">Incoming Customer Call</p><p className="text-white/60 text-xs">AI Agent Handling...</p></div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/50"><FaRobot size={20} /></div>
                        <div><p className="text-white font-bold text-sm">Lead Verification #291</p><p className="text-white/60 text-xs">Calling +1 555-019-2834...</p></div>
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="pt-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 text-center">How The Platform Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {[
                        { icon: FaRobot, title: "1. Configure Your AI Agent", desc: "Define the call purpose, choose a voice and language, set up business qualification criteria, support instructions, and escalation rules." },
                        { icon: FaPhoneAlt, title: "2. Launch or Receive Calls", desc: "Start outbound campaigns for lead verification, follow-ups, or recruitment. Accept inbound calls to book appointments and provide support." },
                        { icon: FaChartPie, title: "3. Analyze Every Conversation", desc: "Instantly access complete audio recordings, line-by-line transcripts, AI intent detection, sentiment analysis, and scored outcomes." }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white border border-[#E7E9F7] p-6 rounded-[20px] shadow-sm hover:border-[#2A45C2]/40 hover:shadow-lg transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-[#F5F6FC] text-[#2A45C2] flex items-center justify-center mb-4 group-hover:-translate-y-1 group-hover:bg-[#2A45C2] group-hover:text-white transition-all shadow-sm">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="font-black text-lg text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI CALLING MODULES CAPABILITIES */}
            <div className="py-12 relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[10%] -left-[10%] w-[40%] h-[50%] rounded-full bg-blue-100/40 blur-[100px]"></div>
                    <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[60%] rounded-full bg-indigo-100/40 blur-[100px]"></div>
                </div>

                <div className="text-center mb-10 relative z-10">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-[#EEF1FE] text-[#2A45C2] text-[10px] font-black tracking-widest uppercase mb-3 border border-[#D0D7FB] shadow-sm">
                        Platform Features
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight">
                        Comprehensive Calling Capabilities
                    </h2>
                    <p className="text-gray-500 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        One intelligent voice platform to handle multiple aspects of your business, from automated customer support to high-volume outbound campaigns.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {[
                        { icon: FaPhoneVolume, color: 'text-indigo-600', bg: 'bg-indigo-50', borderHover: 'group-hover:border-indigo-300', title: 'Inbound AI Calling', desc: 'AI receives incoming customer calls and gracefully handles common requests instantly without wait times.' },
                        { icon: FaHeadset, color: 'text-blue-600', bg: 'bg-blue-50', borderHover: 'group-hover:border-blue-300', title: 'Outbound Campaigns', desc: 'Deploy the AI to automatically call targeted lists of leads, customers, or candidates based on your schedules.' },
                        { icon: FaUserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', borderHover: 'group-hover:border-emerald-300', title: 'Lead Verification', desc: 'Automatically verify lead names, confirm exact requirements, check interest levels, and qualify leads accurately.' },
                        { icon: FaComments, color: 'text-purple-600', bg: 'bg-purple-50', borderHover: 'group-hover:border-purple-300', title: 'Customer Engagement', desc: 'Proactively re-engage inactive leads, collect necessary information, and gracefully follow up with existing customers.' },
                        { icon: FaCalendarCheck, color: 'text-teal-600', bg: 'bg-teal-50', borderHover: 'group-hover:border-teal-300', title: 'Appointment Booking', desc: 'The AI checks your live calendar availability in real-time and books appointments directly with your clients.' },
                        { icon: FaClock, color: 'text-orange-600', bg: 'bg-orange-50', borderHover: 'group-hover:border-orange-300', title: 'Reminders & Follow-ups', desc: 'Execute automated confirmation calls, provide rescheduling support, and maintain strict follow-up cadences.' },
                        { icon: FaLifeRing, color: 'text-rose-600', bg: 'bg-rose-50', borderHover: 'group-hover:border-rose-300', title: 'AI Customer Support', desc: 'The AI understands complex customer issues, processes intent perfectly, and provides immediate automated resolution.' },
                        { icon: FaUserShield, color: 'text-amber-600', bg: 'bg-amber-50', borderHover: 'group-hover:border-amber-300', title: 'Human Escalation', desc: 'If the AI cannot resolve a sensitive issue, it gracefully pauses and marks the call for immediate human-agent routing.' }
                    ].map((mod, idx) => (
                        <div key={idx} className={`bg-white border border-[#E7E9F7] p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(42,69,194,0.08)] ${mod.borderHover} hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group cursor-default`}>
                            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${mod.bg} opacity-50 group-hover:scale-[2] transition-transform duration-500 ease-out z-0`}></div>

                            <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${mod.bg} ${mod.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-white/50`}>
                                <mod.icon size={20} />
                            </div>
                            <h4 className="relative z-10 font-black text-gray-900 text-sm md:text-base mb-2 group-hover:text-[#2A45C2] transition-colors">{mod.title}</h4>
                            <p className="relative z-10 text-[13px] text-gray-500 font-medium leading-relaxed">{mod.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* EXPANDED PRICING PLANS */}
            <div id="pricing" className="pt-8 pb-10">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">Choose Your AI Telecalling Plan</h2>
                    <p className="text-gray-500 text-sm md:text-base font-medium max-w-lg mx-auto">Scale your communications efficiently. Upgrade or cancel anytime.</p>

                    <div className="inline-flex items-center p-1.5 bg-white border border-[#E7E9F7] rounded-full mt-6 shadow-sm">
                        <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#141B3C] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>Monthly</button>
                        <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-[#141B3C] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                            Yearly <span className="text-[10px] text-green-700 font-black ml-1.5 uppercase bg-green-100 px-2 py-0.5 rounded-full">Save 20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {/* Starter Plan */}
                    <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-[#E7E9F7] shadow-sm hover:border-[#2A45C2]/30 hover:shadow-lg transition-all flex flex-col">
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Starter</h3>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl font-black text-gray-900">{billingCycle === 'monthly' ? 'AED 299' : 'AED 239'}</span>
                            <span className="text-sm font-bold text-gray-400">/mo</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-8">Perfect for small teams testing AI automation.</p>
                        <ul className="space-y-4 mb-10 flex-1">
                            {["100 AI Calls per month", "Basic Inbound/Outbound workflows", "Lead Verification module", "Basic Call Transcripts & Logs"].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-700">
                                    <FaCheckCircle className="text-[#2A45C2] shrink-0 mt-0.5" size={18} /> <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Button variant="outline" className="py-3.5 font-bold rounded-xl text-base border-gray-200" onClick={() => handleSubscribe('Starter')}>Get Starter</Button>
                    </div>

                    {/* Growth Plan */}
                    <div className="bg-gradient-to-b from-[#141B3C] to-[#2A45C2] rounded-[32px] p-6 lg:p-8 shadow-2xl relative transform md:-translate-y-4 flex flex-col border border-indigo-900">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-[#F2C14E] text-[#141B3C] text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full flex items-center gap-1.5 shadow-lg border-2 border-[#141B3C]">
                            <FaStar size={14} /> Most Popular
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white mb-2 mt-3">Growth</h3>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-4xl md:text-5xl font-black text-white">{billingCycle === 'monthly' ? 'AED 799' : 'AED 639'}</span>
                            <span className="text-sm font-bold text-white/60">/mo</span>
                        </div>
                        <p className="text-sm text-blue-200 font-medium mb-8 border-b border-white/10 pb-6">Ideal for active businesses booking appointments and support.</p>
                        <ul className="space-y-4 mb-10 flex-1">
                            {["500 AI Calls per month", "Appointment Booking module", "Automated Follow-ups", "AI Scoring & Intent Detection", "Call Audio Recordings"].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-white">
                                    <FaCheckCircle className="text-green-400 shrink-0 mt-0.5" size={18} /> <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Button variant='secondary' className="w-full py-4 rounded-xl bg-white text-[#2A45C2] border-0 font-extrabold text-base hover:bg-gray-50 transition-colors shadow-xl" onClick={() => handleSubscribe('Growth')}>
                            Subscribe to Growth
                        </Button>
                    </div>

                    {/* Scale Plan */}
                    <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-[#E7E9F7] shadow-sm hover:border-[#2A45C2]/30 hover:shadow-lg transition-all flex flex-col">
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Scale</h3>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl font-black text-gray-900">{billingCycle === 'monthly' ? 'AED 1,499' : 'AED 1,199'}</span>
                            <span className="text-sm font-bold text-gray-400">/mo</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-8">For high-volume centers and enterprise routing.</p>
                        <ul className="space-y-4 mb-10 flex-1">
                            {["2000 AI Calls per month", "Multi-language Support", "Custom AI Agents & CRM Integration", "Advanced Call Analytics", "Dedicated Account Manager"].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-700">
                                    <FaCheckCircle className="text-[#2A45C2] shrink-0 mt-0.5" size={18} /> <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Button variant="outline" className="py-3.5 font-bold rounded-xl text-base border-gray-200" onClick={() => handleSubscribe('Scale')}>Get Scale</Button>
                    </div>
                </div>
            </div>

            {/* SAMPLE CALL MODAL */}
            {showSampleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        <audio
                            ref={audioRef}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={handleAudioEnded}
                            className="hidden"
                        />

                        {/* Modal Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50 gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#5B4FE0] flex items-center justify-center text-white shadow-md shrink-0">
                                    <FaRobot size={18} />
                                </div>
                                <div className="flex-1 w-full sm:w-auto">
                                    <h3 className="font-extrabold text-gray-900 text-base">Sample Interaction</h3>
                                    <select
                                        value={selectedScenarioId}
                                        onChange={handleScenarioChange}
                                        className="text-xs font-bold text-[#2A45C2] bg-blue-50 border border-blue-100 rounded-md px-2 py-1 mt-1 outline-none cursor-pointer w-full sm:w-auto"
                                    >
                                        {SCENARIOS.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} {s.isSimulated ? '(Simulated)' : '(Audio)'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button onClick={closeSampleModal} className="absolute sm:relative top-5 right-5 sm:top-auto sm:right-auto w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Audio Player UI */}
                        <div className="p-6 bg-[#141B3C] text-white">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlay}
                                    className="w-14 h-14 rounded-full bg-white text-[#2A45C2] flex items-center justify-center hover:scale-105 transition-transform shadow-lg flex-shrink-0"
                                >
                                    {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
                                </button>

                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold text-blue-200 mb-2">
                                        <span>{currentTimeDisplay}</span>
                                        <span>{durationDisplay}</span>
                                    </div>
                                    <div
                                        className="w-full h-2 bg-white/20 rounded-full overflow-hidden relative cursor-pointer"
                                        onClick={(e) => {
                                            if (!audioRef.current || activeScenario.isSimulated) return;
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const clickPosition = (e.clientX - rect.left) / rect.width;
                                            audioRef.current.currentTime = clickPosition * audioRef.current.duration;
                                        }}
                                    >
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transition-all duration-150 ease-linear relative"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transcript Area */}
                        <div className="flex-1 p-5 overflow-y-auto bg-[#F9FAFF] custom-scrollbar space-y-4">
                            <div className="text-center mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border border-[#E7E9F7] px-3 py-1 rounded-full">
                                    {activeScenario.name} Transcript
                                </span>
                            </div>

                            {activeScenario.dialogue.map((turn, index) => {
                                const isCurrent = index === currentTurnIndex;
                                const isPast = index < currentTurnIndex;
                                const isActive = isCurrent && isPlaying;
                                const opacityClass = (isCurrent || isPast) ? 'opacity-100' : 'opacity-40';

                                if (turn.isAI) {
                                    return (
                                        <div key={index} className={`flex gap-3 transition-opacity duration-500 ${opacityClass}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-sm transition-colors ${isActive ? 'bg-gradient-to-tr from-[#2A45C2] to-[#5B4FE0] animate-pulse' : 'bg-gray-400'}`}>
                                                <FaRobot size={12} />
                                            </div>
                                            <div className="bg-white border border-[#E7E9F7] p-3.5 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                                                <span className="text-[11px] font-bold text-gray-400 mb-1 block uppercase tracking-wide">{turn.speaker}</span>
                                                <p className={`text-sm leading-relaxed font-medium transition-colors duration-500 ${isActive ? 'text-[#2A45C2]' : 'text-gray-700'}`}>
                                                    {turn.text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div key={index} className={`flex gap-3 flex-row-reverse transition-opacity duration-500 ${opacityClass}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-sm transition-colors ${isActive ? 'bg-[#2A45C2] text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>
                                                U
                                            </div>
                                            <div className="bg-[#EEF1FE] p-3.5 rounded-2xl rounded-tr-none shadow-sm max-w-[85%]">
                                                <span className="text-[11px] font-bold text-[#2A45C2]/60 mb-1 block text-right uppercase tracking-wide">{turn.speaker}</span>
                                                <p className={`text-sm leading-relaxed font-medium transition-colors duration-500 ${isActive ? 'text-[#2A45C2]' : 'text-[#141B3C]'}`}>
                                                    {turn.text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>

                        {/* Modal Footer CTA */}
                        <div className="p-4 bg-white border-t border-[#E7E9F7] flex justify-between items-center">
                            <p className="text-xs font-bold text-gray-500">Ready to automate your conversations?</p>
                            <Button
                                className="bg-[#2A45C2] hover:bg-[#1a2b7a] text-white px-5 rounded-xl font-bold text-sm"
                                onClick={() => {
                                    closeSampleModal();
                                    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                View Pricing
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A45C2; }
            `}} />
        </div>
    );
};

export default AICallingCom;