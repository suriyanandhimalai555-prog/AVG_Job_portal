import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Input from '../../ui/Input';

const AdminAcademyCom = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            toast.error('Failed to fetch courses.');
        } finally {
            setIsLoading(false);
        }
    };

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        status: 'Active'
    });

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
                toast.error('Failed to delete course.', { id: loadingToast });
            }
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-4 p-4 rounded-2xl shadow-sm bg-[#EEF2FF]">

            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:max-w-sm">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A45C2]" size={14} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] text-sm text-gray-700"
                    />
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#2A45C2] text-white px-5 py-2.5 border-0 hover:opacity-90 w-full sm:w-auto text-sm font-bold shadow-sm"
                >
                    <FaPlus size={12} /> Add New Course
                </Button>
            </div>

            <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden p-2 md:p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#EBEBEB]">
                            <tr>
                                <th className="px-4 py-3">Course Title</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        Loading courses...
                                    </td>
                                </tr>
                            ) : filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-gray-900 text-sm">{course.title}</td>
                                        <td className="px-4 py-3 text-xs">{course.category}</td>
                                        <td className="px-4 py-3 text-xs font-medium">{course.price}</td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={course.status === 'Active' ? 'success' : 'default'}
                                                className="rounded bg-white border border-[#EBEBEB] text-[10px]"
                                            >
                                                {course.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 flex justify-end gap-3">
                                            <button
                                                onClick={() => handleOpenEdit(course)}
                                                className="text-[#2A45C2] hover:bg-blue-50 p-1.5 rounded"
                                                title="Edit"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                                                title="Delete"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        No courses found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={handleClosePanel}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[#EBEBEB] ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
                    <h3 className="text-lg font-extrabold text-gray-900">
                        {editingId ? 'Edit Course' : 'Add New Course'}
                    </h3>
                    <button
                        onClick={handleClosePanel}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-[#EBEBEB]"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <form id="courseForm" onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Course Title"
                            name="title"
                            type="text"
                            placeholder="e.g. Digital Marketing Master Course"
                            value={formData.title}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2.5"
                            required
                        />

                        <Input
                            label="Category"
                            name="category"
                            type="text"
                            placeholder="e.g. Marketing"
                            value={formData.category}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2.5"
                            required
                        />

                        <Input
                            label="Price"
                            name="price"
                            type="text"
                            placeholder="e.g. AED 299"
                            value={formData.price}
                            onChange={handleChange}
                            className="bg-white border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg text-sm py-2.5"
                            required
                        />

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 text-sm"
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-[#EBEBEB] bg-gray-50 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClosePanel}
                        className="rounded-lg px-5 py-2.5 bg-white border-[#EBEBEB] text-gray-700 hover:bg-gray-100 text-sm font-bold"
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="courseForm"
                        className="rounded-lg px-5 py-2.5 bg-[#2A45C2] text-white border-0 hover:opacity-90 text-sm font-bold"
                    >
                        {editingId ? 'Save Changes' : 'Add Course'}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default AdminAcademyCom;