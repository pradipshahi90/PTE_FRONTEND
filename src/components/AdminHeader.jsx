export default function AdminHeader() {
    return (
        <header className="bg-white dark:bg-gray-900 shadow-md p-4 flex items-center justify-between">
            {/* Logo & Title */}
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h1>

            {/* Profile Dropdown */}
            <div className="relative">
                <button className="flex items-center space-x-3 focus:outline-none">
                    <span className="text-gray-700 dark:text-white font-medium hidden sm:block">Admin</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden hidden group-hover:block">
                    <button className="block w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        Profile
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
