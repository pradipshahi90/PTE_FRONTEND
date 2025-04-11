import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Api } from "../../utils/Api.js";
import { GenericRepo } from "../../repo/GenericRepo.js";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import { Edit2, Trash2, ToggleLeft, ToggleRight, User, Search, Plus } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmation from "../../components/DeleteConfirmation.jsx";

const UserManagementPage = () => {
    const repo = new GenericRepo();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        password: '',
    });
    const [showDeleteModal,setShowDeleteModal] = useState(false);



    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        repo.list(
            `${Api.GET_USERS}`,
            "",
            (data) => {
                setUsers(data.users);
            },
            (error) => {
                console.log("Error fetching data:", error);
                setError("Failed to load users. Please try again later.");
            }
        );
    };

    // Toggle user activation status
    const toggleUserStatus = async (userId) => {
            repo.update(
                `${Api.UPDATE_USER_STATUS}/${userId}/toggle-status`,
                "",
                (data)=>{
                    console.log('data',data);
                    fetchUsers(); // Refresh the user list after toggling
                },
                (error)=>{
                    console.log('error',error);
                }
            )
        }

    const handleAddUser = () => {
        const newUser = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            password: formData.password,
        };
        console.log('new user',newUser);
        repo.store(
            Api.ADD_USER,
                newUser,
            (data)=>{
                console.log('data',data);
                fetchUsers();
                toast.success(data.message);
                setIsModalOpen(false);
            },
            (error)=>{
                console.log('error',error);
                toast.error(error);
            }
        )
    };

    const handleEditUser = () => {
        // Do validation if needed
        console.log('selectedUser',selectedUser);
        const newUser = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            password: formData.password,
        };
        repo.update(
            `${Api.EDIT_USER}/${selectedUser.id}`,
            newUser,
            (data)=>{
                console.log('data',data);
                fetchUsers();
                setIsModalOpen(false);
                toast.success(data.message);
            },
            (error)=>{
                console.log('error',error);
                toast.error(error);
            }
        )
    };

    const closeDeleteModal =()=>{
        setShowDeleteModal(false);
    }


    const handleAddButtonClick = () => {
        setSelectedUser(null);
        setFormData({
            name: '',
            email: '',
            role: 'user',
            password: '',
        });
        setIsModalOpen(true);
    };



    // Delete user
    const deleteUser = async (user) => {
setSelectedUser(user);
setShowDeleteModal(true);
    };

    const handleDelete = (id) => {
        repo.destroy(
            `${Api.DELETE_USER}/${selectedUser.id}`,
            id,
            (data) => {
                setShowDeleteModal(false);
                fetchUsers();
                // Safely check if status is strictly true
                if (data.status !== true) {
                    toast.success(data.message || 'User Deleted Successfully');
                    return;
                }
                console.log('data.message', data.message);
                toast.success(data.message || 'User deleted successfully');
            },
            (error) => {
                console.log('error', error);
                toast.error(error?.message || 'An error occurred while deleting the user');
            }
        );
    };

    const editUser = (user) => {
        setSelectedUser(user);
        console.log('user',user);
        setFormData({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            password: '', // Leave empty; no password update unless entered
        });
        setIsModalOpen(true);
    };


    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                                <p className="text-gray-500 mt-1">Manage your system users and permissions</p>
                            </div>
                            <button
                                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                                onClick={() => {
                                    handleAddButtonClick();
                                }}
                            >
                                <Plus size={18} className="mr-2" />
                                Add User
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-6 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search users by name, email or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <User size={20} className="text-gray-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {user.role}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                                                            user.active
                                                                ? 'bg-green-100 text-green-800 '
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {user.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => toggleUserStatus(user.id)}
                                                            className={`transition-colors duration-200 p-2 rounded-full ${
                                                                user.active
                                                                    ? 'bg-green-50 text-green-600 hover:bg-green-100 '
                                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            }`}
                                                            title={user.active ? "Deactivate User" : "Activate User"}
                                                        >
                                                            {user.active ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => editUser(user)}
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-colors duration-200"
                                                            title="Edit User"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user)}
                                                            className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors duration-200"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center">
                                                <p className="text-gray-500">No users found matching your search criteria</p>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                    </div>
                </div>

                {/* Edit/Add User Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {selectedUser ? 'Edit User' : 'Add New User'}
                                </h3>
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Role
                                        </label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="user">User</option>
                                        </select>
                                    </div>
                                    {!selectedUser && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </form>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 rounded-b-lg">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                    onClick={selectedUser ? handleEditUser : handleAddUser}
                                >
                                    {selectedUser ? 'Save Changes' : 'Add User'}
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showDeleteModal && (
                <DeleteConfirmation
                    id={selectedUser.id}
                    onDelete={handleDelete}
                    onClose={closeDeleteModal}
                />
            )}
        </AdminLayout>
    );
};

export default UserManagementPage;