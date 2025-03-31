import React, { useState } from 'react';
import { GenericRepo } from "../repo/GenericRepo.js";
import {Api} from "../utils/Api.js";
import toast from 'react-hot-toast';


const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const repo = new GenericRepo();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        repo.store(
            `${Api.REGISTER}`,
            formData,
            (data)=>{
                console.log('console.log',data);
                toast.success(data.message);

            },
            (error)=>{
                toast.error(error);
                console.log("error",error);
            }
        )
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
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
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn btn-primary"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-[16px] font-[500]">Already have an account? <a className="text-blue-400 cursor-pointer" href="/login">Sign in</a></p>
            </div>
        </div>
    );
};

export default Register;
