import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // 👈 Imported useLocation
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const UserRegister = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '+971',
        password: '',
        referralCode: '', // 👈 Added referralCode to state
        agreeToTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const location = useLocation();

    // Auto-fill referral code from URL parameters on load
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const refCode = queryParams.get('ref');
        if (refCode) {
            setFormData(prev => ({ ...prev, referralCode: refCode }));
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const validateForm = () => {
        if (formData.fullName.trim().length < 2) {
            setErrorMsg('Please enter a valid full name.');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setErrorMsg('Please enter a valid email address.');
            return false;
        }
        if (formData.phone.trim().length < 7) {
            setErrorMsg('Please enter a valid phone number.');
            return false;
        }
        if (formData.password.trim().length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return false;
        }
        if (!formData.agreeToTerms) {
            setErrorMsg('You must agree to the Terms & Conditions.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    referralCode: formData.referralCode // 👈 Include referralCode in request
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg('Registration successful! You can now log in.');
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '+971',
                    password: '',
                    referralCode: '',
                    agreeToTerms: false
                });
            } else {
                setErrorMsg(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setErrorMsg('Server error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F8FF] px-4 py-6 font-sans overflow-y-auto">
            <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col items-center space-y-5 my-4">

                <div className="flex flex-col items-center text-center">
                    <img
                        src="/logo.jpg"
                        alt="Agila Vetri Logo"
                        className="h-14 w-auto object-contain mb-2"
                    />
                    <h1 className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-wider uppercase">AGILA VETRI</h1>
                    <p className="text-[10px] md:text-xs font-bold text-[#2B6CF0] tracking-widest mt-0.5 uppercase">BUSINESS ECOSYSTEM</p>
                </div>

                <div className="w-full text-center">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Create Account</h2>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-3.5">
                    <Input
                        label="Full Name"
                        name="fullName"
                        type="text"
                        placeholder="Ramesh Kumar"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="bg-gray-50 focus:bg-white"
                        required
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="ramesh@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-gray-50 focus:bg-white"
                        required
                    />

                    <Input
                        label="Phone Number"
                        name="phone"
                        type="text"
                        placeholder="+971"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-gray-50 focus:bg-white"
                        required
                    />

                    <div className="flex flex-col w-full relative">
                        <label className="mb-1.5 text-sm font-bold text-gray-700">
                            Password
                        </label>
                        <div className="relative w-full">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#2B6CF0] focus:ring-2 focus:ring-[#2B6CF0]/20 transition-all text-gray-700 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Input
                        label="Referral Code (Optional)"
                        name="referralCode"
                        type="text"
                        placeholder="e.g. AGILA1234"
                        value={formData.referralCode}
                        onChange={handleChange}
                        className="bg-gray-50 focus:bg-white"
                    />

                    <div className="flex items-center gap-3 pt-1">
                        <input
                            id="agreeToTerms"
                            name="agreeToTerms"
                            type="checkbox"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="w-5 h-5 text-[#2B6CF0] border-2 border-gray-300 rounded focus:ring-[#2B6CF0] accent-[#2B6CF0] cursor-pointer"
                        />
                        <label htmlFor="agreeToTerms" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                            I agree to{' '}
                            <Link to="/terms" className="text-[#2B6CF0] font-bold hover:underline">
                                Terms & Conditions
                            </Link>
                        </label>
                    </div>

                    {errorMsg && (
                        <div className="text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-lg text-center border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="text-sm font-semibold text-green-600 bg-green-50 p-3 rounded-lg text-center border border-green-100">
                            {successMsg}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 text-base bg-[linear-gradient(135deg,#2B6CF0_0%,#1E40AF_100%)] hover:shadow-lg rounded-xl font-bold text-white mt-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </Button>
                </form>

                <div className="text-center text-sm text-gray-500 pt-2">
                    Already have an account?{' '}
                    <Link to="/user-login" className="text-[#2B6CF0] font-bold hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserRegister;