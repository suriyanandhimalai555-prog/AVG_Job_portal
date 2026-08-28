import React, { useState } from 'react';
import {
    FaExclamationTriangle, FaLifeRing, FaRobot, FaUserCog,
    FaSearch, FaFilter, FaChartLine, FaTicketAlt, FaCommentDots,
    FaArrowRight
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';

const AIVoiceAgentSupport = ({ supportTickets, getStatusColor }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // --- KPI CALCULATIONS ---
    const totalTickets = supportTickets.length;
    const resolvedCount = supportTickets.filter(t => t.status === 'Resolved').length;
    const escalatedCount = supportTickets.filter(t => t.status === 'Escalated').length;
    const aiResolutionRate = totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0;

    // --- FILTERING LOGIC ---
    const filteredTickets = supportTickets.filter(ticket => {
        const matchesSearch = ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const uniqueStatuses = ['All', ...new Set(supportTickets.map(t => t.status))];

    // --- HELPERS ---
    const handleTakeOver = (customerName) => {
        toast.loading(`Connecting to live call with ${customerName}...`, { duration: 2000 });
        setTimeout(() => {
            toast.success(`You have taken over the conversation with ${customerName}.`);
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Main Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1">AI Support & Escalations</h3>
                    <p className="text-sm text-gray-500 font-medium">Monitor automated issue resolution and intervene on high-priority escalations.</p>
                </div>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0"><FaTicketAlt /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Queries</p>
                        <p className="text-2xl font-black text-gray-900">{totalTickets}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0"><FaRobot /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">AI Resolved</p>
                        <p className="text-2xl font-black text-gray-900">{resolvedCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Add a subtle red warning glow to the escalated card */}
                    {escalatedCount > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-2xl"></div>}
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl shrink-0 relative z-10"><FaExclamationTriangle /></div>
                    <div className="relative z-10">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Escalated</p>
                        <p className="text-2xl font-black text-gray-900">{escalatedCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0"><FaChartLine /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Resolution Rate</p>
                        <p className="text-2xl font-black text-gray-900">{aiResolutionRate}%</p>
                    </div>
                </div>
            </div>

            {/* Support Tickets Section */}
            <div className="bg-white border border-[#E7E9F7] rounded-2xl overflow-hidden shadow-sm">

                {/* Search and Filters Toolbar */}
                <div className="p-5 bg-gray-50 border-b border-[#E7E9F7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h4 className="font-bold text-gray-900">Support Interactions</h4>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Live view of AI support logs and human handoffs</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search customer, issue, ID..."
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

                {/* Ticket Cards Grid */}
                <div className="p-5 bg-gray-50/50">
                    <div className="grid gap-4">
                        {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                            <div key={ticket.id} className="bg-white border border-[#E7E9F7] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#2A45C2]/30 transition-all group flex flex-col lg:flex-row gap-6 relative overflow-hidden">

                                {/* Status Indicator Line */}
                                <div className={`absolute left-0 top-0 w-1 h-full ${ticket.status === 'Escalated' ? 'bg-red-500' : 'bg-green-500'}`}></div>

                                {/* Customer & Ticket Identity */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">{ticket.id}</span>
                                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>

                                        {ticket.escalation !== 'None' && (
                                            <Badge className="bg-red-50 text-red-600 border-red-200 animate-pulse">
                                                <FaExclamationTriangle className="inline mr-1" /> {ticket.escalation}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center font-bold text-gray-600 shrink-0 shadow-sm">
                                            {ticket.customer.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base">{ticket.customer}</h4>
                                            <p className="text-xs font-semibold text-[#2A45C2]">{ticket.intent}</p>
                                        </div>
                                    </div>

                                </div>

                                {/* Issue & AI Action Box */}
                                <div className="flex-[1.5] bg-[#F9FAFF] border border-[#E2E8F0] p-4 rounded-xl flex flex-col justify-center">
                                    <p className="text-sm text-gray-800 mb-2">
                                        <span className="font-bold text-gray-900">Reported Issue: </span>
                                        {ticket.issue}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-bold text-[#2A45C2]"><FaRobot className="inline mr-1 -mt-0.5" /> AI Action Taken: </span>
                                        {ticket.resolution}
                                    </p>
                                </div>

                                {/* Actions / Resolution Buttons */}
                                <div className="flex flex-col justify-center gap-2 min-w-[160px]">
                                    <Button
                                        variant="outline"
                                        onClick={() => toast.success("Transcript loaded. See detailed call modal.")}
                                        className="w-full text-xs font-bold border-gray-200 text-gray-600 hover:text-[#2A45C2] hover:border-[#2A45C2] flex justify-center items-center gap-2"
                                    >
                                        <FaCommentDots /> View Transcript
                                    </Button>

                                    {ticket.status === 'Escalated' ? (
                                        <Button
                                            className="w-full bg-red-600 text-white hover:bg-red-700 text-xs font-bold flex justify-center items-center gap-2 shadow-sm shadow-red-500/20"
                                            onClick={() => handleTakeOver(ticket.customer)}
                                        >
                                            <FaUserCog /> Take Over Call
                                        </Button>
                                    ) : ticket.status !== 'Resolved' && (
                                        <Button
                                            variant="outline"
                                            className="w-full bg-white border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex justify-center items-center gap-2"
                                            onClick={() => toast.success("Manually escalated to human agent queue.")}
                                        >
                                            <FaArrowRight /> Escalate
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center text-gray-500 font-medium bg-white rounded-2xl border border-[#E7E9F7]">
                                <FaLifeRing className="mx-auto mb-3 text-gray-300" size={32} />
                                No support tickets match your search.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIVoiceAgentSupport;