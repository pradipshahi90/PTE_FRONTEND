import UserLayout from "../../layouts/UserLayout.jsx";
import {useAuthStore} from "../../utils/authStore.js";

export default function UserDashboard(){
const user = useAuthStore((state) => state.user);

    return (
        <UserLayout>
            <h2 className="text-2xl font-semibold">Welcome to the user Dashboard</h2>
            <h1>Welcome, {user?.name || 'Guest'}!</h1>
        </UserLayout>
    );
}
