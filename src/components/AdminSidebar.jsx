export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-white shadow-md h-screen p-6">
            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
            <ul>
                <li className="py-2"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="py-2"><a href="/admin/users">Users</a></li>
                <li className="py-2"><a href="/admin/reading-materials">Reading Materials</a></li>
                <li className="py-2"><a href="/admin/settings">Settings</a></li>
            </ul>
        </aside>
    );
}
