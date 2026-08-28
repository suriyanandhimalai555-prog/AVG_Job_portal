import React, { useState } from 'react';
import {
    FaSearch, FaFilter, FaDownload, FaPlayCircle,
    FaListAlt, FaSmile, FaClock, FaPhoneAlt, FaBriefcase,
    FaGraduationCap, FaBuilding, FaGlobe
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';

const AIVoiceAgentCallLogs = ({ callLogs, getStatusColor, setActiveCallDetail }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sentimentFilter, setSentimentFilter] = useState('All');

    // --- KPI & DATA CALCULATIONS ---
    const totalCalls = callLogs.length;

    const totalSeconds = callLogs.reduce((acc, call) => {
        const [mins, secs] = call.duration.split(':').map(Number);
        return acc + (mins * 60 + secs);
    }, 0);

    const avgSeconds = totalCalls > 0 ? Math.round(totalSeconds / totalCalls) : 0;
    const avgMins = String(Math.floor(avgSeconds / 60)).padStart(2, '0');
    const avgSecsRemainder = String(avgSeconds % 60).padStart(2, '0');
    const averageDuration = `${avgMins}:${avgSecsRemainder}`;

    const positiveCalls = callLogs.filter(c => c.sentiment === 'Positive').length;
    const positiveRate = totalCalls > 0 ? Math.round((positiveCalls / totalCalls) * 100) : 0;

    // --- FILTERING LOGIC ---
    const filteredLogs = callLogs.filter(log => {
        const matchesSearch = log.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.phone.includes(searchTerm);
        const matchesType = typeFilter === 'All' || log.type === typeFilter;
        const matchesSentiment = sentimentFilter === 'All' || log.sentiment === sentimentFilter;
        return matchesSearch && matchesType && matchesSentiment;
    });

    // --- HELPERS ---
    const getEcosystemContext = (purpose) => {
        const p = purpose.toLowerCase();
        if (p.includes('interview') || p.includes('screening') || p.includes('recruitment')) {
            return { label: 'Job Portal', icon: <FaBriefcase />, color: 'bg-blue-100 text-blue-700' };
        }
        if (p.includes('course') || p.includes('academy') || p.includes('training')) {
            return { label: 'Academy', icon: <FaGraduationCap />, color: 'bg-teal-100 text-teal-700' };
        }
        if (p.includes('lead') || p.includes('demo') || p.includes('consultation')) {
            return { label: 'B2B Directory', icon: <FaBuilding />, color: 'bg-indigo-100 text-indigo-700' };
        }
        return { label: 'General', icon: <FaGlobe />, color: 'bg-gray-100 text-gray-700' };
    };

    const handleExportCSV = () => {
        toast.loading("Compiling call logs for export...", { duration: 2000 });
        setTimeout(() => {
            toast.success("Call logs exported to CSV successfully!");
        }, 2000);
    };

    const handleQuickPlay = (customer) => {
        toast.success(`Playing latest recording for ${customer}...`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Main Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1">Complete Call Logs</h3>
                    <p className="text-sm text-gray-500 font-medium">Review, filter, and audit every AI conversation across your platform.</p>
                </div>
                <Button
                    onClick={handleExportCSV}
                    className="bg-[#141B3C] hover:bg-[#2A45C2] text-white flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5"
                >
                    <FaDownload /> Export CSV
                </Button>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0"><FaListAlt /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Call Records</p>
                        <p className="text-2xl font-black text-gray-900">{totalCalls}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0"><FaClock /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Average Duration</p>
                        <p className="text-2xl font-black text-gray-900">{averageDuration}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0"><FaSmile /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Overall Positive Sentiment</p>
                        <p className="text-2xl font-black text-gray-900">{positiveRate}%</p>
                    </div>
                </div>
            </div>

            {/* Call Logs Table Section */}
            <div className="bg-white border border-[#E7E9F7] rounded-2xl overflow-hidden shadow-sm">

                {/* Search and Filters Toolbar */}
                <div className="p-5 bg-gray-50 border-b border-[#E7E9F7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h4 className="font-bold text-gray-900">Communication Ledger</h4>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Search by ID, customer name, or phone number</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm font-medium outline-none focus:border-[#2A45C2] transition-colors"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="relative min-w-[130px]">
                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#2A45C2] appearance-none cursor-pointer"
                            >
                                <option value="All">All Types</option>
                                <option value="Inbound">Inbound</option>
                                <option value="Outbound">Outbound</option>
                            </select>
                        </div>

                        {/* Sentiment Filter */}
                        <div className="relative min-w-[140px]">
                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <select
                                value={sentimentFilter}
                                onChange={(e) => setSentimentFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#2A45C2] appearance-none cursor-pointer"
                            >
                                <option value="All">All Sentiments</option>
                                <option value="Positive">Positive</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Negative">Negative</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-[#E7E9F7] text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Call ID & Date</th>
                                <th className="p-4">Customer Info</th>
                                <th className="p-4">Type & Platform Context</th>
                                <th className="p-4">AI Analysis</th>
                                <th className="p-4">Outcome</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.length > 0 ? filteredLogs.map(log => {
                                const context = getEcosystemContext(log.purpose);

                                return (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4">
                                            <p className="font-black text-gray-900 text-[13px] tracking-wide">{log.id}</p>
                                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{log.date} • {log.time}</p>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold shadow-sm shrink-0">
                                                    {log.customer.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-[13px]">{log.customer}</p>
                                                    <p className="text-[11px] text-gray-500 font-medium">{log.phone}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-2">
                                                    <FaPhoneAlt className={log.type === 'Inbound' ? 'text-teal-500' : 'text-indigo-500'} size={10} />
                                                    <span className="font-bold text-gray-800 text-xs">{log.type}</span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${context.color}`}>
                                                    {context.icon} {context.label}
                                                </div>
                                                <span className="text-[11px] text-gray-500">{log.purpose}</span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${log.sentiment === 'Positive' ? 'bg-green-500' : log.sentiment === 'Negative' ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                                                    <span className="font-bold text-gray-700 text-xs">{log.sentiment}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] font-black text-[#2A45C2]">
                                                    <span>Score</span>
                                                    <span>{log.score}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                                                    <div className="bg-[#2A45C2] h-full rounded-full" style={{ width: `${log.score}%` }}></div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <Badge className={getStatusColor(log.outcome)}>{log.outcome}</Badge>
                                        </td>

                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleQuickPlay(log.customer)}
                                                    className="text-gray-500 hover:text-[#2A45C2] border-gray-200 hover:bg-blue-50 px-2 h-auto"
                                                    title="Quick Play Audio"
                                                >
                                                    <FaPlayCircle size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setActiveCallDetail(log)}
                                                    className="bg-[#2A45C2] hover:bg-[#1f3391] text-white text-[11px] font-bold px-4 py-1.5 h-auto shadow-sm"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">
                                        No call logs found matching your criteria.
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

export default AIVoiceAgentCallLogs;