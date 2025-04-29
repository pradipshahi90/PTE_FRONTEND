import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Search, RefreshCw, ExternalLink } from 'lucide-react';
import CourseModal from "../../components/CourseModal.jsx";
import DeleteModal from "../../components/DeleteModal.jsx";
import AdminLayout from "../../layouts/AdminLayout.jsx";

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseIdToDelete, setCourseIdToDelete] = useState(null);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/courses/get-courses');
            const data = await response.json();

            if (data.success) {
                setCourses(data.data);
            } else {
                setError(data.message || 'Failed to fetch courses');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleAddCourse = () => {
        setCurrentCourse(null);
        setIsModalOpen(true);
    };

    const handleEditCourse = (course) => {
        setCurrentCourse(course);
        setIsModalOpen(true);
    };

    const handleDeleteCourse = async (id) => {
        setCourseIdToDelete(id);
        console.log('course to delete',courseIdToDelete);
        setIsDeleteModalOpen(true); // Open the modal
        console.log('delete modal status',isDeleteModalOpen);
    };

    const handleConfirmDelete = async (id) => {
        console.log("id",id);
        try {
            const response = await fetch(`http://localhost:5001/api/courses/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setCourses(courses.filter(course => course._id !== id));
                setCourseIdToDelete(null); // Close the modal after successful deletion
                setIsDeleteModalOpen(false);
            } else {
                setError(data.message || 'Failed to delete course');
                setCourseIdToDelete(false); // Close the modal even if there is an error
            }
        } catch (err) {
            setError('Server error. Please try again later.');
            console.error(err);
            setCourseIdToDelete(false); // Close the modal in case of error
        }
    };

    const handleCloseModal = () => {
        setCourseIdToDelete(null); // Close the modal if the user cancels
        setIsDeleteModalOpen(false);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const onSave = (newCourse) => {
        if (currentCourse) {
            // Update existing course in the UI
            setCourses(courses.map(c => c._id === newCourse._id ? newCourse : c));
        } else {
            // Add new course to the UI
            setCourses([...courses, newCourse]);
        }
        closeModal();
    };

    const filteredCourses = courses.filter(course =>
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
                            <button
                                onClick={handleAddCourse}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={18} className="mr-1" />
                                Add Course
                            </button>
                        </div>

                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={fetchCourses}
                                    className="ml-3 p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                                    title="Refresh courses"
                                >
                                    <RefreshCw size={18} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="px-6 py-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-500">Loading courses...</p>
                            </div>
                        ) : error ? (
                            <div className="px-6 py-12 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                                    <X size={24} className="text-red-600" />
                                </div>
                                <p className="text-red-500">{error}</p>
                                <button
                                    onClick={fetchCourses}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-gray-500">
                                    {searchTerm ? 'No courses match your search.' : 'No courses available. Add your first course!'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCourses.map((course) => (
                                        <tr key={course._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={course.course_image}

                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {course.course_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <a
                                                        href={course.course_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center hover:text-blue-600"
                                                    >
                                                        <span className="truncate max-w-xs">{course.course_url}</span>
                                                        <ExternalLink size={14} className="ml-1 flex-shrink-0" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(course.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditCourse(course)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <CourseModal
                    course={currentCourse}
                    onClose={closeModal}
                    onSave={onSave}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                courseId={courseIdToDelete}
            />
                )}
        </div>
        </AdminLayout>

    );
};

export default CourseManagement;