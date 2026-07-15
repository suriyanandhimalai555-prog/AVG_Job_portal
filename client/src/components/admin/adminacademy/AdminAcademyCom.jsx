import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const AdminAcademyCom = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy data representing the academy courses
    const dummyCourses = [
        { id: 1, title: 'Digital Marketing Master Course', category: 'Marketing', price: 'AED 299', status: 'Active' },
        { id: 2, title: 'Business Growth Strategies', category: 'Business', price: 'AED 249', status: 'Active' },
        { id: 3, title: 'Web Development Bootcamp', category: 'IT & Software', price: 'AED 399', status: 'Draft' },
        { id: 4, title: 'Advanced Excel for Finance', category: 'Finance', price: 'AED 199', status: 'Active' },
    ];

    // Search filter logic for courses
    const filteredCourses = dummyCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search courses..." 
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm text-gray-700"
                    />
                </div>
                <Button className="flex items-center justify-center gap-2 rounded-md">
                    <FaPlus size={12} /> Add New Course
                </Button>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Course Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{course.title}</td>
                                        <td className="px-6 py-4">{course.category}</td>
                                        <td className="px-6 py-4">{course.price}</td>
                                        <td className="px-6 py-4">
                                            <Badge 
                                                variant={course.status === 'Active' ? 'success' : 'default'} 
                                                className="rounded-md"
                                            >
                                                {course.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-3">
                                            <button className="text-gray-400 hover:text-[#2A45C2] transition-colors" title="Edit">
                                                <FaEdit size={16} />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                                <FaTrash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No courses found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing {filteredCourses.length > 0 ? 1 : 0} to {filteredCourses.length} of {dummyCourses.length} entries</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1 bg-[#2A45C2] text-white border border-[#2A45C2] rounded-md shadow-sm">1</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default AdminAcademyCom;