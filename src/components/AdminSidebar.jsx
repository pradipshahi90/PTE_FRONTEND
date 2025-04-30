import React, { useState, useEffect } from 'react';
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    BookOpen,
    CreditCard,
    FilePlus,
    ListChecks,
    Mic,
    BarChart,
    Home
} from 'lucide-react'; // Added some new icons!

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Reading Materials', href: '/admin/reading-materials', icon: BookOpen },
    { label: 'Payment History', href: '/admin/payment-history', icon: CreditCard },
    { label: 'Create Exam', href: '/admin/create-exam', icon: FilePlus },
    { label: 'Exams List', href: '/admin/exam-question', icon: ListChecks },
    { label: 'Speaking Questions', href: '/admin/speakingQuestions', icon: Mic },
    { label: 'Exam Results', href: '/admin/exam-results', icon: BarChart },
    { label: 'Courses', href: '/admin/courses', icon: ListChecks },
];

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const isActive = (href) => currentPath.startsWith(href);

    return (
        <>
            {/* Hamburger for mobile */}
            <div className="md:hidden fixed top-4 right-1/2 z-50">
                <button
                    onClick={toggleSidebar}
                    className="rounded-full bg-blue-600 text-white p-1 shadow-lg hover:bg-blue-700 transition"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white shadow-lg w-64 p-6 transform transition-transform duration-300 ease-in-out z-40 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:block`}
            >
                <h2 className="text-2xl font-bold mt-4 md:mt-0 mb-8 text-blue-700">Admin Panel</h2>
                <ul className="space-y-2 mb-8">
                    {navItems.map(({ label, href, icon: Icon }) => (
                        <li key={href}>
                            <a
                                href={href}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all text-sm font-medium
                  ${isActive(href)
                                    ? 'bg-blue-100 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}
                `}
                            >
                                <Icon className="mr-3" size={18} />
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Back to Home Button */}
                <div className="mt-8">
                    <a
                        href="/"
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
                    >
                        <Home size={18} />
                        Back to Home
                    </a>
                </div>
            </aside>
        </>
    );
}
