import React, { useState, useEffect, useRef } from 'react';
import {
    FaRobot, FaTimes, FaSpinner, FaSave, FaUserCheck, FaExclamationCircle, FaCalendarPlus, FaPhone, FaFileAlt
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Shimmer from '../../ui/Shimmer';

// --- FEATURE COMPONENT IMPORTS ---
import AIVoiceAgentOverview from './features/AIVoiceAgentOverview';
import AIVoiceAgentInbound from './features/AIVoiceAgentInbound';
import AIVoiceAgentLeads from './features/AIVoiceAgentLeads';
import AIVoiceAgentAppointments from './features/AIVoiceAgentAppointments';
import AIVoiceAgentSupport from './features/AIVoiceAgentSupport';
import AIVoiceAgentCallLogs from './features/AIVoiceAgentCallLogs';
import AIVoiceAgentRecruitment from './features/AIVoiceAgentRecruitment';

// --- MOCK DATA ---
const INITIAL_MOCK_CALL_LOGS = [
    {
        id: 'AI-10291', customer: 'Alex Vance', phone: '+1 555-019-2834', type: 'Outbound', purpose: 'Lead Verification', date: '2026-08-25', time: '09:14 AM', duration: '04:32', status: 'Completed', intent: 'Interested', sentiment: 'Positive', score: 92, outcome: 'Qualified', followUp: 'Required', appointment: 'Booked', recordingUrl: '#', transcript: [
            { speaker: 'AI', text: 'Hello Alex, I am calling from Agila Vetri to verify your recent inquiry.' },
            { speaker: 'Alex', text: 'Yes, I was looking for more information on your enterprise plans.' }
        ], summary: 'Customer confirmed interest in enterprise tier. Verified contact details and booked follow-up appointment.'
    },
    {
        id: 'AI-10292', customer: 'Jordan Smith', phone: '+1 555-014-9921', type: 'Inbound', purpose: 'Customer Support', date: '2026-08-25', time: '10:05 AM', duration: '02:15', status: 'Resolved', intent: 'Support', sentiment: 'Neutral', score: 85, outcome: 'Issue Resolved', followUp: 'None', appointment: 'None', recordingUrl: '#', transcript: [
            { speaker: 'AI', text: 'Thank you for calling support. How can I help you today?' },
            { speaker: 'Jordan', text: 'I need help resetting my account password.' },
            { speaker: 'AI', text: 'I can help with that. I have sent a secure reset link to your registered email.' }
        ], summary: 'Customer requested password reset. AI securely authenticated and dispatched reset protocol.'
    },
    {
        id: 'AI-10293', customer: 'Elena Cortez', phone: '+1 555-018-7744', type: 'Outbound', purpose: 'Appointment Reminder', date: '2026-08-25', time: '11:30 AM', duration: '01:12', status: 'Completed', intent: 'Confirmation', sentiment: 'Positive', score: 98, outcome: 'Confirmed', followUp: 'None', appointment: 'Confirmed', recordingUrl: '#', transcript: [
            { speaker: 'AI', text: 'Hi Elena, this is an automated reminder for your appointment tomorrow at 2 PM.' },
            { speaker: 'Elena', text: 'Thanks, I will be there.' }
        ], summary: 'Successfully confirmed upcoming appointment. No human intervention needed.'
    },
    {
        id: 'AI-10294', customer: 'Marcus Chen', phone: '+1 555-012-3388', type: 'Inbound', purpose: 'Complaint', date: '2026-08-25', time: '12:45 PM', duration: '06:20', status: 'Escalated', intent: 'Complaint', sentiment: 'Negative', score: 45, outcome: 'Escalated', followUp: 'Required', appointment: 'None', recordingUrl: '#', transcript: [
            { speaker: 'AI', text: 'I understand you are frustrated with the billing error, Marcus. Let me connect you to a human specialist to resolve this immediately.' },
            { speaker: 'Marcus', text: 'Yes, please transfer me now.' }
        ], summary: 'Customer upset regarding billing discrepancy. AI successfully de-escalated slightly and transferred to human billing department.'
    }
];

const INITIAL_MOCK_LEADS = [
    { id: 'L-101', name: 'Sarah Jenkins', phone: '+1 555-011-2233', email: 'sarah.j@example.com', source: 'Website', status: 'Verified', interest: 'High', score: 95, lastContact: 'Today', nextFollowUp: 'Tomorrow' },
    { id: 'L-102', name: 'David Kim', phone: '+1 555-019-8844', email: 'dkim@example.com', source: 'Referral', status: 'Unverified', interest: 'Pending', score: 0, lastContact: 'Yesterday', nextFollowUp: 'Today' },
    { id: 'L-103', name: 'Priya Patel', phone: '+1 555-016-5577', email: 'ppatel@example.com', source: 'Ad Campaign', status: 'Qualified', interest: 'High', score: 88, lastContact: '2 days ago', nextFollowUp: 'Next Week' }
];

const INITIAL_MOCK_APPOINTMENTS = [
    { id: 'APT-501', customer: 'Alex Vance', phone: '+1 555-019-2834', service: 'Enterprise Demo', date: '2026-08-26', time: '10:00 AM', status: 'Confirmed', bookedBy: 'AI Agent', reminder: 'Sent' },
    { id: 'APT-502', customer: 'Lisa Ray', phone: '+1 555-013-4411', service: 'Consultation', date: '2026-08-26', time: '02:30 PM', status: 'Scheduled', bookedBy: 'Web Portal', reminder: 'Pending' }
];

const INITIAL_MOCK_TICKETS = [
    { id: 'T-901', customer: 'Marcus Chen', issue: 'Billing Error', intent: 'Complaint', resolution: 'Transferred to Billing Agent', status: 'Escalated', escalation: 'High Priority' },
    { id: 'T-902', customer: 'Jordan Smith', issue: 'Password Reset', intent: 'Support', resolution: 'Provided reset link automatically', status: 'Resolved', escalation: 'None' }
];

const ActiveAICallingDashboard = () => {
    const topRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    // --- SHARED PLATFORM STATES ---
    const [callLogs, setCallLogs] = useState(INITIAL_MOCK_CALL_LOGS);
    const [leads, setLeads] = useState(INITIAL_MOCK_LEADS);
    const [appointments, setAppointments] = useState(INITIAL_MOCK_APPOINTMENTS);
    const [supportTickets, setSupportTickets] = useState(INITIAL_MOCK_TICKETS);

    // --- MODAL STATES ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCampaignTranscripts, setSelectedCampaignTranscripts] = useState(null);
    const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isIncomingCallActive, setIsIncomingCallActive] = useState(false);
    const [activeCallDetail, setActiveCallDetail] = useState(null);
    const [activeLeadAnalysis, setActiveLeadAnalysis] = useState(null);
    const [isBookApptModalOpen, setIsBookApptModalOpen] = useState(false);

    // --- RECRUITMENT SPECIFIC STATE ---
    const [campaigns, setCampaigns] = useState([
        {
            id: 1, name: "Bioinformatics Analyst Screening", description: "Assessing candidates on PCR techniques, data parsing with Python/R, and general lab protocols.",
            queued: 50, completed: 32, status: "Active", date: "Today",
            transcripts: [
                { candidateName: "Alex Vance", phone: "+1 (555) 019-2834", score: 92, shortlisted: true, summary: "Strong laboratory experience with PCR assays. Experienced in parsing FASTQ data using Python.", dialogue: [{ speaker: "AI Agent", text: "Hi Alex! I'm calling from Agila Vetri regarding your application. Do you have a couple of minutes?" }, { speaker: "Alex Vance", text: "Yes, sure! I have time right now." }] },
                { candidateName: "Jordan Smith", phone: "+1 (555) 014-9921", score: 58, shortlisted: false, summary: "Basic understanding of bio-data, but lacks hands-on PCR laboratory experience.", dialogue: [{ speaker: "AI Agent", text: "Hello Jordan, calling regarding your recent Bioinformatics application." }, { speaker: "Jordan Smith", text: "Hi! Yes, I applied last week." }] }
            ]
        }
    ]);

    const [newCampaign, setNewCampaign] = useState({ name: '', description: '', candidateList: '+1 555-019-2834 (Alex Vance)\n+1 555-014-9921 (Jordan Smith)' });
    const [newAppt, setNewAppt] = useState({ customer: '', phone: '', service: '', date: '', time: '' });

    // --- DERIVED CAMPAIGN STATISTICS ---
    const activeCampaignsCount = campaigns.filter(c => c.status === "Active").length;
    const totalCallsMade = campaigns.reduce((acc, curr) => acc + curr.completed, 0);
    const candidatesShortlisted = campaigns.reduce((acc, curr) => {
        const count = curr.transcripts?.filter(t => t.shortlisted).length || 0;
        return acc + count;
    }, 0);

    // --- HELPERS ---
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            window.scrollTo(0, 0);
            if (topRef.current) topRef.current.scrollIntoView({ block: 'start', inline: 'nearest' });
        }
    }, [activeTab, isLoading]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active': case 'completed': case 'verified': case 'resolved': case 'confirmed': case 'qualified': return 'bg-green-100 text-green-700 border-green-200';
            case 'escalated': case 'failed': case 'unverified': case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': case 'scheduled': case 'queued': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // --- ACTIONS ---
    const handleCreateRecruitmentCampaign = (e) => {
        e.preventDefault();
        if (!newCampaign.name.trim() || !newCampaign.description.trim()) return toast.error("Please fill in all details.");
        setIsSubmitting(true);
        const phoneLines = newCampaign.candidateList.split('\n').filter(line => line.trim().length > 0);
        setTimeout(() => {
            const addedCampaign = {
                id: Date.now(), name: newCampaign.name, description: newCampaign.description, queued: phoneLines.length || 10, completed: 0, status: "Active", date: "Just now",
                transcripts: [{ candidateName: "New Applicant #1", phone: "+1 (555) 123-4567", score: 85, shortlisted: true, summary: "Matched initial parameters.", dialogue: [{ speaker: "AI", text: "Hello!" }] }]
            };
            setCampaigns([addedCampaign, ...campaigns]);
            setIsSubmitting(false); setIsCreateModalOpen(false);
            setNewCampaign({ name: '', description: '', candidateList: '' });
            toast.success(`Campaign launched! ${addedCampaign.queued} queued.`);
        }, 1000);
    };

    const handleBookAppointment = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            const addedAppt = {
                id: `APT-${Date.now().toString().slice(-4)}`, customer: newAppt.customer, phone: newAppt.phone, service: newAppt.service, date: newAppt.date, time: newAppt.time, status: 'Scheduled', bookedBy: 'Manual', reminder: 'Pending'
            };
            setAppointments([addedAppt, ...appointments]);
            setIsSubmitting(false); setIsBookApptModalOpen(false);
            setNewAppt({ customer: '', phone: '', service: '', date: '', time: '' });
            toast.success('Appointment Booked Successfully!');
        }, 800);
    };

    const simulateIncomingCall = () => setIsIncomingCallActive(true);

    const answerCall = () => {
        setIsIncomingCallActive(false);
        toast.success("AI Agent picked up the call.");
        setTimeout(() => toast.success("AI is currently resolving customer intent..."), 2000);
    };

    const verifyLeadAction = (id) => {
        toast.loading("AI is calling to verify lead...", { duration: 2000 });
        setTimeout(() => {
            setLeads(leads.map(l => l.id === id ? { ...l, status: 'Verified', interest: 'High', score: 98 } : l));
            toast.success("Lead verified automatically!");
        }, 2000);
    };

    const TABS = ['Overview', 'Inbound', 'Leads', 'Appointments', 'Support', 'Call Logs', 'Recruitment'];

    // --- FULL PAGE SHIMMER STATE ---
    if (isLoading) {
        return (
            <div className="max-w-[1400px] mx-auto p-2 md:p-6 bg-[#F5F6FC] min-h-screen flex flex-col">
                <div className="mb-6">
                    <Shimmer className="w-72 h-10 rounded-xl mb-4 bg-gray-200" />
                    <div className="flex gap-2 border-b border-[#E7E9F7] pb-2 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => <Shimmer key={i} className="w-28 h-10 rounded-t-xl bg-gray-200 shrink-0" />)}
                    </div>
                </div>
                <div className="flex-1 space-y-6">
                    <Shimmer className="w-48 h-8 rounded-lg bg-gray-200" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="p-4 md:p-5 rounded-2xl border border-[#E7E9F7] bg-white flex items-center gap-4">
                                <Shimmer className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 shrink-0" />
                                <div className="flex-1">
                                    <Shimmer className="w-24 h-3 rounded mb-2 bg-gray-200" />
                                    <Shimmer className="w-16 h-6 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white border border-[#E7E9F7] rounded-2xl h-64 p-6 flex flex-col">
                            <Shimmer className="w-1/2 h-6 rounded mb-4 bg-gray-200" />
                            <Shimmer className="w-full h-full rounded-xl bg-gray-200" />
                        </div>
                        <div className="bg-white border border-[#E7E9F7] rounded-2xl h-64 p-6 flex flex-col">
                            <Shimmer className="w-1/2 h-6 rounded mb-4 bg-gray-200" />
                            <Shimmer className="w-full h-full rounded-xl bg-gray-200" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={topRef} className="max-w-[1400px] mx-auto p-2 md:p-6 bg-[#F5F6FC] min-h-screen animate-fade-in flex flex-col">
            <Toaster position="top-right" />

            {/* HEADER & NAV */}
            <div className="mb-6">
                <h1 className="text-3xl font-black text-[#141B3C] mb-4">AI Voice Agent Platform</h1>
                <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar border-b border-[#E7E9F7]">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-t-xl font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? 'bg-white text-[#2A45C2] border-[#2A45C2] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-white/50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT MAPPED TO SEPARATED COMPONENTS */}
            <div className="flex-1">
                {activeTab === 'Overview' && <AIVoiceAgentOverview campaignsCount={campaigns.length} />}

                {activeTab === 'Inbound' && <AIVoiceAgentInbound
                    callLogs={callLogs}
                    getStatusColor={getStatusColor}
                    setActiveCallDetail={setActiveCallDetail}
                    simulateIncomingCall={simulateIncomingCall}
                />}

                {activeTab === 'Leads' && <AIVoiceAgentLeads
                    leads={leads}
                    getStatusColor={getStatusColor}
                    setActiveLeadAnalysis={setActiveLeadAnalysis}
                    verifyLeadAction={verifyLeadAction}
                />}

                {activeTab === 'Appointments' && <AIVoiceAgentAppointments
                    appointments={appointments}
                    getStatusColor={getStatusColor}
                    setIsBookApptModalOpen={setIsBookApptModalOpen}
                />}

                {activeTab === 'Support' && <AIVoiceAgentSupport
                    supportTickets={supportTickets}
                    getStatusColor={getStatusColor}
                />}

                {activeTab === 'Call Logs' && <AIVoiceAgentCallLogs
                    callLogs={callLogs}
                    getStatusColor={getStatusColor}
                    setActiveCallDetail={setActiveCallDetail}
                />}

                {activeTab === 'Recruitment' && <AIVoiceAgentRecruitment
                    campaigns={campaigns}
                    activeCampaignsCount={activeCampaignsCount}
                    totalCallsMade={totalCallsMade}
                    candidatesShortlisted={candidatesShortlisted}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    setSelectedCampaignTranscripts={setSelectedCampaignTranscripts}
                    setSelectedCandidateIndex={setSelectedCandidateIndex}
                />}
            </div>

            {/* --- GLOBAL MODALS FOR DASHBOARD --- */}

            {/* Create Recruitment Campaign Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2"><FaRobot className="text-[#2A45C2]" /> Create AI Campaign</h3>
                            <button onClick={() => !isSubmitting && setIsCreateModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreateRecruitmentCampaign} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Role / Campaign Name</label>
                                <input type="text" required value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} placeholder="e.g. Senior Frontend Developer" className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/50 focus:border-[#2A45C2] transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Interview Focus / AI Criteria</label>
                                <textarea required rows="3" value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} placeholder="Specify questions the AI should ask..." className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/50 focus:border-[#2A45C2] transition-all text-sm font-medium resize-none"></textarea>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5"><FaPhone className="text-[#2A45C2]" size={12} /> Feed Candidate Phone Numbers</label>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">One per line</span>
                                </div>
                                <textarea required rows="4" value={newCampaign.candidateList} onChange={(e) => setNewCampaign({ ...newCampaign, candidateList: e.target.value })} placeholder="+1 555-019-2834 (Alex Vance)" className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/50 focus:border-[#2A45C2] transition-all text-xs font-mono resize-none bg-gray-50"></textarea>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" className="flex-1 bg-[#2A45C2] text-white flex items-center justify-center gap-2" disabled={isSubmitting}>
                                    {isSubmitting ? <><FaSpinner className="animate-spin" /> Launching...</> : <><FaSave /> Launch Campaign</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Recruitment Transcripts Modal */}
            {selectedCampaignTranscripts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <div>
                                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2"><FaFileAlt className="text-[#2A45C2]" /> Call Transcripts & Shortlists</h3>
                                <p className="text-xs text-gray-500 font-medium">{selectedCampaignTranscripts.name}</p>
                            </div>
                            <button onClick={() => setSelectedCampaignTranscripts(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"><FaTimes /></button>
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            <div className="w-full md:w-1/3 border-r border-[#E7E9F7] bg-gray-50 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Candidates Called</h4>
                                {selectedCampaignTranscripts.transcripts?.map((candidate, idx) => (
                                    <div key={idx} onClick={() => setSelectedCandidateIndex(idx)} className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${selectedCandidateIndex === idx ? 'bg-white border-[#2A45C2] shadow-md ring-2 ring-[#2A45C2]/10' : 'bg-white/60 border-[#E7E9F7] hover:bg-white'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sm text-gray-900">{candidate.candidateName}</span>
                                            {candidate.shortlisted ? <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] font-bold">Shortlisted</Badge> : <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] font-bold">Review</Badge>}
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500 font-medium mt-1">
                                            <span>{candidate.phone}</span>
                                            <span className="font-extrabold text-[#2A45C2]">Score: {candidate.score}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {selectedCampaignTranscripts.transcripts?.[selectedCandidateIndex] && (
                                <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col bg-white custom-scrollbar">
                                    <div className="p-4 rounded-2xl bg-[#F8FAFF] border border-[#E2E8F0] space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {selectedCampaignTranscripts.transcripts[selectedCandidateIndex].shortlisted ? <FaUserCheck className="text-green-500" size={18} /> : <FaExclamationCircle className="text-amber-500" size={18} />}
                                                <h4 className="font-extrabold text-gray-900 text-base">AI Evaluation & Fit Analysis</h4>
                                            </div>
                                            <span className="text-lg font-black text-[#2A45C2]">{selectedCampaignTranscripts.transcripts[selectedCandidateIndex].score}/100 Match</span>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{selectedCampaignTranscripts.transcripts[selectedCandidateIndex].summary}</p>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Conversation Transcript</h5>
                                        {selectedCampaignTranscripts.transcripts[selectedCandidateIndex].dialogue.map((turn, tIdx) => (
                                            <div key={tIdx} className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] ${turn.speaker === 'AI Agent' || turn.speaker === 'AI' ? 'bg-[#EEF1FE] text-[#141B3C] border border-[#D0D7FB] rounded-tl-none' : 'bg-gray-100 text-gray-800 border border-gray-200 ml-auto rounded-tr-none'}`}>
                                                <span className="block text-[10px] font-black uppercase text-gray-400 mb-1">{turn.speaker}</span>
                                                {turn.text}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-[#E7E9F7] flex justify-end gap-3">
                                        <Button variant="outline" className="text-xs font-bold" onClick={() => toast.success("Transcript exported to PDF")}>Export PDF</Button>
                                        <Button className="bg-[#2A45C2] text-white text-xs font-bold" onClick={() => toast.success("Candidate status saved")}>Confirm Shortlist</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Complete Call Log Details Modal */}
            {activeCallDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <div>
                                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">Call Detail: {activeCallDetail.id}</h3>
                                <p className="text-xs text-gray-500 font-medium">{activeCallDetail.date} at {activeCallDetail.time}</p>
                            </div>
                            <button onClick={() => setActiveCallDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"><FaTimes /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Customer</p><p className="font-bold text-gray-900 text-sm">{activeCallDetail.customer}</p></div>
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Type</p><p className="font-bold text-gray-900 text-sm">{activeCallDetail.type}</p></div>
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Purpose</p><p className="font-bold text-gray-900 text-sm">{activeCallDetail.purpose}</p></div>
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p><p className="font-bold text-gray-900 text-sm">{activeCallDetail.duration}</p></div>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#F8FAFF] border border-[#E2E8F0] space-y-2">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-extrabold text-gray-900 text-base">AI Analysis Summary</h4>
                                    <span className="text-sm font-black text-[#2A45C2]">Score: {activeCallDetail.score}%</span>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <Badge className="bg-blue-100 text-blue-700">Intent: {activeCallDetail.intent}</Badge>
                                    <Badge className={activeCallDetail.sentiment === 'Positive' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>Sentiment: {activeCallDetail.sentiment}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">{activeCallDetail.summary}</p>
                            </div>
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Call Transcript</h5>
                                {activeCallDetail.transcript.map((turn, tIdx) => (
                                    <div key={tIdx} className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] ${turn.speaker === 'AI' ? 'bg-[#EEF1FE] text-[#141B3C] border border-[#D0D7FB] rounded-tl-none' : 'bg-gray-100 text-gray-800 border border-gray-200 ml-auto rounded-tr-none'}`}>
                                        <span className="block text-[10px] font-black uppercase text-gray-400 mb-1">{turn.speaker}</span>
                                        {turn.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-[#E7E9F7] flex justify-end gap-3 bg-gray-50">
                            <Button variant="outline" className="text-sm font-bold bg-white" onClick={() => toast.success("Transcript Downloaded")}>Download</Button>
                            <Button className="bg-[#2A45C2] text-white text-sm font-bold flex items-center gap-2" onClick={() => toast.success("Follow-up scheduled")}><FaCalendarPlus /> Follow-up</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Book Appointment Modal */}
            {isBookApptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2"><FaCalendarPlus className="text-[#2A45C2]" /> Book Appointment</h3>
                            <button onClick={() => !isSubmitting && setIsBookApptModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
                            <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Customer Name</label><input required type="text" value={newAppt.customer} onChange={e => setNewAppt({ ...newAppt, customer: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/50 outline-none text-sm" /></div>
                            <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Phone</label><input required type="text" value={newAppt.phone} onChange={e => setNewAppt({ ...newAppt, phone: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/50 outline-none text-sm" /></div>
                            <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Service / Reason</label><input required type="text" value={newAppt.service} onChange={e => setNewAppt({ ...newAppt, service: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/50 outline-none text-sm" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Date</label><input required type="date" value={newAppt.date} onChange={e => setNewAppt({ ...newAppt, date: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/50 outline-none text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Time</label><input required type="time" value={newAppt.time} onChange={e => setNewAppt({ ...newAppt, time: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/50 outline-none text-sm" /></div>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsBookApptModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" className="flex-1 bg-[#2A45C2] text-white flex items-center justify-center gap-2" disabled={isSubmitting}>{isSubmitting ? <FaSpinner className="animate-spin" /> : 'Confirm Booking'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lead Analysis Modal */}
            {activeLeadAnalysis && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gray-50">
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2"><FaUserCheck className="text-green-600" /> Lead Analysis: {activeLeadAnalysis.name}</h3>
                            <button onClick={() => setActiveLeadAnalysis(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"><FaTimes /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center p-4 bg-green-50 border border-green-100 rounded-2xl">
                                <div>
                                    <p className="text-xs font-bold text-green-600 uppercase mb-1">Verification Score</p>
                                    <p className="text-3xl font-black text-green-700">{activeLeadAnalysis.score}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-green-600 uppercase mb-1">Interest Level</p>
                                    <p className="text-lg font-black text-green-700">{activeLeadAnalysis.interest}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">AI successfully verified lead details. Lead requested a follow-up demo for next week. Budget confirmed.</p>
                            <Button className="w-full bg-[#2A45C2] text-white" onClick={() => { setActiveLeadAnalysis(null); setIsBookApptModalOpen(true); }}>Convert to Appointment</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simulated Incoming Call Overlay */}
            {isIncomingCallActive && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center text-center p-8 relative">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#2A45C2]/20 to-transparent"></div>
                        <div className="w-24 h-24 rounded-full bg-[#2A45C2] text-white flex items-center justify-center text-3xl font-black mb-4 relative z-10 shadow-lg shadow-[#2A45C2]/40 animate-pulse">
                            C
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-1 z-10">Incoming Call</h3>
                        <p className="text-gray-500 font-medium mb-2 z-10">Customer: Chris Johnson</p>
                        <Badge className="bg-blue-100 text-blue-700 mb-8 z-10 font-bold px-3 py-1">AI Agent Intercepting...</Badge>

                        <div className="flex gap-4 w-full z-10">
                            <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setIsIncomingCallActive(false)}>Reject</Button>
                            <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={answerCall}>Allow AI Answer</Button>
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

export default ActiveAICallingDashboard;