import React, { useState } from 'react';
import { FaCheck, FaSignOutAlt } from 'react-icons/fa';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Badge from '../../ui/Badge';

const UserProfileCom = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'Ranjithram878',
        email: 'ranjithram878@gmail.com',
        phone: '+971 50 123 4567'
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-8">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#2A45C2] text-white rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-md">
                    {profile.name.charAt(0).toUpperCase()}
                </div>

                {!isEditing ? (
                    <>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{profile.name}</h2>
                        <p className="text-gray-500 mb-1">{profile.email}</p>
                        <p className="text-gray-400 mb-4">{profile.phone}</p>
                        <Badge variant="success" className="px-4 py-1.5 text-sm gap-2">
                            <FaCheck /> Profile Active
                        </Badge>
                    </>
                ) : (
                    <div className="w-full max-w-sm space-y-4 text-left mt-4">
                        <Input
                            label="Full Name"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                        />
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={profile.email}
                            onChange={handleChange}
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                        />
                        <div className="flex gap-3 pt-2">
                            <Button className="flex-1" onClick={handleSave}>Save Changes</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-1">0</h3>
                    <p className="text-gray-500 font-medium">Applied</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-1">0</h3>
                    <p className="text-gray-500 font-medium">Courses</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-1">0</h3>
                    <p className="text-gray-500 font-medium">Saved</p>
                </div>
            </div>

            {!isEditing && (
                <div className="space-y-4 pt-4">
                    <Button
                        className="w-full py-3.5 text-lg"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </Button>
                    <Button
                        variant=""
                        className="w-full py-3.5 text-lg bg-transparent text-red-500 border border-red-200 hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                        <FaSignOutAlt /> Log out
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserProfileCom;