import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const AdminJobsCom = () => {
    const dummyJobs = [
        { id: 1, title: 'Marketing Executive', company: 'ABC Marketing', type: 'Full Time', status: 'Active' },
        { id: 2, title: 'Accountant', company: 'Finance Hub', type: 'Full Time', status: 'Active' },
        { id: 3, title: 'Freelance Designer', company: 'Creative Co', type: 'Remote', status: 'Draft' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm text-gray-700"
                    />
                </div>
                <Button className="flex items-center gap-2 rounded-md">
                    <FaPlus size={12} /> Add New Job
                </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {dummyJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{job.title}</td>
                                    <td className="px-6 py-4">{job.company}</td>
                                    <td className="px-6 py-4">{job.type}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={job.status === 'Active' ? 'success' : 'default'} className="rounded-md">
                                            {job.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 flex justify-end gap-3">
                                        <button className="text-gray-400 hover:text-[#2A45C2] transition-colors">
                                            <FaEdit size={16} />
                                        </button>
                                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                                            <FaTrash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing 1 to 3 of 3 entries</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-100">Prev</button>
                        <button className="px-3 py-1 bg-[#2A45C2] text-white border border-[#2A45C2] rounded-md">1</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-100">Next</button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminJobsCom;