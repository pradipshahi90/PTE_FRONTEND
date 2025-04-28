import React, { useState } from 'react';
import { Api } from "../utils/Api.js";
import toast from "react-hot-toast";
import { GenericRepo } from "../repo/GenericRepo.js";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const repo = new GenericRepo();

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        repo.store(
            `${Api.FORGOT_PASSWORD}`,
            { email },
            (data) => {
                toast.success(data.message);
                navigate('/login'); // Redirect to login after password reset link is sent
            },
            (error) => {
                toast.error(error);
                setIsSubmitting(false);
            }
        );
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold primary-color text-center mb-6">Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-primary mb-2">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <p className="mt-4 text-[16px] font-[500]">
                    Remember your password? <a className="text-blue-400 cursor-pointer" href="/login">Login</a>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
