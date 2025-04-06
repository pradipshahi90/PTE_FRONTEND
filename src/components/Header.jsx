import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import search from '../assets/search.svg';
import { useAuthStore } from "../utils/authStore.js";

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    const dropdownRef = useRef();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout); // Get logout function from Zustand

    // Close dropdown when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout(); // clear user in zustand
        document.cookie = "access_token=; max-age=0; path=/"; // remove cookie
        // Don't navigate anywhere, stay on the same page
    };

    return (
        <header className="sticky top-0 w-full bg-white z-50">
            <div className="mx-auto flex justify-between items-center p-4">
                {/* Left */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">
                        <img src="/logo.svg" alt="logo" className="cursor-pointer" />
                    </h1>
                </div>

                {/* Center */}
                <nav className="hidden md:flex space-x-6">
                    {['Home', 'Learn', 'Exam'].map((item) => (
                        <a
                            key={item}
                            href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className={`relative text-gray-700 hover:text-blue-500 ${
                                location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`)
                                    ? 'underline underline-offset-4'
                                    : ''
                            }`}
                        >
                            {item}
                        </a>
                    ))}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-4 relative">
                    <button onClick={() => setSearchOpen(!searchOpen)} className="p-2">
                        <img src={search} alt="search icon" className="w-6 h-6" />
                    </button>

                    {!user ? (
                        <>
                            <a href="/login" className="text-gray-700 hover:text-blue-500">Log in</a>
                            <a
                                href="/register"
                                className="border border-gray-400 rounded-full px-6 py-2 bg-white text-gray-700 hover:bg-blue-400 hover:text-white transition-colors"
                            >
                                Signup
                            </a>
                        </>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-500"
                            >
                                {user.name}
                                <span>▼</span>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 top-10 mt-2 w-40 bg-white shadow-md rounded-md border z-50">
                                    <a
                                        href={`${user.role}/dashboard`}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        Dashboard
                                    </a>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
                        ☰
                    </button>
                </div>
            </div>

            {/* Search input */}
            {searchOpen && (
                <div className="absolute right-0 top-16 z-40 bg-white p-2 w-full md:w-96 shadow-md">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}

            {/* Mobile Nav */}
            {menuOpen && (
                <nav className="md:hidden flex flex-col bg-white p-4 space-y-2 shadow-lg">
                    {['Home', 'Learn', 'Exam'].map((item) => (
                        <a
                            key={item}
                            href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className="p-2 block text-gray-700"
                        >
                            {item}
                        </a>
                    ))}
                </nav>
            )}
        </header>
    );
}
