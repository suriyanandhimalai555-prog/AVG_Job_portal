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
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 rounded-[32px] bg-[#F5F6FC] min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#0B0F19] tracking-tight">Academy Curriculum</h2>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Manage and monitor course catalogs</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:max-w-md">
                    <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#4353FF]" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search program title or category..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-0 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#4353FF]/20 text-sm font-medium text-gray-700 transition-shadow"
                    />
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2.5 rounded-2xl bg-[#0B0F19] text-white px-6 py-3.5 border-0 hover:bg-gray-800 hover:-translate-y-0.5 transition-all w-full sm:w-auto text-sm font-bold shadow-lg"
                >
                    <FaPlus size={14} /> Add New Course
                </Button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                        <thead className="bg-[#F8F9FA] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-3xl">Course Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor & Program</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing Matrix</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Matrix</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right rounded-tr-3xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 font-bold animate-pulse">
                                        Assembling active curriculum...
                                    </td>
                                </tr>
                            ) : filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-[#F8F9FE] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {course.thumbnail_url ? (
                                                    <img src={course.thumbnail_url} alt="thumbnail" className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4353FF] to-[#8B5CF6] flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                                                        {course.title.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-[200px]">
                                                    <p className="font-black text-[#0B0F19] text-base flex items-center gap-2 group-hover:text-[#4353FF] transition-colors">
                                                        {course.title}
                                                        {course.is_featured && <FaStar className="text-yellow-400" title="Featured" size={14} />}
                                                        {course.has_certificate && <FaCertificate className="text-[#4353FF]" title="Accredited Certification" size={14} />}
                                                    </p>
                                                    <div className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider flex items-center gap-2">
                                                        <span className="text-[#4353FF]">{course.category}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span>{course.course_level}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs space-y-1.5 text-gray-500 min-w-[200px]">
                                            <div className="font-bold text-[#0B0F19]">{course.instructor_name || 'TBD'}</div>
                                            <div className="flex items-center gap-2 font-medium text-gray-500"><FaBookOpen size={10} className="text-gray-400" /> {course.lessons_count} lessons ({course.duration || 'N/A'})</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {course.discount_price ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-black text-[#0B0F19] text-sm">{course.discount_price}</span>
                                                    <span className="line-through text-[11px] text-gray-400 font-bold">{course.price}</span>
                                                </div>
                                            ) : (
                                                <span className="font-black text-[#0B0F19] text-sm">{course.price}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${course.status === 'Active' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                                                    'border-gray-200 bg-gray-50 text-gray-500'
                                                }`}>
                                                {course.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenEdit(course)} className="w-9 h-9 bg-white border border-gray-100 text-[#0B0F19] rounded-xl flex items-center justify-center hover:bg-[#4353FF] hover:text-white hover:border-[#4353FF] transition-all shadow-sm" title="Modify Program Parameters">
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(course.id)} className="w-9 h-9 bg-white border border-gray-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm" title="Destroy Asset Index">
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-[#F8F9FE] rounded-2xl flex items-center justify-center text-[#4353FF] mb-4">
                                                <FaBookOpen size={24} />
                                            </div>
                                            <p className="text-base font-black text-[#0B0F19]">No courses found</p>
                                            <p className="text-sm font-medium text-gray-500 mt-1">Adjust your search or deploy a new curriculum entry.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-[#0B101E]/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={handleClosePanel}
                ></div>
            )}

            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col rounded-l-[32px] overflow-hidden ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white shrink-0 z-10">
                    <div>
                        <h3 className="text-2xl font-black text-[#0B0F19] tracking-tight">
                            {editingId ? 'Modify Active Course' : 'Add New Curriculum Entry'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-widest">Update Academy Database</p>
                    </div>
                    <button
                        onClick={handleClosePanel}
                        className="w-10 h-10 bg-[#F8F9FA] hover:bg-gray-100 text-[#0B0F19] rounded-full flex items-center justify-center transition-all shadow-sm"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white relative">
                    <form id="courseForm" onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex gap-6 p-5 bg-[#F8F9FE] rounded-2xl border border-blue-50/50">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="peer sr-only" />
                                    <div className="w-5 h-5 bg-white border-2 border-gray-200 rounded-md peer-checked:bg-[#4353FF] peer-checked:border-[#4353FF] transition-colors"></div>
                                    <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span className="text-sm font-bold text-[#0B0F19] flex items-center gap-2 group-hover:text-[#4353FF] transition-colors"><FaStar className="text-yellow-400" /> Featured Program</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" name="has_certificate" checked={formData.has_certificate} onChange={handleChange} className="peer sr-only" />
                                    <div className="w-5 h-5 bg-white border-2 border-gray-200 rounded-md peer-checked:bg-[#4353FF] peer-checked:border-[#4353FF] transition-colors"></div>
                                    <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span className="text-sm font-bold text-[#0B0F19] flex items-center gap-2 group-hover:text-[#4353FF] transition-colors"><FaCertificate className="text-[#4353FF]" /> Verified Certification Included</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Title *</label>
                                <input name="title" type="text" placeholder="Digital Marketing Pro" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" required />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category *</label>
                                <input name="category" type="text" placeholder="Marketing" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Price Container *</label>
                                <input name="price" type="text" placeholder="AED 299" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" required />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount Price Container</label>
                                <input name="discount_price" type="text" placeholder="AED 199" value={formData.discount_price} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Thumbnail Graphic Address</label>
                            <input name="thumbnail_url" type="url" placeholder="https://domain.com/graphics/image.jpg" value={formData.thumbnail_url} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                        </div>

                        <div className="flex flex-col w-full relative">
                            <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Comprehensive Description</label>
                            <textarea name="description" rows="4" placeholder="Provide strategic details outlining course learning paths..." value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] resize-y"></textarea>
                        </div>

                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <h4 className="text-sm font-black text-[#0B0F19] mb-5">Instructor & Program Parameters</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor Name</label>
                                <input name="instructor_name" type="text" placeholder="Dr. Sarah Jenkins" value={formData.instructor_name} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Estimated Duration</label>
                                <input name="duration" type="text" placeholder="14 Hours or 4 Weeks" value={formData.duration} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Level</label>
                                <select name="course_level" value={formData.course_level} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] appearance-none">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Instruction Language</label>
                                <input name="language" type="text" placeholder="English" value={formData.language} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lessons Count</label>
                                <input name="lessons_count" type="number" min="0" value={formData.lessons_count} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <h4 className="text-sm font-black text-[#0B0F19] mb-5 flex items-center gap-2"><FaVideo className="text-[#4353FF]" /> Previews & Calendars</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Preview Video URL</label>
                                <input name="preview_video_url" type="url" placeholder="https://youtube.com/embed/..." value={formData.preview_video_url} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FaCalendarAlt /> Cohort Start Date</label>
                                <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19]" />
                            </div>
                        </div>

                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <div className="flex flex-col w-full relative">
                                <label className="mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Deployment Status *</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#4353FF] transition-all text-sm font-bold text-[#0B0F19] appearance-none" required>
                                    <option value="Active">Active</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-end gap-4 shrink-0 z-10">
                    <Button
                        variant="outline"
                        onClick={handleClosePanel}
                        type="button"
                        className="rounded-xl px-6 py-3.5 bg-white border-2 border-gray-200 text-[#0B0F19] hover:bg-gray-50 text-sm font-black transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="courseForm"
                        className="rounded-xl px-6 py-3.5 bg-[#0B0F19] text-white border-0 hover:bg-gray-800 text-sm font-black shadow-lg transition-all"
                    >
                        {editingId ? 'Save Changes' : 'Publish Entry'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminAcademyCom;