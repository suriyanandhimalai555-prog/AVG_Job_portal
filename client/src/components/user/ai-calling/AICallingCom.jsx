import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaRobot, FaPhoneAlt, FaCheckCircle, FaChartPie,
    FaHeadset, FaFileAudio, FaRocket, FaStar, FaBolt,
    FaPlay, FaPause, FaTimes, FaVolumeUp
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Shimmer from '../../ui/Shimmer';

// The scripted conversation using local MP3 files from the public directory
const CONVERSATION = [
    {
        speaker: 'AI Recruiter',
        isAI: true,
        audioSrc: "/audio/sample-calling/adam-1.mp3",
        text: "Hi, am I speaking with Alex? I'm calling from the AI recruitment team regarding your application for the Bioinformatics Analyst position. Do you have a couple of minutes for a brief screening?"
    },
    {
        speaker: 'Candidate',
        isAI: false,
        audioSrc: "/audio/sample-calling/belle-1.mp3",
        text: "Yes, hi! I have a few minutes, that sounds great."
    },
    {
        speaker: 'AI Recruiter',
        isAI: true,
        audioSrc: "/audio/sample-calling/adam-2.mp3",
        text: "Excellent. To start, could you briefly describe your hands-on experience with PCR techniques and analyzing large biological datasets using Python or R?"
    },
    {
        speaker: 'Candidate',
        isAI: false,
        audioSrc: "/audio/sample-calling/belle-2.mp3",
        text: "Sure! During my second year in college, I spent a lot of time in the lab running PCR assays. I also used Python scripts to parse the output data for my final project."
    }
];

