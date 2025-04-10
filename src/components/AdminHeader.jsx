import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminHeader() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);  // State to manage dropdown visibility
    const navigate = useNavigate();  // Initialize the navigate function

    const handleLogout = () => {
        // Clear localStorage
        localStorage.clear();

        // Clear cookies
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c
                .replace(/^ +/, '')
                .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });

        // Redirect to the homepage and force reload
        navigate('/');  // Navigate to the homepage
        window.location.reload();  // Force reload of the page
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);  // Toggle the dropdown visibility
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md p-4 flex items-center justify-between">
            {/* Logo & Title */}
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h1>

            {/* Profile Dropdown */}
            <div className="relative">
                <button
                    className="flex items-center space-x-3 focus:outline-none"
                    onClick={toggleDropdown}  // Toggle dropdown on click
                >
                    <span className="text-gray-700 dark:text-white font-medium hidden sm:block">Admin</span>
                    <LogOut className="text-gray-700 dark:text-white" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                        <button className="block w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            Profile
                        </button>
                        <button
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
