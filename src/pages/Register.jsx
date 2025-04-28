import React, { useState } from 'react';
import { GenericRepo } from "../repo/GenericRepo.js";
import { Api } from "../utils/Api.js";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const repo = new GenericRepo();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        repo.store(
            `${Api.REGISTER}`,
            formData,
            (data) => {
                console.log('Registration response:', data);
                toast.success(data.message);
                setUserId(data.userId);
                setShowOtpForm(true);
                setIsLoading(false);
            },
            (error) => {
                toast.error(error);
                console.log("error", error);
                setIsLoading(false);
            }
        );
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        repo.store(
            `${Api.VERIFY_OTP}`,
            { userId, otp },
            (data) => {
                console.log('OTP verification response:', data);
                toast.success(data.message);
                // Store token in localStorage or wherever you manage auth state
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsLoading(false);
                navigate("/login");
            },
            (error) => {
                toast.error(error);
                console.log("error", error);
                setIsLoading(false);
            }
        );
    };

    const handleResendOtp = () => {
        if (!userId) return;
        setIsLoading(true);

        repo.store(
            `${Api.RESEND_OTP}`,
            { userId },
            (data) => {
                toast.success(data.message);
                setIsLoading(false);
            },
            (error) => {
                toast.error(error);
                console.log("error", error);
                setIsLoading(false);
            }
        );
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                {!showOtpForm ? (
                    <>
                        <h2 className="text-3xl font-bold primary-color text-center mb-6">Register</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-primary mb-2">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-primary mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="password" className="block text-primary mb-2">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Register'}
                            </button>
                        </form>
                        <p className="mt-4 text-[16px] font-[500]">Already have an account? <a className="text-blue-400 cursor-pointer" href="/login">Sign in</a></p>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold primary-color text-center mb-6">Verify Email</h2>
                        <p className="text-gray-600 text-center mb-6">
                            We've sent a verification code to your email address. Please enter it below to complete registration.
                        </p>
                        <form onSubmit={handleOtpSubmit}>
                            <div className="mb-6">
                                <label htmlFor="otp" className="block text-primary mb-2">Verification Code</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full btn btn-primary mb-4"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </form>
                        <div className="text-center">
                            <button
                                onClick={handleResendOtp}
                                className="text-blue-500 hover:underline focus:outline-none"
                                disabled={isLoading}
                            >
                                Didn't receive code? Resend
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Register;