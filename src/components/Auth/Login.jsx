import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import logo from '../../assets/logo.png';
import { communication } from '../../service/communication';
import { useAuth } from '../../contexts/AuthContext'

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const response = await communication.loginUser(formData.email, formData.password)
            if (response?.data?.status) {
                login(response?.data)
                // onLogin(true)
            } else {
                setError('Invalid email or password');
            }
            // Simulate API call - replace with actual authentication
            // await new Promise(resolve => setTimeout(resolve, 1500));

            // // For demo purposes - replace with actual authentication logic
            // if (formData.email === 'admin@chromatics.com' && formData.password === 'admin123') {
            //     localStorage.setItem('adminToken', 'demo-token');
            //     localStorage.setItem('adminEmail', formData.email);
            //     onLogin(true);
            // } else {
            //     setError('Invalid email or password');
            // }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!resetEmail) {
            setError('Please enter your email address');
            setLoading(false);
            return;
        }

        // Simulate reset password API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResetSent(true);
        setLoading(false);
    };

    if (showResetForm) {
        return (
            <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <img
                            src={logo}
                            alt="Quotation"
                            className="h-16 object-contain"
                        />
                    </div>

                    {/* Reset Password Form */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Reset Password
                        </h2>
                        <p className="text-gray-600">
                            {resetSent
                                ? 'Check your email for reset instructions'
                                : 'Enter your email to receive reset instructions'
                            }
                        </p>
                    </div>

                    {!resetSent ? (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <PrimaryButton
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Instructions'}
                            </PrimaryButton>

                            <button
                                type="button"
                                onClick={() => setShowResetForm(false)}
                                className="w-full text-center text-green-600 hover:text-green-700 font-medium transition duration-200"
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                                Reset instructions sent to {resetEmail}
                            </div>
                            <button
                                onClick={() => {
                                    setShowResetForm(false);
                                    setResetSent(false);
                                    setResetEmail('');
                                }}
                                className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition duration-200 font-medium"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src={logo}
                        alt="Chromatics"
                        className="h-16 object-contain"
                    />
                </div>

                {/* Login Form */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Login
                    </h1>
                    <p className="text-gray-600">
                        Sign in to your Quotation-App admin account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowResetForm(true)}
                            className="text-sm text-green-600 hover:text-green-700 font-medium transition duration-200"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Button */}
                    <PrimaryButton
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        icon={loading ? null : ArrowRight}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Signing in...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </PrimaryButton>

                    {/* Demo Credentials */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
                        <p className="text-xs text-blue-700">Email: admin@gmail.com</p>
                        <p className="text-xs text-blue-700">Password: admin@123</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
