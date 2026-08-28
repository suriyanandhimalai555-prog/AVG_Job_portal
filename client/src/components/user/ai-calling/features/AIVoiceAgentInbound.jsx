import React, { useState, useEffect } from 'react';
import {
    FaPhoneVolume, FaPhone, FaSearch, FaFilter,
    FaRobot, FaHeadset, FaChartLine, FaCheckCircle,
    FaExclamationCircle, FaClock, FaCircle, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';

const AIVoiceAgentInbound = ({ getStatusColor, setActiveCallDetail }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [intentFilter, setIntentFilter] = useState('All');

    const [isLoading, setIsLoading] = useState(true);
    const [inboundNumbers, setInboundNumbers] = useState([]);
    const [inboundLogs, setInboundLogs] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // --- LIVE CALL WEBSOCKET STATE ---
    const [liveCall, setLiveCall] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken') || '';

    const fetchInboundData = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiUrl}/api/ai-calling/inbound`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInboundNumbers(data.numbers || []);
                setInboundLogs(data.inboundLogs || []);
            }
        } catch (error) {
            console.error('Failed to fetch inbound data:', error);
            toast.error('Failed to load live inbound logs.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInboundData();

        const socket = io(apiUrl, {
            auth: { token: getAuthToken() }
        });

        socket.on('incoming_live_call', (data) => {
            setLiveCall({
                customerPhone: data.customerPhone,
                aiAgent: data.agentName,
                status: data.status
            });
            toast.success(`Incoming live call to ${data.agentName} from ${data.customerPhone}!`);
        });

        socket.on('live_call_status_update', (data) => {
            setLiveCall(prev => prev ? { ...prev, status: data.status } : null);
        });

        socket.on('live_call_completed', (newCallLog) => {
            setLiveCall(null);
            setIsSimulating(false);
            setInboundLogs(prevLogs => [newCallLog, ...prevLogs]);
            toast.success("AI finished call. Log saved.");
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleSimulateIncomingCall = async () => {
        setIsSimulating(true);
        toast.loading("AI Agent is intercepting simulated call...");

        try {
            const token = getAuthToken();
            const res = await fetch(`${apiUrl}/api/ai-calling/inbound/simulate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Simulation failed");
        } catch (error) {
            toast.error("Failed to simulate call.");
            setIsSimulating(false);
        }
    };

    const totalInbound = inboundLogs.length;
    const resolvedByAI = inboundLogs.filter(c => c.status === 'Resolved' || c.status === 'Completed').length;
    const escalatedCalls = inboundLogs.filter(c => c.status === 'Escalated').length;
    const aiResolutionRate = totalInbound > 0 ? Math.round((resolvedByAI / totalInbound) * 100) : 0;

    const filteredLogs = inboundLogs.filter(log => {
        const matchesSearch = log.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.phone?.includes(searchTerm) ||
            log.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesIntent = intentFilter === 'All' || log.intent === intentFilter;
        return matchesSearch && matchesIntent;
    });

    const uniqueIntents = ['All', ...new Set(inboundLogs.map(log => log.intent))];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <FaSpinner className="animate-spin text-[#2A45C2] text-4xl mb-4" />
                <p className="text-gray-500 font-bold">Connecting to AI Servers...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1">Inbound AI Calling</h3>
                    <p className="text-sm text-gray-500 font-medium">Monitor incoming customer and candidate calls handled by AI.</p>
                </div>
                <Button
                    onClick={handleSimulateIncomingCall}
                    disabled={isSimulating || liveCall}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                >
                    {isSimulating ? <FaSpinner className="animate-spin" /> : <FaPhoneVolume />}
                    Simulate Incoming Call
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0"><FaPhone /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Inbound</p>
                        <p className="text-2xl font-black text-gray-900">{totalInbound}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0"><FaCheckCircle /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Resolved by AI</p>
                        <p className="text-2xl font-black text-gray-900">{resolvedByAI}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl shrink-0"><FaExclamationCircle /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Escalated</p>
                        <p className="text-2xl font-black text-gray-900">{escalatedCalls}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0"><FaChartLine /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">AI Success Rate</p>
                        <p className="text-2xl font-black text-gray-900">{aiResolutionRate}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#E7E9F7] rounded-2xl shadow-sm p-5">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FaRobot className="text-[#2A45C2]" /> Active AI Inbound Numbers</h4>
                    <div className="space-y-3">
                        {inboundNumbers.length > 0 ? inboundNumbers.map(num => (
                            <div key={num.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl gap-3 hover:border-[#2A45C2]/30 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-black text-gray-900 text-lg">{num.phone_number}</h5>
                                        <Badge className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5"><FaCircle className="inline mr-1 text-[8px] animate-pulse" /> {num.status}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">{num.purpose}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <FaHeadset className="text-[#2A45C2]" />
                                    <span className="text-sm font-bold text-gray-700">{num.agent_name}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm">No active inbound numbers registered.</p>
                        )}
                    </div>
                </div>

                <div className="bg-[#141B3C] border border-[#141B3C] rounded-2xl shadow-sm p-5 text-white relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2"><FaClock className="text-blue-400" /> Live Queue</h4>

                    <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                        {liveCall || isSimulating ? (
                            <>
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                                    <FaPhoneVolume className="text-green-400 animate-pulse" size={24} />
                                </div>
                                <p className="text-green-300 font-bold text-sm mb-1 animate-pulse">{liveCall?.status || 'Call in progress...'}</p>
                                <p className="text-white font-medium text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">
                                    {liveCall ? liveCall.customerPhone : '+1 555-SIM-CALL'}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-white/10">
                                    <FaPhoneVolume className="text-white opacity-50" size={24} />
                                </div>
                                <p className="text-blue-200 font-medium text-sm">No active calls right now.</p>
                                <p className="text-xs text-white/50 mt-1">AI agents are standing by.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#E7E9F7] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 bg-gray-50 border-b border-[#E7E9F7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h4 className="font-bold text-gray-900">Inbound Call Logs</h4>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Detailed history of all received calls</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search caller, ID, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm font-medium outline-none focus:border-[#2A45C2] transition-colors"
                            />
                        </div>
                        <div className="relative min-w-[140px]">
                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <select
                                value={intentFilter}
                                onChange={(e) => setIntentFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#2A45C2] appearance-none cursor-pointer"
                            >
                                {uniqueIntents.map(intent => (
                                    <option key={intent} value={intent}>{intent === 'All' ? 'All Intents' : intent}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-[#E7E9F7] text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Customer & Time</th>
                                <th className="p-4">Intent</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.length > 0 ? filteredLogs.map(call => (
                                <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <FaPhone size={12} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-[13px]">{call.customer}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">{call.phone} • {call.date} {call.time}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-[#2A45C2] bg-blue-50 px-2.5 py-1 rounded-md text-[11px] border border-blue-100">
                                            {call.intent}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium text-xs">{call.duration}</td>
                                    <td className="p-4">
                                        <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="outline" size="sm" onClick={() => setActiveCallDetail(call)} className="text-[11px] font-bold px-3 py-1.5 h-auto border-gray-200">
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                                        No inbound calls found.
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

export default AIVoiceAgentInbound;