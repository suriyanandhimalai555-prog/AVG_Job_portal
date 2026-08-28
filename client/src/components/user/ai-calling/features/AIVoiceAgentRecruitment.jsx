import React, { useState } from 'react';
import {
    FaRobot, FaChartPie, FaHeadset, FaCheckCircle,
    FaFileAlt, FaPlus, FaBriefcase, FaUserTie,
    FaGraduationCap, FaSearch, FaFilter, FaStar
} from 'react-icons/fa';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';

const AIVoiceAgentRecruitment = ({
    campaigns, activeCampaignsCount, totalCallsMade, candidatesShortlisted,
    setIsCreateModalOpen, setSelectedCampaignTranscripts, setSelectedCandidateIndex
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // --- KPI CALCULATIONS ---
    // Extract all candidates from all campaigns to create a unified pipeline view
    const allCandidates = campaigns.flatMap(c =>
        (c.transcripts || []).map((t, index) => ({
            ...t,
            campaignName: c.name,
            campaignId: c.id,
            originalIndex: index
        }))
    );

    const avgScore = allCandidates.length > 0
        ? Math.round(allCandidates.reduce((acc, curr) => acc + curr.score, 0) / allCandidates.length)
        : 0;

    // Filter unified pipeline
    const filteredCandidates = allCandidates.filter(c =>
        c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1">Recruitment AI Agent</h2>
                    <p className="text-sm text-gray-500 font-medium">Deploy AI to screen applicants, score technical skills, and recommend academy upskilling.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#141B3C] hover:bg-[#2A45C2] text-white shadow-lg flex items-center gap-2 transition-all hover:-translate-y-0.5"
                >
                    <FaRobot size={16} className="text-blue-400" /> Create New Campaign
                </Button>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-[#E7E9F7] bg-white flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shrink-0">
                        <FaBriefcase />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Active Campaigns</p>
                        <p className="text-2xl font-black text-gray-900">{activeCampaignsCount}</p>
                    </div>
                </div>
                <div className="p-5 rounded-2xl border border-[#E7E9F7] bg-white flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shrink-0">
                        <FaHeadset />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Candidates Screened</p>
                        <p className="text-2xl font-black text-gray-900">{totalCallsMade}</p>
                    </div>
                </div>
                <div className="p-5 rounded-2xl border border-[#E7E9F7] bg-white flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-black text-xl shrink-0">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Shortlisted</p>
                        <p className="text-2xl font-black text-gray-900">{candidatesShortlisted}</p>
                    </div>
                </div>
                <div className="p-5 rounded-2xl border border-[#E7E9F7] bg-white flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center font-black text-xl shrink-0">
                        <FaStar />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Average Match Score</p>
                        <p className="text-2xl font-black text-gray-900">{avgScore}%</p>
                    </div>
                </div>
            </div>

            {/* Active Campaigns Grid */}
            <h3 className="text-lg md:text-xl font-extrabold text-gray-900 mt-8 mb-4">Active Sourcing Campaigns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
                    const totalTarget = campaign.queued + campaign.completed;
                    const progressPercent = totalTarget > 0 ? Math.round((campaign.completed / totalTarget) * 100) : 0;

                    return (
                        <div key={campaign.id} className="border border-[#E7E9F7] rounded-[24px] p-6 hover:border-[#2A45C2]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white relative overflow-hidden flex flex-col">
                            {/* Decorative Top Border */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#2A45C2] to-[#5B4FE0]"></div>

                            <div className="flex justify-between items-start mb-4 mt-2">
                                <Badge className="bg-green-50 text-green-700 border-green-200 font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1.5 animate-pulse"></span> {campaign.status}
                                </Badge>
                                <span className="text-xs font-bold text-gray-400">{campaign.date}</span>
                            </div>

                            <h4 className="text-lg font-black text-gray-900 mb-2 line-clamp-1 group-hover:text-[#2A45C2] transition-colors">{campaign.name}</h4>
                            <p className="text-sm font-medium text-gray-500 mb-6 line-clamp-2 flex-1 leading-relaxed">{campaign.description}</p>

                            {/* Progress Bar Area */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center text-xs font-bold mb-2">
                                    <span className="text-gray-600">Screening Progress</span>
                                    <span className="text-[#2A45C2]">{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                                    <div className="bg-[#2A45C2] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                    <div className="flex items-center gap-1.5"><FaCheckCircle className="text-green-500" /> {campaign.completed} Done</div>
                                    <div className="flex items-center gap-1.5"><FaHeadset className="text-indigo-400" /> {campaign.queued} Queued</div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full text-sm font-bold border-gray-200 group-hover:border-[#2A45C2] group-hover:text-[#2A45C2] group-hover:bg-blue-50 flex items-center justify-center gap-2"
                                onClick={() => {
                                    setSelectedCampaignTranscripts(campaign);
                                    setSelectedCandidateIndex(0);
                                }}
                            >
                                <FaFileAlt /> Open Campaign Dashboard
                            </Button>
                        </div>
                    );
                })}

                {/* Create New Campaign Card */}
                <div
                    onClick={() => setIsCreateModalOpen(true)}
                    className="border-2 border-dashed border-[#E7E9F7] rounded-[24px] p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50/50 hover:border-[#2A45C2]/40 transition-all duration-300 cursor-pointer min-h-64 group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[#EEF1FE] text-[#2A45C2] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#2A45C2] group-hover:text-white transition-all shadow-sm">
                        <FaPlus size={24} />
                    </div>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-2">Start New Campaign</h4>
                    <p className="text-sm font-medium text-gray-500 max-w-[200px] leading-relaxed">Select candidates from the Job Portal and initiate AI screening.</p>
                </div>
            </div>

            {/* --- NEW: GLOBAL CANDIDATE PIPELINE --- */}
            <div className="bg-white border border-[#E7E9F7] rounded-[24px] overflow-hidden shadow-sm mt-8">
                <div className="p-5 bg-gray-50 border-b border-[#E7E9F7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h4 className="font-bold text-gray-900">Recent Candidate Pipeline</h4>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Live evaluation results across all active campaigns</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search candidates or roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm font-medium outline-none focus:border-[#2A45C2] transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-[#E7E9F7] text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Candidate Info</th>
                                <th className="p-4">Applied Role (Campaign)</th>
                                <th className="p-4">AI Fit Score</th>
                                <th className="p-4">Ecosystem Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCandidates.length > 0 ? filteredCandidates.map((candidate, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm shrink-0">
                                                <FaUserTie size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-[13px]">{candidate.candidateName}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">{candidate.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-gray-700 text-xs">{candidate.campaignName}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 w-32">
                                            <span className="font-black text-gray-900 text-sm">{candidate.score}%</span>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${candidate.score >= 80 ? 'bg-green-500' : candidate.score >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                    style={{ width: `${candidate.score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {candidate.shortlisted ? (
                                            <Badge className="bg-green-50 text-green-700 border-green-200">
                                                Ready for Employer Handoff
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                                                Academy Upskill Recommended
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-[11px] font-bold px-4 py-1.5 h-auto border-gray-200 text-[#2A45C2] hover:bg-blue-50"
                                            onClick={() => {
                                                // Find the parent campaign and candidate index to trigger the parent's modal logic seamlessly
                                                const parentCampaign = campaigns.find(c => c.id === candidate.campaignId);
                                                setSelectedCampaignTranscripts(parentCampaign);
                                                setSelectedCandidateIndex(candidate.originalIndex);
                                            }}
                                        >
                                            View AI Analysis
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                                        No candidates found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AIVoiceAgentRecruitment;