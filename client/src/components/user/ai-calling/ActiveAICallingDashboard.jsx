import React, { useState, useEffect, useRef } from 'react';
import {
    FaRobot, FaChartPie, FaHeadset,
    FaCheckCircle, FaPlus, FaTimes, FaSpinner, FaSave,
    FaPhone, FaFileAlt, FaUserCheck, FaUserTimes, FaExclamationCircle
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const ActiveAICallingDashboard = () => {
    const topRef = useRef(null);

    // 1. Guaranteed Scroll to Top Fix
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        const scrollableParents = document.querySelectorAll('.overflow-y-auto, main, #root');
        scrollableParents.forEach(el => {
            el.scrollTop = 0;
        });

        if (topRef.current) {
            topRef.current.scrollIntoView({ block: 'start', inline: 'nearest' });
        }
    }, []);

    // 2. Dynamic state for Campaigns with mock candidate transcripts
    const [campaigns, setCampaigns] = useState([
        {
            id: 1,
            name: "Bioinformatics Analyst Screening",
            description: "Assessing candidates on PCR techniques, data parsing with Python/R, and general lab protocols.",
            queued: 50,
            completed: 32,
            status: "Active",
            date: "Today",
            transcripts: [
                {
                    candidateName: "Alex Vance",
                    phone: "+1 (555) 019-2834",
                    score: 92,
                    shortlisted: true,
                    summary: "Strong laboratory experience with PCR assays. Experienced in parsing FASTQ data using Python.",
                    dialogue: [
                        { speaker: "AI Agent", text: "Hi Alex! I'm calling from Agila Vetri regarding your application. Do you have a couple of minutes?" },
                        { speaker: "Alex Vance", text: "Yes, sure! I have time right now." },
                        { speaker: "AI Agent", text: "Great! Could you briefly describe your hands-on experience with PCR and data analysis?" },
                        { speaker: "Alex Vance", text: "I spent two years conducting real-time PCR in college labs and wrote custom Python scripts to automate DNA sequence parsing." }
                    ]
                },
                {
                    candidateName: "Jordan Smith",
                    phone: "+1 (555) 014-9921",
                    score: 58,
                    shortlisted: false,
                    summary: "Basic understanding of bio-data, but lacks hands-on PCR laboratory experience.",
                    dialogue: [
                        { speaker: "AI Agent", text: "Hello Jordan, calling regarding your recent Bioinformatics application." },
                        { speaker: "Jordan Smith", text: "Hi! Yes, I applied last week." },
                        { speaker: "AI Agent", text: "Can you share your familiarity with laboratory PCR workflows?" },
                        { speaker: "Jordan Smith", text: "I have read about PCR extensively in theory classes, but haven't run assays physically in a wet lab setting." }
                    ]
                }
            ]
        }
    ]);

    // 3. Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCampaignTranscripts, setSelectedCampaignTranscripts] = useState(null);
    const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        description: '',
        candidateList: '+1 555-019-2834 (Alex Vance)\n+1 555-014-9921 (Jordan Smith)'
    });

    // 4. Derived Statistics
    const activeCampaignsCount = campaigns.filter(c => c.status === "Active").length;
    const totalCallsMade = campaigns.reduce((acc, curr) => acc + curr.completed, 0);
    const candidatesShortlisted = campaigns.reduce((acc, curr) => {
        const count = curr.transcripts?.filter(t => t.shortlisted).length || 0;
        return acc + count;
    }, 0);

    // Handle form submission for new campaign
    const handleCreateCampaign = (e) => {
        e.preventDefault();
        if (!newCampaign.name.trim() || !newCampaign.description.trim()) {
            toast.error("Please fill in all required campaign details.");
            return;
        }

        setIsSubmitting(true);

        // Count fed phone numbers
        const phoneLines = newCampaign.candidateList
            .split('\n')
            .filter(line => line.trim().length > 0);

        setTimeout(() => {
            const addedCampaign = {
                id: Date.now(),
                name: newCampaign.name,
                description: newCampaign.description,
                queued: phoneLines.length || 10,
                completed: 0,
                status: "Active",
                date: "Just now",
                transcripts: [
                    {
                        candidateName: "New Applicant #1",
                        phone: "+1 (555) 123-4567",
                        score: 85,
                        shortlisted: true,
                        summary: "Candidate matched initial parameters during automated screening.",
                        dialogue: [
                            { speaker: "AI Agent", text: "Hello! Calling regarding your application for " + newCampaign.name },
                            { speaker: "Candidate", text: "Hi! Thanks for calling, I'm very interested in this role." }
                        ]
                    }
                ]
            };

            setCampaigns([addedCampaign, ...campaigns]);
            setIsSubmitting(false);
            setIsCreateModalOpen(false);
            setNewCampaign({
                name: '',
                description: '',
                candidateList: '+1 555-019-2834 (Alex Vance)\n+1 555-014-9921 (Jordan Smith)'
            });
            toast.success(`Campaign launched! ${addedCampaign.queued} candidates queued for calling.`);
        }, 1500);
    };

    return (
        <div ref={topRef} className="max-w-350 mx-auto space-y-4 p-2 md:p-4 rounded-2xl bg-[#F5F6FC] min-h-screen animate-fade-in">
            <Toaster position="top-right" />

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_rgba(30,41,89,0.04)] border border-[#E7E9F7]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">AI Calling Campaigns</h2>
                        <p className="text-sm text-gray-500 font-medium">Manage and deploy your automated recruitment agents.</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#2A45C2] text-white hover:bg-[#1f3391] shadow-lg flex items-center gap-2"
                    >
                        <FaRobot size={16} /> Create New Campaign
                    </Button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Active Campaigns", value: activeCampaignsCount, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Total Calls Completed", value: totalCallsMade, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Candidates Shortlisted", value: candidatesShortlisted, color: "text-purple-600", bg: "bg-purple-50" }
                    ].map((stat, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-[#E7E9F7] flex items-center gap-4 transition-all hover:shadow-md">
                            <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center font-black text-xl shrink-0`}>
                                <FaChartPie size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Campaign List */}
                <h3 className="text-lg font-extrabold text-gray-900 mb-4">Recent Campaigns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Render Dynamic Campaigns */}
                    {campaigns.map((campaign) => (
                        <div key={campaign.id} className="border border-[#E7E9F7] rounded-2xl p-5 hover:border-[#2A45C2]/30 hover:shadow-lg transition-all group bg-white relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-400"></div>
                            <div className="flex justify-between items-start mb-3">
                                <Badge className="bg-green-100 text-green-700 border-green-200 font-bold px-2 py-0.5 text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1.5 animate-pulse"></span> {campaign.status}
                                </Badge>
                                <span className="text-xs font-bold text-gray-400">Created: {campaign.date}</span>
                            </div>
                            <h4 className="font-black text-gray-900 mb-1 line-clamp-1">{campaign.name}</h4>
                            <p className="text-xs font-medium text-gray-500 mb-4 line-clamp-2 flex-1">
                                {campaign.description}
                            </p>

                            <div className="flex items-center gap-4 mb-5 text-sm font-bold text-gray-700">
                                <div className="flex items-center gap-1.5">
                                    <FaHeadset className="text-[#2A45C2]" /> {campaign.queued} Queued
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FaCheckCircle className="text-green-500" /> {campaign.completed} Completed
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full text-sm font-bold border-[#E7E9F7] group-hover:border-[#2A45C2] group-hover:text-[#2A45C2] flex items-center justify-center gap-2"
                                onClick={() => {
                                    setSelectedCampaignTranscripts(campaign);
                                    setSelectedCandidateIndex(0);
                                }}
                            >
                                <FaFileAlt size={14} /> View Call Transcripts
                            </Button>
                        </div>
                    ))}

                    {/* Placeholder for creating another campaign */}
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="border-2 border-dashed border-[#E7E9F7] rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer min-h-55"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#EEF1FE] text-[#2A45C2] flex items-center justify-center mb-3">
                            <FaPlus size={20} />
                        </div>
                        <h4 className="font-extrabold text-gray-900 mb-1">Start New Campaign</h4>
                        <p className="text-xs font-medium text-gray-500 max-w-50">Feed candidate numbers and let AI dial and screen them.</p>
                    </div>
                </div>
            </div>

            {/* --- 1. CREATE CAMPAIGN & FEED NUMBERS MODAL --- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                                <FaRobot className="text-[#2A45C2]" /> Create AI Telecalling Campaign
                            </h3>
                            <button
                                onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleCreateCampaign} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Role / Campaign Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    placeholder="e.g. Senior Frontend Developer"
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/50 focus:border-[#2A45C2] transition-all text-sm font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Interview Focus / AI Criteria</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={newCampaign.description}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                                    placeholder="Specify questions the AI should ask (e.g. Assess experience with PCR, Python/R parsing, and lab availability)."
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/50 focus:border-[#2A45C2] transition-all text-sm font-medium resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                                        <FaPhone className="text-[#2A45C2]" size={12} /> Feed Candidate Phone Numbers
                                    </label>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">One per line</span>
                                </div>
                                <textarea
                                    required
                                    rows="4"
                                    value={newCampaign.candidateList}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, candidateList: e.target.value })}
                                    placeholder={`+1 555-019-2834 (Alex Vance)\n+1 555-014-9921 (Jordan Smith)`}
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/50 focus:border-[#2A45C2] transition-all text-xs font-mono resize-none bg-gray-50"
                                ></textarea>
                                <p className="text-[11px] text-gray-400 mt-1 font-medium">
                                    The AI agent will sequentially call these numbers to conduct the automated screening interview.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#2A45C2] text-white flex items-center justify-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><FaSpinner className="animate-spin" /> Launching Dialing...</>
                                    ) : (
                                        <><FaSave /> Launch Campaign</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- 2. VIEW CALL TRANSCRIPTS MODAL --- */}
            {selectedCampaignTranscripts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <div>
                                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                                    <FaFileAlt className="text-[#2A45C2]" /> Call Transcripts & Shortlists
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">{selectedCampaignTranscripts.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCampaignTranscripts(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content Area - Split Pane Layout */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                            {/* Left Sidebar: Candidate List */}
                            <div className="w-full md:w-1/3 border-r border-[#E7E9F7] bg-gray-50 p-4 overflow-y-auto space-y-3">
                                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Candidates Called</h4>
                                {selectedCampaignTranscripts.transcripts?.map((candidate, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedCandidateIndex(idx)}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${selectedCandidateIndex === idx
                                                ? 'bg-white border-[#2A45C2] shadow-md ring-2 ring-[#2A45C2]/10'
                                                : 'bg-white/60 border-[#E7E9F7] hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sm text-gray-900">{candidate.candidateName}</span>
                                            {candidate.shortlisted ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] font-bold">
                                                    Shortlisted
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] font-bold">
                                                    Under Review
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500 font-medium mt-1">
                                            <span>{candidate.phone}</span>
                                            <span className="font-extrabold text-[#2A45C2]">Score: {candidate.score}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Content: Selected Candidate Transcript & Evaluation */}
                            {selectedCampaignTranscripts.transcripts?.[selectedCandidateIndex] && (
                                <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col bg-white">

                                    {/* Evaluation Card */}
                                    <div className="p-4 rounded-2xl bg-[#F8FAFF] border border-[#E2E8F0] space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {selectedCampaignTranscripts.transcripts[selectedCandidateIndex].shortlisted ? (
                                                    <FaUserCheck className="text-green-500" size={18} />
                                                ) : (
                                                    <FaExclamationCircle className="text-amber-500" size={18} />
                                                )}
                                                <h4 className="font-extrabold text-gray-900 text-base">
                                                    AI Evaluation & Fit Analysis
                                                </h4>
                                            </div>
                                            <span className="text-lg font-black text-[#2A45C2]">
                                                {selectedCampaignTranscripts.transcripts[selectedCandidateIndex].score}/100 Match
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                            {selectedCampaignTranscripts.transcripts[selectedCandidateIndex].summary}
                                        </p>
                                    </div>

                                    {/* Line-by-Line Transcript */}
                                    <div className="flex-1 space-y-3">
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Conversation Transcript</h5>
                                        {selectedCampaignTranscripts.transcripts[selectedCandidateIndex].dialogue.map((turn, tIdx) => (
                                            <div
                                                key={tIdx}
                                                className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] ${turn.speaker === 'AI Agent'
                                                        ? 'bg-[#EEF1FE] text-[#141B3C] border border-[#D0D7FB] rounded-tl-none'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-200 ml-auto rounded-tr-none'
                                                    }`}
                                            >
                                                <span className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                                                    {turn.speaker}
                                                </span>
                                                {turn.text}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 border-t border-[#E7E9F7] flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            className="text-xs font-bold"
                                            onClick={() => toast.success("Transcript exported to PDF")}
                                        >
                                            Export PDF
                                        </Button>
                                        <Button
                                            className="bg-[#2A45C2] text-white text-xs font-bold"
                                            onClick={() => toast.success("Candidate status saved")}
                                        >
                                            Confirm Shortlist
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveAICallingDashboard;