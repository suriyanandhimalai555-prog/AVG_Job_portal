import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa'; 
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

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setErrorMsg(''); 
        setIsLoading(true); 

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 
            
            // SECURITY FIX: Changed endpoint from /login to /admin-login
            const response = await fetch(`${apiUrl}/api/auth/admin-login`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(formData), 
            });

            const data = await response.json(); 

            if (response.ok) {
                // Store the admin token securely in localStorage[cite: 21]
                localStorage.setItem('adminToken', data.token); 
                // Redirect to the protected admin dashboard[cite: 21]
                navigate('/admin-dashboard'); 
            } else {
                setErrorMsg(data.error || 'Invalid admin credentials.'); 
            }
        } catch (error) {
            console.error('Admin Login error:', error); 
            setErrorMsg('System error. Please try again later.'); 
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 md:py-12 font-sans">
            <div className="w-full max-w-md space-y-6 flex flex-col items-center bg-white p-8 rounded-md shadow-sm border border-gray-200">

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#2A45C2] text-white rounded-md flex items-center justify-center mb-3">
                        <FaShieldAlt size={32} />
                    </div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight">Admin Portal</h1>
                    <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4 mt-4">
                    <Input
                        label="Admin Email" 
                        name="email" 
                        type="email" 
                        placeholder="admin@agilavetri.com" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="text-gray-700 rounded-md" 
                        required 
                    />

                    <div className="flex flex-col w-full relative">
                        <label className="mb-1.5 text-sm font-bold text-gray-700">
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
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-[#2A45C2] focus:ring-1 focus:ring-[#2A45C2] transition-all text-gray-700 pr-12" 
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
                        <div className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-md text-center border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    <Button
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full py-3.5 text-base bg-[#0F172A] hover:bg-gray-800 rounded-md font-bold text-white mt-4 disabled:opacity-70 transition-colors" 
                    >
                        {isLoading ? 'Authenticating...' : 'Secure Login'}
                    </Button>
                </form>

            </div>
        </div>
    );
};

export default AdminLogin; 