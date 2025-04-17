import { useState, useEffect } from 'react';
import AdminLayout from "../../layouts/AdminLayout.jsx";

// Main Admin Component for Speaking Questions CRUD
function SpeakingQuestionsAdmin() {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const API_URL = 'http://localhost:5001/api/speaking';

    // Fetch all questions
    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setQuestions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle opening delete modal
    const openDeleteModal = (question) => {
        setSelectedQuestion(question);
        setIsDeleteModalOpen(true);
    };

    // Handle opening edit modal
    const openEditModal = (question) => {
        setSelectedQuestion(question);
        setIsEditModalOpen(true);
    };

    // Delete a question
    const deleteQuestion = async () => {
        try {
            const response = await fetch(`${API_URL}/${selectedQuestion._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete question');
            }

            setIsDeleteModalOpen(false);
            fetchQuestions(); // Refresh the list
        } catch (err) {
            setError(err.message);
        }
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    if (isLoading && !questions.length) {
        return <div className="text-center py-10">Loading questions...</div>;
    }

    return (
        <AdminLayout>
            
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Speaking Questions Admin</h1>
                <p className="text-gray-600 mt-2">Manage your speaking test questions</p>
            </header>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="mb-6">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add New Question
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (s)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {questions.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                No questions found. Click "Add New Question" to create one.
                            </td>
                        </tr>
                    ) : (
                        questions.map((question) => (
                            <tr key={question._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {question.type}
                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 truncate max-w-xs">{question.question}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {question.duration}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {question.audioUrl && <span className="mr-2">🎵</span>}
                                    {question.imageUrl && <span>🖼️</span>}
                                    {!question.audioUrl && !question.imageUrl && <span>-</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        onClick={() => openEditModal(question)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-900"
                                        onClick={() => openDeleteModal(question)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <Modal onClose={() => setIsAddModalOpen(false)}>
                    <QuestionForm
                        mode="create"
                        onComplete={() => {
                            setIsAddModalOpen(false);
                            fetchQuestions();
                        }}
                        apiUrl={API_URL}
                    />
                </Modal>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedQuestion && (
                <Modal onClose={() => setIsEditModalOpen(false)}>
                    <QuestionForm
                        question={selectedQuestion}
                        mode="edit"
                        onComplete={() => {
                            setIsEditModalOpen(false);
                            fetchQuestions();
                        }}
                        apiUrl={API_URL}
                    />
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedQuestion && (
                <Modal onClose={() => setIsDeleteModalOpen(false)}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this question? This action cannot be undone.
                        </p>
                        <p className="font-medium text-gray-900 bg-gray-50 p-3 mb-6 rounded">
                            {selectedQuestion.question}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deleteQuestion}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none"
                            >
                                Delete Question
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
        </AdminLayout>
        
    );
}

// Modal Component
function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

// Question Form Component for Creating and Editing Questions
function QuestionForm({ question, mode, onComplete, apiUrl }) {
    const [formData, setFormData] = useState({
        type: question?.type || 'Read Aloud',
        question: question?.question || '',
        audioUrl: question?.audioUrl || '',
        imageUrl: question?.imageUrl || '',
        duration: question?.duration || 60
    });

    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'duration' ? Number(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            const url = mode === 'edit' ? `${apiUrl}/${question._id}` : apiUrl;
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save question');
            }

            onComplete();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const questionTypes = [
        'Read Aloud',
        'Repeat Sentence',
        'Describe Image',
        'Retell Lecture',
        'Answer Short Question'
    ];

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
                {mode === 'edit' ? 'Edit Question' : 'Add New Question'}
            </h2>

            {formError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{formError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                        Question Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        {questionTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
                        Question
                    </label>
                    <textarea
                        id="question"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="4"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                        Duration (seconds)
                    </label>
                    <input
                        id="duration"
                        name="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="audioUrl">
                        Audio URL (optional)
                    </label>
                    <input
                        id="audioUrl"
                        name="audioUrl"
                        type="text"
                        value={formData.audioUrl}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                        Image URL (optional, for Describe Image)
                    </label>
                    <input
                        id="imageUrl"
                        name="imageUrl"
                        type="text"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            formData.type === 'Describe Image' ? 'border-blue-300' : ''
                        }`}
                    />
                    {formData.type === 'Describe Image' && (
                        <p className="text-sm text-blue-600 mt-1">
                            Image URL is recommended for this question type
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Question' : 'Create Question'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SpeakingQuestionsAdmin;