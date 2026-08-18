import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import Button from '../../ui/Button';

const UserEditProfilePopup = ({ isOpen, onClose, profileData, onSave }) => {
    // Split the existing single name into first and last name for the form
    const splitName = (fullName) => {
        if (!fullName) return { first: '', last: '' };
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return { first: parts[0], last: '' };
        return { first: parts[0], last: parts.slice(1).join(' ') };
    };

    const initialName = splitName(profileData?.name);

    const [formData, setFormData] = useState({
        firstName: initialName.first,
        lastName: initialName.last,
        pronouns: '',
        headline: '',
        position: '',
        industry: '',
        school: '',
        country: '',
        city: '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
        phoneType: 'Mobile',
        address: '',
        birthday: '',
        websiteUrl: ''
    });

    useEffect(() => {
        if (isOpen && profileData) {
            const names = splitName(profileData.name);
            setFormData({
                firstName: names.first || '',
                lastName: names.last || '',
                email: profileData.email || '',
                phone: profileData.phone || '',
                pronouns: profileData.pronouns || '',
                headline: profileData.headline || '',
                position: profileData.position || '',
                industry: profileData.industry || '',
                school: profileData.school || '',
                country: profileData.country || '',
                city: profileData.city || '',
                phoneType: profileData.phoneType || 'Mobile',
                address: profileData.address || '',
                birthday: profileData.birthday || '',
                websiteUrl: profileData.websiteUrl || profileData.profileUrl || ''
            });
        }
    }, [isOpen, profileData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const combinedName = `${formData.firstName} ${formData.lastName}`.trim();

        onSave({
            ...profileData,
            name: combinedName,
            email: formData.email,
            phone: formData.phone,
            pronouns: formData.pronouns,
            headline: formData.headline,
            position: formData.position,
            industry: formData.industry,
            school: formData.school,
            country: formData.country,
            city: formData.city,
            phoneType: formData.phoneType,
            address: formData.address,
            birthday: formData.birthday,
            websiteUrl: formData.websiteUrl,
            profileUrl: formData.websiteUrl // Keep synced
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#E7E9F7] bg-gradient-to-r from-[#141B3C] via-[#2A45C2] to-[#5B4FE0] text-white shrink-0">
                    <h2 className="text-xl font-black">Edit Profile Intro</h2>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors">
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="px-5 py-2 bg-blue-50 border-b border-[#E7E9F7] shrink-0">
                    <p className="text-xs text-[#2A45C2] font-bold">* Indicates required fields</p>
                </div>

                {/* Scrollable Form Body */}
                <form id="profile-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8 bg-gray-50/50">

                    <section className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-extrabold text-[#2A45C2] border-b border-gray-100 pb-2">Basic info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">First name*</label>
                                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Last name*</label>
                                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Pronouns</label>
                            <select name="pronouns" value={formData.pronouns} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm bg-white">
                                <option value="">Please select</option>
                                <option value="He/Him">He/Him</option>
                                <option value="She/Her">She/Her</option>
                                <option value="They/Them">They/Them</option>
                                <option value="Other">Custom/Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Headline*</label>
                            <textarea required rows="2" name="headline" value={formData.headline} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm resize-none" placeholder="e.g. Senior Frontend Developer at TechCorp"></textarea>
                        </div>
                    </section>

                    <section className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-extrabold text-[#2A45C2] border-b border-gray-100 pb-2">Current position</h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Position*</label>
                            <input required type="text" name="position" value={formData.position} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm mb-2" />
                            <button type="button" className="text-sm font-bold text-[#2A45C2] hover:text-[#1a2b7a] flex items-center gap-1.5 transition-colors">
                                <FaPlus size={12} /> Add new position
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Industry*</label>
                            <input required type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" placeholder="e.g. Information Technology & Services" />
                        </div>
                    </section>

                    <section className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-extrabold text-[#2A45C2] border-b border-gray-100 pb-2">Education</h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">School*</label>
                            <input required type="text" name="school" value={formData.school} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" placeholder="e.g. Boston University" />
                        </div>
                    </section>

                    <section className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-extrabold text-[#2A45C2] border-b border-gray-100 pb-2">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Country/Region*</label>
                                <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-extrabold text-[#2A45C2] border-b border-gray-100 pb-2">Contact info</h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone type</label>
                                <select name="phoneType" value={formData.phoneType} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm bg-white">
                                    <option value="Mobile">Mobile</option>
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Address</label>
                            <textarea rows="2" name="address" value={formData.address} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm resize-none"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Birthday</label>
                            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" />
                        </div>
                    </section>

                    <section className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-extrabold text-[#2A45C2] border-b border-gray-100 pb-2">Portfolio</h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Portfolio Link</label>
                            <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2A45C2]/30 focus:border-[#2A45C2] outline-none transition-all text-sm" placeholder="https://yourportfolio.com" />
                        </div>
                    </section>
                </form>

                <div className="p-4 border-t border-[#E7E9F7] bg-white flex justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={onClose} className="rounded-xl font-bold bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
                        Cancel
                    </Button>
                    <Button type="submit" form="profile-edit-form" className="rounded-xl font-bold bg-[#2A45C2] text-white hover:bg-[#1a2b7a]">
                        Save Profile
                    </Button>
                </div>

            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A45C2; }
            `}</style>
        </div>
    );
};

export default UserEditProfilePopup;