import React, { useState } from 'react';
import {
    FaCalendarPlus, FaCheckCircle, FaSearch, FaFilter,
    FaCalendarCheck, FaClock, FaCalendarDay, FaRobot,
    FaBriefcase, FaGraduationCap, FaBuilding, FaGlobe,
    FaSyncAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';

const AIVoiceAgentAppointments = ({ appointments, getStatusColor, setIsBookApptModalOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    // --- KPI CALCULATIONS ---
    const todayAppointments = appointments.filter(a => a.date === '2026-08-26').length; // Mocking "today" based on your initial data
    const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;
    const pendingReminders = appointments.filter(a => a.reminder === 'Pending').length;
    const confirmationRate = appointments.length > 0 ? Math.round((confirmedCount / appointments.length) * 100) : 0;

    // --- FILTERING LOGIC ---
    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.phone.includes(searchTerm) ||
            apt.service.toLowerCase().includes(searchTerm.toLowerCase());

        // Simple mock classification for filtering
        let aptCategory = 'Other';
        if (apt.service.toLowerCase().includes('interview')) aptCategory = 'Interview';
        else if (apt.service.toLowerCase().includes('demo') || apt.service.toLowerCase().includes('consultation')) aptCategory = 'B2B';
        else if (apt.service.toLowerCase().includes('course') || apt.service.toLowerCase().includes('academy')) aptCategory = 'Academy';

        const matchesType = typeFilter === 'All' || aptCategory === typeFilter;
        return matchesSearch && matchesType;
    });

    // --- HELPERS ---
    const getServiceIcon = (service) => {
        const s = service.toLowerCase();
        if (s.includes('interview') || s.includes('screening')) return <FaBriefcase className="text-blue-500" />;
        if (s.includes('course') || s.includes('academy') || s.includes('training')) return <FaGraduationCap className="text-teal-500" />;
        if (s.includes('demo') || s.includes('consultation') || s.includes('enterprise')) return <FaBuilding className="text-indigo-500" />;
        return <FaGlobe className="text-gray-400" />;
    };

    const handleBulkReminders = () => {
        if (pendingReminders === 0) {
            toast.success("All reminders have already been sent!");
            return;
        }
        toast.loading(`AI is initiating confirmation calls for ${pendingReminders} pending appointments...`, { duration: 3000 });
        setTimeout(() => {
            toast.success("Bulk AI Reminder campaign started successfully!");
        }, 3000);
    };

    const handleAIReschedule = (customerName) => {
        toast.loading(`Deploying AI Agent to call ${customerName} for rescheduling...`, { duration: 2500 });
        setTimeout(() => {
            toast.success(`AI is currently negotiating a new time slot with ${customerName}.`);
        }, 2500);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Main Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1">Appointments & Reminders</h3>
                    <p className="text-sm text-gray-500 font-medium">Manage automated scheduling, confirmations, and reschedules via AI.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleBulkReminders}
                        disabled={pendingReminders === 0}
                        className="text-[#2A45C2] border-[#2A45C2] hover:bg-blue-50 flex items-center gap-2 shadow-sm"
                    >
                        <FaRobot /> Send Pending Reminders ({pendingReminders})
                    </Button>
                    <Button onClick={() => setIsBookApptModalOpen(true)} className="bg-[#141B3C] hover:bg-[#2A45C2] text-white flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5">
                        <FaCalendarPlus /> Book Appointment
                    </Button>
                </div>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0"><FaCalendarDay /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Agenda Today</p>
                        <p className="text-2xl font-black text-gray-900">{todayAppointments}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0"><FaCalendarCheck /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Confirmed</p>
                        <p className="text-2xl font-black text-gray-900">{confirmedCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0"><FaClock /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pending Reminder</p>
                        <p className="text-2xl font-black text-gray-900">{pendingReminders}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E7E9F7] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0"><FaCheckCircle /></div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Confirmation Rate</p>
                        <p className="text-2xl font-black text-gray-900">{confirmationRate}%</p>
                    </div>
                </div>
            </div>

            {/* Appointments Table Section */}
            <div className="bg-white border border-[#E7E9F7] rounded-2xl overflow-hidden shadow-sm">

                {/* Search and Filters Toolbar */}
                <div className="p-5 bg-gray-50 border-b border-[#E7E9F7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h4 className="font-bold text-gray-900">Upcoming Schedule</h4>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Monitor AI appointment handling and attendance</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search customer, phone, service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm font-medium outline-none focus:border-[#2A45C2] transition-colors"
                            />
                        </div>
                        <div className="relative min-w-[140px]">
                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#2A45C2] appearance-none cursor-pointer"
                            >
                                <option value="All">All Types</option>
                                <option value="Interview">Job Interviews</option>
                                <option value="Academy">Academy Demos</option>
                                <option value="B2B">B2B Consultations</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-[#E7E9F7] text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Customer Details</th>
                                <th className="p-4">Service / Context</th>
                                <th className="p-4">Date & Time</th>
                                <th className="p-4">Status & Source</th>
                                <th className="p-4 text-right">AI Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAppointments.length > 0 ? filteredAppointments.map(apt => (
                                <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Customer Info */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#141B3C] to-[#2A45C2] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                                                {apt.customer.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-[13px]">{apt.customer}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">{apt.phone}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Service / Context */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                                                {getServiceIcon(apt.service)}
                                            </div>
                                            <span className="font-bold text-gray-700 text-xs">{apt.service}</span>
                                        </div>
                                    </td>

                                    {/* Date & Time */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-gray-900 text-sm">{apt.date}</span>
                                            <span className="text-xs font-bold text-[#2A45C2]">{apt.time}</span>
                                        </div>
                                    </td>

                                    {/* Status & Booked By */}
                                    <td className="p-4">
                                        <div className="flex flex-col items-start gap-1.5">
                                            <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                                            <span className="text-[10px] text-gray-400 font-medium">Booked via: {apt.bookedBy}</span>
                                        </div>
                                    </td>

                                    {/* AI Actions */}
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {apt.reminder === 'Sent' ? (
                                                <Badge className="bg-green-50 text-green-700 border-green-200 h-[28px] px-3 flex items-center">
                                                    <FaCheckCircle className="inline mr-1.5" /> Reminder Sent
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        toast.success(`AI is calling ${apt.customer} to confirm...`);
                                                    }}
                                                    className="text-[11px] font-bold px-3 py-1.5 h-[28px] border-gray-200 text-[#2A45C2] hover:bg-blue-50"
                                                >
                                                    <FaRobot className="inline mr-1" /> Call to Confirm
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAIReschedule(apt.customer)}
                                                className="text-[11px] font-bold px-3 py-1.5 h-[28px] border-gray-200 text-amber-600 hover:bg-amber-50"
                                                title="Task AI to call and reschedule"
                                            >
                                                <FaSyncAlt />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                                        No appointments found matching your criteria.
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

export default AIVoiceAgentAppointments;