const AICallingCom = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly');

    // States for the Sample Call Modal & Audio
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTimeDisplay, setCurrentTimeDisplay] = useState('00:00');
    const [durationDisplay, setDurationDisplay] = useState('00:00');

    // Sequence tracking
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const currentTurnRef = useRef(0);
    const audioRef = useRef(null);

    useEffect(() => {
        // Simulate initial data loading for the shimmer effect
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    // Simulated Payment Integration + Navigation Redirect
    const handleSubscribe = (planName) => {
        const toastId = toast.loading(`Processing payment for the ${planName} plan...`);

        // Simulate an API call to a payment provider (e.g., Stripe)
        setTimeout(() => {
            toast.success(`Payment successful! Welcome to the ${planName} plan.`, {
                id: toastId,
                duration: 3000
            });

            // Redirect to the new dedicated Active AI Calling Dashboard route
            navigate('/user-dashboard/ai-calling-dashboard');
        }, 2000);
    };

    // Orchestrates playing a specific part of the conversation using local files
    const playTurn = async (index) => {
        if (index >= CONVERSATION.length) {
            setIsPlaying(false);
            currentTurnRef.current = 0;
            setCurrentTurnIndex(0);
            return;
        }

        setCurrentTurnIndex(index);
        currentTurnRef.current = index;

        const url = CONVERSATION[index].audioSrc;

        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play().catch(e => {
                console.error("Play error:", e);
                setIsPlaying(false);
                toast.error("Failed to play audio file. Check file paths.");
            });
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            // Resume from wherever we left off
            if (audioRef.current.src && audioRef.current.currentTime > 0 && !audioRef.current.ended) {
                audioRef.current.play();
            } else {
                playTurn(currentTurnRef.current);
            }
        }
    };

    // Update progress bar based on actual HTML5 Audio events
    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;

        if (duration > 0) {
            setProgress((current / duration) * 100);
            setCurrentTimeDisplay(formatTime(current));
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDurationDisplay(formatTime(audioRef.current.duration));
        }
    };

    const handleAudioEnded = () => {
        setProgress(0);
        const nextIndex = currentTurnRef.current + 1;
        currentTurnRef.current = nextIndex;

        if (nextIndex < CONVERSATION.length) {
            // Wait a brief moment to simulate natural conversation pause
            setTimeout(() => {
                // Only proceed to the next clip if the user hasn't pressed pause
                if (isPlaying) {
                    playTurn(nextIndex);
                }
            }, 600);
        } else {
            // End of entire conversation
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

    // --- FULL PAGE SHIMMER STATE ---
    if (isLoading) {
        return (
            <div className="max-w-[1400px] mx-auto space-y-3 p-2 md:p-3 rounded-2xl bg-[#F5F6FC] min-h-screen">
                <div className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-8 md:py-7 bg-gray-200 h-[170px] shadow-sm">
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
                <div className="flex justify-center py-2.5">
                    <Shimmer className="w-64 h-11 rounded-full bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl p-5 border border-[#E7E9F7] h-[400px] flex flex-col">
                            <Shimmer className="w-24 h-6 rounded mb-3 bg-gray-200" />
                            <Shimmer className="w-32 h-10 rounded mb-2 bg-gray-200" />
                            <Shimmer className="w-40 h-4 rounded mb-4 bg-gray-200" />
                            <div className="space-y-3 flex-1">
                                {[1, 2, 3, 4].map(j => (
                                    <div key={j} className="flex gap-3 items-center">
                                        <Shimmer className="w-5 h-5 rounded-full shrink-0 bg-gray-200" />
                                        <Shimmer className="w-full h-4 rounded bg-gray-200" />
                                    </div>
                                ))}
                            </div>
                            <Shimmer className="w-full h-12 rounded-xl bg-gray-200 mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-3 p-2 md:p-3 rounded-2xl bg-[#F5F6FC] min-h-screen relative">
            <Toaster position="top-right" />

            {/* HERO SECTION */}
            <div className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-8 md:py-7 bg-gradient-to-br from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] shadow-lg text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.10), transparent 45%)' }} />
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

                <div className="relative z-10 max-w-2xl">
                    <Badge className="bg-white/10 text-white border-white/20 font-bold px-3 py-1 mb-3 backdrop-blur-sm">
                        <FaRobot className="inline mr-1.5" /> AI Recruiter Powered
                    </Badge>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2.5 tracking-tight text-white drop-shadow-sm leading-tight">
                        Automate Candidate Screening with AI Telecalling
                    </h1>
                    <p className="text-blue-100 font-medium text-sm leading-relaxed mb-4">
                        Save hundreds of hours. Our AI agent calls your applicants, conducts initial screening interviews, and provides you with detailed transcripts and candidate scores within minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                        <Button variant="secondary" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>
                            View Subscription Plans
                        </Button>
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setShowSampleModal(true)}>
                            <FaVolumeUp className="mr-2" /> Listen to a Sample Call
                        </Button>
                    </div>
                </div>

                <div className="relative z-10 hidden md:flex w-36 h-36 lg:w-48 lg:h-48 bg-white/10 backdrop-blur-md rounded-full items-center justify-center border-4 border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)] shrink-0">
                    <FaHeadset className="text-white text-5xl lg:text-6xl drop-shadow-lg opacity-90" />
                    <div className="absolute -bottom-2 -right-2 bg-green-400 text-[#141B3C] text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-white">
                        <FaPhoneAlt size={10} /> Live
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { icon: FaFileAudio, title: "1. Define Your Script", desc: "Type out the questions and criteria you want the AI to ask your candidates." },
                    { icon: FaRocket, title: "2. Launch Campaign", desc: "Select a list of applicants from your job posts and hit start. The AI dials them automatically." },
                    { icon: FaChartPie, title: "3. Review Analytics", desc: "Get full call transcripts, audio recordings, and an AI-generated fit score for every candidate." }
                ].map((feature, idx) => (
                    <div key={idx} className="bg-white border border-[#E7E9F7] p-4 rounded-2xl shadow-[0_2px_16px_rgba(30,41,89,0.05)] hover:border-[#2A45C2]/30 hover:shadow-lg transition-all group">
                        <div className="w-11 h-11 rounded-xl bg-[#EEF1FE] text-[#2A45C2] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#2A45C2] group-hover:text-white transition-all">
                            <feature.icon size={20} />
                        </div>
                        <h3 className="font-extrabold text-gray-900 mb-1.5">{feature.title}</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>

            {/* PRICING PLANS */}
            <div id="pricing" className="pt-3 pb-2">
                <div className="text-center mb-5">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Choose Your AI Telecalling Plan</h2>
                    <p className="text-gray-500 text-sm font-medium">Scale your hiring process efficiently. Upgrade or cancel anytime.</p>

                    <div className="inline-flex items-center p-1 bg-white border border-[#E7E9F7] rounded-full mt-4 mb-4 shadow-sm">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#141B3C] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-[#141B3C] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Yearly <span className="text-[10px] text-green-400 ml-1 uppercase bg-green-50 px-1.5 py-0.5 rounded">Save 20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 max-w-6xl mx-auto">
                    {/* Starter Plan */}
                    <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E7E9F7] shadow-[0_2px_20px_rgba(30,41,89,0.04)] hover:border-[#2A45C2]/30 transition-all flex flex-col">
                        <h3 className="text-lg font-black text-gray-900 mb-1.5">Starter</h3>
                        <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-3xl font-black text-gray-900">{billingCycle === 'monthly' ? 'AED 299' : 'AED 239'}</span>
                            <span className="text-sm font-bold text-gray-400">/mo</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-4">Perfect for small businesses hiring occasionally.</p>

                        <ul className="space-y-3 mb-5 flex-1">
                            {[
                                "100 AI Calls per month",
                                "Standard AI Voice",
                                "Basic Call Transcripts",
                                "Email Support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-700">
                                    <FaCheckCircle className="text-[#2A45C2] shrink-0 mt-0.5" size={16} /> {item}
                                </li>
                            ))}
                        </ul>

                        <Button variant="outline" onClick={() => handleSubscribe('Starter')}>
                            Get Starter
                        </Button>
                    </div>

                    {/* Growth Plan (Recommended) */}
                    <div className="bg-linear-to-b from-[#141B3C] to-[#2A45C2] rounded-3xl p-5 md:p-6 shadow-2xl relative transform md:-translate-y-3 flex flex-col">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-[#F2C14E] text-[#141B3C] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                            <FaStar /> Most Popular
                        </div>
                        <h3 className="text-lg font-black text-white mb-1.5 mt-2">Growth</h3>
                        <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-4xl font-black text-white">{billingCycle === 'monthly' ? 'AED 799' : 'AED 639'}</span>
                            <span className="text-sm font-bold text-white/60">/mo</span>
                        </div>
                        <p className="text-xs text-blue-200 font-medium mb-4 border-b border-white/10 pb-4">Ideal for growing companies doing active hiring.</p>

                        <ul className="space-y-3 mb-5 flex-1">
                            {[
                                "500 AI Calls per month",
                                "Premium Customizable Voices",
                                "Advanced AI Scoring & Analytics",
                                "Audio Recording Playbacks",
                                "Priority Support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-white">
                                    <FaCheckCircle className="text-green-400 shrink-0 mt-0.5" size={16} /> {item}
                                </li>
                            ))}
                        </ul>

                        <Button variant='secondary' className="w-full py-3 rounded-xl bg-white text-[#2A45C2] border-0 font-extrabold hover:bg-gray-50 transition-colors shadow-lg" onClick={() => handleSubscribe('Growth')}>
                            Subscribe to Growth
                        </Button>
                    </div>

                    {/* Scale Plan */}
                    <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E7E9F7] shadow-[0_2px_20px_rgba(30,41,89,0.04)] hover:border-[#2A45C2]/30 transition-all flex flex-col">
                        <h3 className="text-lg font-black text-gray-900 mb-1.5">Scale</h3>
                        <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-3xl font-black text-gray-900">{billingCycle === 'monthly' ? 'AED 1,499' : 'AED 1,199'}</span>
                            <span className="text-sm font-bold text-gray-400">/mo</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-4">For high-volume recruitment agencies.</p>

                        <ul className="space-y-3 mb-5 flex-1">
                            {[
                                "2000 AI Calls per month",
                                "Multi-language Support",
                                "Custom AI Interview Scripts",
                                "API Integration for CRM",
                                "Dedicated Account Manager"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-700">
                                    <FaCheckCircle className="text-[#2A45C2] shrink-0 mt-0.5" size={16} /> {item}
                                </li>
                            ))}
                        </ul>

                        <Button variant="outline" onClick={() => handleSubscribe('Scale')}>
                            Get Scale
                        </Button>
                    </div>
                </div>
            </div>

            {/* QUICK FAQ / TRUST BADGE */}
            <div className="bg-[#141B3C] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <FaBolt className="text-yellow-400 text-xl" />
                    </div>
                    <div>
                        <h4 className="text-white font-extrabold text-base mb-0.5">Need a custom enterprise volume?</h4>
                        <p className="text-blue-200 text-sm font-medium">We offer tailored pricing for companies processing 5000+ applicants.</p>
                    </div>
                </div>
                <Button className="px-6 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 font-bold whitespace-nowrap transition-colors">
                    Contact Sales
                </Button>
            </div>

            {/* --- SAMPLE CALL MODAL --- */}
            {showSampleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Hidden Native Audio Element */}
                        <audio
                            ref={audioRef}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={handleAudioEnded}
                            className="hidden"
                        />

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#5B4FE0] flex items-center justify-center text-white shadow-md">
                                    <FaRobot size={18} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-gray-900 text-base">Sample Screening Call</h3>
                                    <p className="text-xs font-bold text-green-500 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Role: Bioinformatics Analyst
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeSampleModal} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors">
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
                                    {isPlaying ? (
                                        <FaPause size={20} />
                                    ) : (
                                        <FaPlay size={20} className="ml-1" />
                                    )}
                                </button>

                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold text-blue-200 mb-2">
                                        <span>{currentTimeDisplay}</span>
                                        <span>{durationDisplay}</span>
                                    </div>
                                    {/* Real Progress Bar */}
                                    <div
                                        className="w-full h-2 bg-white/20 rounded-full overflow-hidden relative cursor-pointer"
                                        onClick={(e) => {
                                            if (!audioRef.current || !audioRef.current.src) return;
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
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border border-[#E7E9F7] px-3 py-1 rounded-full">Live Transcript</span>
                            </div>

                            {/* Dynamically mapped conversation elements */}
                            {CONVERSATION.map((turn, index) => {
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
                                                <span className="text-[11px] font-bold text-gray-400 mb-1 block">{turn.speaker}</span>
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
                                                A
                                            </div>
                                            <div className="bg-[#EEF1FE] p-3.5 rounded-2xl rounded-tr-none shadow-sm max-w-[85%]">
                                                <span className="text-[11px] font-bold text-[#2A45C2]/60 mb-1 block text-right">{turn.speaker}</span>
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
                            <p className="text-xs font-bold text-gray-500">Impressive, right? Let's automate your screening.</p>
                            <Button
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
        </div>
    );
};

export default AICallingCom;