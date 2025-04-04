// layouts/AdminLayout.jsx
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar.jsx";

export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader />
                <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
