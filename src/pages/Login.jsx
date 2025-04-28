import React, { useState } from 'react';
import { Api } from "../utils/Api.js";
import toast from "react-hot-toast";
import { GenericRepo } from "../repo/GenericRepo.js";
import { useNavigate } from "react-router-dom";
import {useAuthStore} from "../utils/authStore.js";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate(); // ✅ Call it at the top level
    const repo = new GenericRepo();

    // Handle input changes dynamically
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const setUser = useAuthStore.getState().setUser;
        repo.store(
            `${Api.LOGIN}`,
            formData,
            (data) => {
                console.log('console.log', data);
                // Assuming you have the token in data.token
                const token = data.token;
                setUser(data.user);
                // Set the cookie with the token
                // Remove HttpOnly flag as it's not allowed in client-side JS
                document.cookie = `access_token=${token}; path=/; max-age=3600; Secure; SameSite=Strict`;

                toast.success(data.message);
                if(data.user.role==="user"){
                    navigate("/");
                } else if(data.user.role==="admin")
                    navigate("/admin/dashboard");
            },
            (error) => {
                toast.error(error);
                console.log("error", error);
            }
        );
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold primary-color text-center mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-primary mb-2">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-primary mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn btn-primary"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-[16px] font-[500]">
                    Don't have an account? <a className="text-blue-400 cursor-pointer" href="/register">Sign up</a>
                </p>

                <p className="mt-2 text-center">
                    <a className="text-blue-400 cursor-pointer" href="/forgot-password">Forgot Password?</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
