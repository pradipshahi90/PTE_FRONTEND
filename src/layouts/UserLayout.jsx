// layouts/UserLayout.jsx
import UserSidebar from "../components/UserSidebar.jsx";
import UserHeader from "../components/UserHeader.jsx";

export default function UserLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100">
            <UserSidebar />
            <div className="flex-1 flex flex-col">
                <UserHeader />
                <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
