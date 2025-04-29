import React, { useState, useEffect } from 'react';
import { X, Upload, Image } from 'lucide-react';

const CourseModal = ({ course, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        course_name: '',
        course_url: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        if (course) {
            setFormData({
                course_name: course.course_name,
                course_url: course.course_url
            });
            setPreviewImage(course.course_image || '');
        }
    }, [course]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.course_name.trim()) {
            newErrors.course_name = 'Course name is required';
        }

        if (!formData.course_url.trim()) {
            newErrors.course_url = 'Course URL is required';
        } else if (!isValidUrl(formData.course_url)) {
            newErrors.course_url = 'Please enter a valid URL';
        }

        // Only require image for new courses
        if (!course && !imageFile) {
            newErrors.course_image = 'Course image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file is an image
            if (!file.type.match('image.*')) {
                setErrors({
                    ...errors,
                    course_image: 'Please select an image file (JPEG, PNG, GIF)'
                });
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({
                    ...errors,
                    course_image: 'Image file size must be less than 5MB'
                });
                return;
            }

            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));

            // Clear error
            if (errors.course_image) {
                setErrors({
                    ...errors,
                    course_image: ''
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const url = course
                ? `http://localhost:5001/api/courses/${course._id}`
                : 'http://localhost:5001/api/courses/add-course';

            const method = course ? 'PUT' : 'POST';

            // Create FormData object for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('course_name', formData.course_name);
            formDataToSend.append('course_url', formData.course_url);

            // Only append image if there's a new file
            if (imageFile) {
                formDataToSend.append('course_image', imageFile);
            }

            const response = await fetch(url, {
                method,
                body: formDataToSend,
                // Don't set Content-Type header when using FormData
            });

            const data = await response.json();

            if (data.success || data.status) {
                // Use the returned course data from the server
                const savedCourse = data.data || data.course || {
                    ...formData,
                    course_image: previewImage,
                    _id: course ? course._id : data.course.id,
                    createdAt: new Date().toISOString()
                };

                onSave(savedCourse);
            } else {
                setSubmitError(data.message || 'Failed to save course');
            }
        } catch (err) {
            console.error(err);
            setSubmitError('Server error. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {course ? 'Edit Course' : 'Add New Course'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4">
                    {submitError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {submitError}
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="course_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Course Name
                        </label>
                        <input
                            type="text"
                            id="course_name"
                            name="course_name"
                            value={formData.course_name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                errors.course_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Enter course name"
                        />
                        {errors.course_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.course_name}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="course_image" className="block text-sm font-medium text-gray-700 mb-1">
                            Course Image
                        </label>
                        <div className={`border-2 border-dashed rounded-md p-4 text-center ${
                            errors.course_image ? 'border-red-500' : 'border-gray-300'
                        }`}>
                            {previewImage ? (
                                <div className="mb-3">
                                    <div className="relative w-32 h-32 mx-auto">
                                        <img
                                            src={previewImage}
                                            alt="Course preview"
                                            className="w-full h-full object-cover rounded-md"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/128?text=Error";
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewImage('');
                                                setImageFile(null);
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <Image size={36} className="text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Upload course image</p>
                                </div>
                            )}

                            <div className="mt-2">
                                <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 inline-flex items-center transition-colors">
                                    <Upload size={16} className="mr-2" />
                                    <span>{previewImage ? 'Change Image' : 'Select Image'}</span>
                                    <input
                                        type="file"
                                        id="course_image"
                                        name="course_image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                JPEG, PNG, or GIF (max. 5MB)
                            </p>
                        </div>
                        {errors.course_image && (
                            <p className="mt-1 text-sm text-red-600">{errors.course_image}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="course_url" className="block text-sm font-medium text-gray-700 mb-1">
                            Course URL
                        </label>
                        <input
                            type="text"
                            id="course_url"
                            name="course_url"
                            value={formData.course_url}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                errors.course_url ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="https://example.com/course"
                        />
                        {errors.course_url && (
                            <p className="mt-1 text-sm text-red-600">{errors.course_url}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
                            ) : (
                                'Save Course'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseModal;