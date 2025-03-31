import { useState } from "react";
import { useLocation } from "react-router-dom"; // For active link tracking
import search from '../assets/search.svg';

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation(); // Hook to get the current route

    return (
        <header className="sticky top-0 w-full bg-white  z-50">
            <div className="container mx-auto flex justify-between items-center p-4">
                {/* Left Side: Logo & Search */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">
                        <img src="/logo.svg" alt="logo" className="cursor-pointer" />
                    </h1>
                </div>

                {/* Center: Navigation */}
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
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-500 scale-x-0 transition-transform group-hover:scale-x-100" />
                        </a>
                    ))}
                </nav>

                {/* Right Side: Auth & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <button onClick={() => setSearchOpen(!searchOpen)} className="p-2">
                        <img src={search} alt="search icon" className="w-6 h-6" />
                    </button>
                    <a href="/login" className="text-gray-700 hover:text-blue-500">Log in</a>
                    <a href="/register" className="border border-gray-400 rounded-full px-6 py-2 bg-white text-gray-700 hover:bg-blue-400 hover:text-white transition-colors">
                        Signup
                    </a>
                    <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
                        ☰
                    </button>
                </div>
            </div>

            {/* Search Input */}
            {searchOpen && (
                <div className="absolute right-0 top-16 z-40 bg-white p-2 w-full md:w-96 shadow-md">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}

            {/* Mobile Menu */}
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