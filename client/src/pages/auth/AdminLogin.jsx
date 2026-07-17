import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setErrorMsg('Please enter a valid email address.');
            return false;
        }
        if (formData.password.trim().length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/auth/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                navigate('/admin-dashboard');
            } else {
                setErrorMsg(data.error || 'Invalid admin credentials.');
            }
        } catch (error) {
            setErrorMsg('System error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EBEBEB] px-4 py-6 font-sans">
            <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#EBEBEB] flex flex-col items-center space-y-5">

                <div className="flex flex-col items-center text-center">
                    <div className="h-14 w-14 bg-[#2A45C2] rounded-xl flex items-center justify-center p-2 mb-3 shadow-sm">
                        <img
                            src="/logo.jpg"
                            alt="Agila Vetri Logo"
                            className="h-full w-full object-contain rounded-md"
                        />
                    </div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-wider uppercase">Admin Portal</h1>
                    <p className="text-[10px] md:text-xs font-bold text-[#2A45C2] tracking-widest mt-1 uppercase bg-blue-50 px-3 py-1 rounded-full border border-[#EBEBEB]">
                        Authorized Personnel
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <Input
                        label="Admin Email"
                        name="email"
                        type="email"
                        placeholder="avgadmin@agilavetri.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="text-gray-700 bg-white border border-[#EBEBEB] focus:ring-[#2A45C2]/20 focus:border-[#2A45C2] rounded-lg"
                        required
                    />

                    <div className="flex flex-col w-full relative">
                        <label className="mb-1.5 text-xs font-bold text-gray-700">
                            Master Password
                        </label>
                        <div className="relative w-full">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white border border-[#EBEBEB] rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 pr-12 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#2A45C2] transition-colors focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg text-center border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 text-sm bg-[#2A45C2] hover:bg-blue-800 rounded-lg font-bold text-white mt-2 disabled:opacity-70 transition-all shadow-sm border-0"
                    >
                        {isLoading ? 'Authenticating...' : 'Secure Login'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;