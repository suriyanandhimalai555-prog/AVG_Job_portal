import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaStar, FaCertificate, FaVideo, FaCalendarAlt, FaBookOpen } from 'react-icons/fa';
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

    // Expanded form state config
    const [formData, setFormData] = useState({
        title: '', category: '', price: '', status: 'Active',
        thumbnail_url: '', description: '', instructor_name: '', duration: '',
        course_level: 'Beginner', language: 'English', lessons_count: 0,
        has_certificate: false, is_featured: false, discount_price: '',
        preview_video_url: '', start_date: ''
    });

    const handleOpenAdd = () => {
        setFormData({
            title: '', category: '', price: '', status: 'Active',
            thumbnail_url: '', description: '', instructor_name: '', duration: '',
            course_level: 'Beginner', language: 'English', lessons_count: 0,
            has_certificate: false, is_featured: false, discount_price: '',
            preview_video_url: '', start_date: ''
        });
        setEditingId(null);
        setIsPanelOpen(true);
    };

    const handleOpenEdit = (course) => {
        // Format ISO Date string safely into standard YYYY-MM-DD format for target calendar input binds
        let formattedDate = '';
        if (course.start_date) {
            formattedDate = new Date(course.start_date).toISOString().split('T')[0];
        }

        setFormData({
            title: course.title, category: course.category, price: course.price, status: course.status,
            thumbnail_url: course.thumbnail_url || '', description: course.description || '',
            instructor_name: course.instructor_name || '', duration: course.duration || '',
            course_level: course.course_level || 'Beginner', language: course.language || 'English',
            lessons_count: course.lessons_count || 0, has_certificate: course.has_certificate || false,
            is_featured: course.is_featured || false, discount_price: course.discount_price || '',
            preview_video_url: course.preview_video_url || '', start_date: formattedDate
        });
        setEditingId(course.id);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingId ? 'Updating course content...' : 'Deploying new course...');

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
                    toast.success('Course content systematically synchronized!', { id: loadingToast });
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
                    toast.success('Course record initialization complete!', { id: loadingToast });
                } else {
                    throw new Error('Failed to add');
                }
            }
            setIsPanelOpen(false);
        } catch (error) {
            toast.error(editingId ? 'Target updates failed.' : 'Creation sequence interrupted.', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Confirm execution to delete this academy course instance permanent?')) {
            const loadingToast = toast.loading('Purging course indexes...');
            try {
                const res = await fetch(`${apiUrl}/api/courses/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    setCourses(courses.filter(c => c.id !== id));
                    toast.success('Course entry destroyed.', { id: loadingToast });
                } else {
                    throw new Error('Failed to delete');
                }
            } catch (error) {
                toast.error('Deletion operation aborted.', { id: loadingToast });
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
                        placeholder="Search program title or category..."
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
                                <th className="px-4 py-3">Course Identity</th>
                                <th className="px-4 py-3">Instructor & Program</th>
                                <th className="px-4 py-3">Pricing Matrix</th>
                                <th className="px-4 py-3">Status Matrix</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        Assembling active curriculum...
                                    </td>
                                </tr>
                            ) : filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {course.thumbnail_url ? (
                                                    <img src={course.thumbnail_url} alt="thumbnail" className="w-12 h-12 object-cover rounded-lg border border-[#EBEBEB]" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-[#EBEBEB] flex items-center justify-center text-gray-400 font-bold">
                                                        {course.title.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                                        {course.title}
                                                        {course.is_featured && <FaStar className="text-yellow-400" title="Featured" size={11} />}
                                                        {course.has_certificate && <FaCertificate className="text-blue-500" title="Accredited Certification" size={11} />}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[#2A45C2]">{course.category}</span>
                                                        <span>•</span>
                                                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded text-[10px] font-bold">{course.course_level}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs space-y-0.5 text-gray-500">
                                            <div className="font-bold text-gray-700">{course.instructor_name || 'TBD'}</div>
                                            <div className="flex items-center gap-1 text-[11px]"><FaBookOpen size={10} /> {course.lessons_count} lessons ({course.duration || 'N/A'})</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {course.discount_price ? (
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900">{course.discount_price}</span>
                                                    <span className="line-through text-[10px] text-gray-400 font-medium">{course.price}</span>
                                                </div>
                                            ) : (
                                                <span className="font-black text-gray-900">{course.price}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={course.status === 'Active' ? 'success' : 'default'}
                                                className="rounded bg-white border border-[#EBEBEB] text-[10px]"
                                            >
                                                {course.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 flex justify-end gap-3 mt-2">
                                            <button
                                                onClick={() => handleOpenEdit(course)}
                                                className="text-[#2A45C2] hover:bg-blue-50 p-1.5 rounded"
                                                title="Modify Program Parameters"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                                                title="Destroy Asset Index"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500 font-medium">
                                        No courses matches the current active query context filters.
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
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[#EBEBEB] ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB] bg-gray-50 shrink-0">
                    <h3 className="text-lg font-extrabold text-gray-900">
                        {editingId ? 'Modify Active Course Parameters' : 'Add New Curriculum Entry'}
                    </h3>
                    <button
                        onClick={handleClosePanel}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-[#EBEBEB]"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                    <form id="courseForm" onSubmit={handleSubmit} className="space-y-5">

                        {/* Highlights Config Row */}
                        <div className="flex gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-[#2A45C2] rounded focus:ring-[#2A45C2] bg-white border-gray-300" />
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><FaStar className="text-yellow-500" /> Featured Program</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer ml-4">
                                <input type="checkbox" name="has_certificate" checked={formData.has_certificate} onChange={handleChange} className="w-4 h-4 text-[#2A45C2] rounded focus:ring-[#2A45C2] bg-white border-gray-300" />
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><FaCertificate className="text-blue-500" /> Verified Certification Included</span>
                            </label>
                        </div>

                        {/* Basic Meta Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Course Title *" name="title" type="text" placeholder="Digital Marketing Pro" value={formData.title} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" required />
                            <Input label="Category *" name="category" type="text" placeholder="Marketing" value={formData.category} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Base Price Container *" name="price" type="text" placeholder="AED 299" value={formData.price} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" required />
                            <Input label="Discount Price Container" name="discount_price" type="text" placeholder="AED 199" value={formData.discount_price} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">Course Thumbnail Graphic Address</label>
                            <input name="thumbnail_url" type="url" placeholder="https://domain.com/graphics/image.jpg" value={formData.thumbnail_url} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 text-gray-700 text-sm" />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">Course Comprehensive Description</label>
                            <textarea name="description" rows="3" placeholder="Provide strategic details outlining course learning paths..." value={formData.description} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 text-gray-700 text-sm resize-y"></textarea>
                        </div>

                        {/* Instructor & Program Matrix Info */}
                        <h4 className="text-xs font-extrabold text-gray-900 border-b border-[#EBEBEB] pb-2 uppercase tracking-wider">Instructor & Program Parameters</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Instructor Name" name="instructor_name" type="text" placeholder="Dr. Sarah Jenkins" value={formData.instructor_name} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                            <Input label="Course Estimated Duration" name="duration" type="text" placeholder="14 Hours or 4 Weeks" value={formData.duration} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-1.5 text-xs font-bold text-gray-700">Course Level</label>
                                <select name="course_level" value={formData.course_level} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm text-gray-700 text-sm focus:outline-none focus:border-[#2A45C2]">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <Input label="Instruction Language" name="language" type="text" placeholder="English" value={formData.language} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                            <Input label="Lessons Count" name="lessons_count" type="number" min="0" value={formData.lessons_count} onChange={handleChange} className="bg-white border-[#EBEBEB] text-sm py-2" />
                        </div>

                        {/* Dynamic Previews & Start dates */}
                        <h4 className="text-xs font-extrabold text-gray-900 border-b border-[#EBEBEB] pb-2 uppercase tracking-wider"><FaVideo className="inline mr-1 mb-0.5" /> Previews & Calendars</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-1.5 text-xs font-bold text-gray-700">Course Preview Video URL</label>
                                <input name="preview_video_url" type="url" placeholder="https://youtube.com/embed/..." value={formData.preview_video_url} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm text-gray-700 text-sm focus:outline-none focus:border-[#2A45C2]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-1.5 text-xs font-bold text-gray-700 flex items-center gap-1"><FaCalendarAlt size={11} /> Cohort Start Date</label>
                                <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm text-gray-700 text-sm focus:outline-none focus:border-[#2A45C2]" />
                            </div>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-1.5 text-xs font-bold text-gray-700">Asset Deployment Status *</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-lg shadow-sm text-gray-700 text-sm focus:outline-none focus:border-[#2A45C2]" required>
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>

                    </form>
                </div>

                <div className="p-5 border-t border-[#EBEBEB] bg-gray-50 flex items-center justify-end gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handleClosePanel}
                        type="button"
                        className="rounded-lg px-5 py-2.5 bg-white border-[#EBEBEB] text-gray-700 hover:bg-gray-100 text-sm font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="courseForm"
                        className="rounded-lg px-5 py-2.5 bg-[#2A45C2] text-white border-0 hover:opacity-90 text-sm font-bold shadow-sm"
                    >
                        {editingId ? 'Save Changes' : 'Publish Entry'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminAcademyCom;