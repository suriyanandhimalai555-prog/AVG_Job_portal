import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast'; // 👈 Imported toast and Toaster
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';

const AdminAcademyCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch real data on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/courses`);
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to fetch courses.');
        } finally {
            setIsLoading(false);
        }
    };

    // Slide-in Panel State
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        status: 'Active'
    });

    // Form Handlers
    const handleOpenAdd = () => {
        setFormData({ title: '', category: '', price: '', status: 'Active' });
        setEditingId(null);
        setIsPanelOpen(true);
    };

    const handleOpenEdit = (course) => {
        setFormData({ title: course.title, category: course.category, price: course.price, status: course.status });
        setEditingId(course.id);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingId ? 'Updating course...' : 'Adding new course...');

        try {
            if (editingId) {
                // Update existing course via API
                const res = await fetch(`${apiUrl}/api/courses/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    const updatedCourse = await res.json();
                    setCourses(courses.map(c => c.id === editingId ? updatedCourse : c));
                    toast.success('Course updated successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to update');
                }
            } else {
                // Add new course via API
                const res = await fetch(`${apiUrl}/api/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    const newCourse = await res.json();
                    setCourses([newCourse, ...courses]);
                    toast.success('Course added successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to add');
                }
            }
            setIsPanelOpen(false);
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error(editingId ? 'Failed to update course.' : 'Failed to add course.', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            const loadingToast = toast.loading('Deleting course...');
            try {
                const res = await fetch(`${apiUrl}/api/courses/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    setCourses(courses.filter(c => c.id !== id));
                    toast.success('Course deleted successfully!', { id: loadingToast });
                } else {
                    throw new Error('Failed to delete');
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                toast.error('Failed to delete course.', { id: loadingToast });
            }
        }
    };

    // Search filter logic for courses
    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 relative">

            {/* 👈 Added Toaster Component here */}
            <Toaster position="top-right" reverseOrder={false} />

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
                <Button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 rounded-md">
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Loading courses...
                                    </td>
                                </tr>
                            ) : filteredCourses.length > 0 ? (
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
                                            <button
                                                onClick={() => handleOpenEdit(course)}
                                                className="text-gray-400 hover:text-[#2A45C2] transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
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
            </div>

            {/* Slide-in Overlay */}
            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={handleClosePanel}
                ></div>
            )}

            {/* Right-to-Left Slide-in Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {editingId ? 'Edit Course' : 'Add New Course'}
                    </h3>
                    <button
                        onClick={handleClosePanel}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Panel Body (Form) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="courseForm" onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Course Title"
                            name="title"
                            type="text"
                            placeholder="e.g. Digital Marketing Master Course"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Category"
                            name="category"
                            type="text"
                            placeholder="e.g. Marketing"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Price"
                            name="price"
                            type="text"
                            placeholder="e.g. AED 299"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-sm font-bold text-gray-700">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-1 focus:ring-[#2A45C2] transition-all text-gray-700"
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* Panel Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClosePanel}
                        className="rounded-md px-6 bg-white"
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="courseForm"
                        className="rounded-md px-6"
                    >
                        {editingId ? 'Save Changes' : 'Add Course'}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default AdminAcademyCom;