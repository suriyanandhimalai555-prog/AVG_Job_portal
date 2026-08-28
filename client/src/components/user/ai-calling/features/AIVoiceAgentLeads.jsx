import React, { useState } from 'react';
import {
    FaUserCheck, FaSearch, FaFilter, FaRobot,
    FaUsers, FaUserClock, FaChartLine, FaBuilding,
    FaGraduationCap, FaBriefcase, FaGlobe
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';

const AIVoiceAgentLeads = ({ leads, getStatusColor, setActiveLeadAnalysis, verifyLeadAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // --- KPI CALCULATIONS ---
    const totalLeads = leads.length;
    const pendingLeads = leads.filter(l => l.status === 'Unverified').length;
    const qualifiedLeads = leads.filter(l => l.status === 'Qualified' || l.score >= 80).length;
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / (totalLeads - pendingLeads)) * 100) || 0 : 0;

    // --- FILTERING LOGIC ---
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const uniqueStatuses = ['All', ...new Set(leads.map(l => l.status))];

    // --- HELPERS ---
    const getSourceIcon = (source) => {
        const s = source.toLowerCase();
        if (s.includes('business') || s.includes('directory')) return <FaBuilding className="text-indigo-500" />;
        if (s.includes('academy') || s.includes('course')) return <FaGraduationCap className="text-teal-500" />;
        if (s.includes('job') || s.includes('candidate')) return <FaBriefcase className="text-blue-500" />;
        return <FaGlobe className="text-gray-400" />;
    };

    const handleBulkVerify = () => {
        if (pendingLeads === 0) {
            toast.success("All leads are already verified!");
            return;
        }
        toast.loading(`Launching AI to verify ${pendingLeads} pending leads...`, { duration: 3000 });
        setTimeout(() => {
            toast.success("Bulk verification campaign started successfully!");
        }, 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Main Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1">Lead Verification</h3>
                    <p className="text-sm text-gray-500 font-medium">Let AI instantly call, qualify, and score incoming leads from your portals.</p>
                </div>
                <Button
                    onClick={handleBulkVerify}
                    className="bg-[#141B3C] hover:bg-[#2A45C2] text-white flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5"
                    disabled={pendingLeads === 0}
                >
                    <FaRobot className="text-blue-400" /> Verify All Pending ({pendingLeads})
                </Button>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0"><FaUsers /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Leads</p>
                        <p className="text-2xl font-black text-gray-900">{totalLeads}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0"><FaUserClock /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pending AI Call</p>
                        <p className="text-2xl font-black text-gray-900">{pendingLeads}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0"><FaUserCheck /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Highly Qualified</p>
                        <p className="text-2xl font-black text-gray-900">{qualifiedLeads}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0"><FaChartLine /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">AI Qual. Rate</p>
                        <p className="text-2xl font-black text-gray-900">{conversionRate}%</p>
                    </div>
                </div>
            </div>

            {/* Leads Table Section */}
            <div className="bg-white border border-[#E7E9F7] rounded-2xl overflow-hidden shadow-sm">

                {/* Search and Filters Toolbar */}
                <div className="p-5 bg-gray-50 border-b border-[#E7E9F7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h4 className="font-bold text-gray-900">Lead Pipeline</h4>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Review AI qualification scores and next steps</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search name, phone, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm font-medium outline-none focus:border-[#2A45C2] transition-colors"
                            />
                        </div>
                        <div className="relative min-w-[140px]">
                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#2A45C2] appearance-none cursor-pointer"
                            >
                                {uniqueStatuses.map(status => (
                                    <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-[#E7E9F7] text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Lead Contact</th>
                                <th className="p-4">Business Source</th>
                                <th className="p-4">AI Score & Status</th>
                                <th className="p-4">Next Action</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLeads.length > 0 ? filteredLeads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Lead Info */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2A45C2] to-[#8B5CF6] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-[13px]">{lead.name}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">{lead.phone} • {lead.email.split('@')[0]}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Source */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                                                {getSourceIcon(lead.source)}
                                            </div>
                                            <span className="font-semibold text-gray-700 text-xs">{lead.source}</span>
                                        </div>
                                    </td>

                                    {/* AI Score & Status */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5 w-40">
                                            <div className="flex items-center justify-between">
                                                <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                                                {lead.score > 0 && <span className="text-[11px] font-black text-[#2A45C2]">{lead.score}%</span>}
                                            </div>
                                            {lead.score > 0 && (
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${lead.score >= 80 ? 'bg-green-500' : lead.score >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                        style={{ width: `${lead.score}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Next Follow Up */}
                                    <td className="p-4 text-xs font-bold text-gray-600">
                                        {lead.nextFollowUp}
                                        <span className="block text-[10px] text-gray-400 font-medium mt-0.5">Last Contact: {lead.lastContact}</span>
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-right">
                                        {lead.status === 'Unverified' ? (
                                            <Button
                                                size="sm"
                                                onClick={() => verifyLeadAction(lead.id)}
                                                className="bg-[#2A45C2] hover:bg-[#1f3391] text-white text-[11px] font-bold px-4 py-1.5 h-auto shadow-sm"
                                            >
                                                <FaRobot className="inline mr-1.5 opacity-80" /> AI Verify
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setActiveLeadAnalysis(lead)}
                                                className="text-[11px] font-bold px-4 py-1.5 h-auto border-gray-200 text-[#2A45C2] hover:bg-blue-50 hover:border-blue-200"
                                            >
                                                View Analysis
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                                        No leads found matching your search or filter criteria.
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

export default AIVoiceAgentLeads;