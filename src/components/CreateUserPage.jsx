import React, { useState } from 'react';
import axios from 'axios';

const CreateUserPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [isPremium, setIsPremium] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newUser = {
                name,
                email,
                password,
                role,
                is_premium_purchased: isPremium,
            };
            await axios.post('http://localhost:5001/api/admin/users', newUser);
        } catch (err) {
            setError('Error creating user');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-6">Create New User</h1>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700">Premium</label>
                    <input
                        type="checkbox"
                        checked={isPremium}
                        onChange={() => setIsPremium(!isPremium)}
                        className="mr-2"
                    />
                    Premium User
                </div>
                <div>
                    <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-md">
                        Create User
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUserPage;
