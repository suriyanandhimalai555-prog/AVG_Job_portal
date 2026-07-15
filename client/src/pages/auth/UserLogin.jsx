import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import Button from '../../components/ui/Button'; 
import Input from '../../components/ui/Input'; 

const UserLogin = () => {
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

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setErrorMsg('');
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Store the JWT token securely in localStorage
                localStorage.setItem('token', data.token);
                // Redirect to the protected dashboard
                navigate('/user-dashboard');
            } else {
                setErrorMsg(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg('Server error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 py-6 md:py-12 font-sans overflow-y-auto">
            <div className="w-full max-w-md space-y-6 flex flex-col items-center">

                <div className="flex flex-col items-center text-center">
                    <img
                        src="/logo.jpg"
                        alt="Agila Vetri Logo"
                        className="h-16 md:h-20 w-auto object-contain mb-2"
                    />
                    <h1 className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-wider uppercase">AGILA VETRI</h1>
                    <p className="text-[10px] md:text-xs font-bold text-[#2A45C2] tracking-widest mt-0.5 uppercase">BUSINESS ECOSYSTEM</p>
                </div>

                <div className="w-full text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Welcome back</h2>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <Input
                        label="Email" 
                        name="email" 
                        type="email" 
                        placeholder="ramesh@example.com" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="text-gray-700" 
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
                                placeholder="........" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:border-[#2A45C2] focus:ring-2 focus:ring-[#2A45C2]/20 transition-all text-gray-700 pr-12" 
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

                    {errorMsg && (
                        <div className="text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-lg text-center">
                            {errorMsg}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 text-base bg-[#2A45C2] hover:bg-blue-800 rounded-xl font-bold text-white mt-4 disabled:opacity-70"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="text-center text-sm text-gray-500 pt-1">
                    New to Agila Vetri?{' '}
                    <Link to="/user-register" className="text-[#2A45C2] font-bold hover:underline">
                        Register
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default UserLogin;