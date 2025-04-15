import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from "../../layouts/AdminLayout.jsx";

export default function AdminDashboard() {
    const [exams, setExams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [expandedExam, setExpandedExam] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const API_BASE_URL = 'http://localhost:5001/api';

    useEffect(() => {
        handleFetchExams();
        handleFetchQuestions();
    }, []);

    const handleFetchExams = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/exams`);
            console.log("Fetched exams:", response.data);
            const examData = response.data.data || [];
            setExams(examData);

            // Set default selected exam to the first one if not already set
            if (examData.length > 0 && !selectedExamId) {
                setSelectedExamId(examData[0]._id);
                setExpandedExam(examData[0]._id);
            }
        } catch (error) {
            console.error('Error fetching exams:', error.response?.data || error.message);
        }
    };

    // Fetch questions from API
    const handleFetchQuestions = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/questions`);
            setQuestions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching questions:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Find question details by ID
    const getQuestionById = (questionId) => {
        return questions.find(q => q._id === questionId) || { questionText: "Question details not available" };
    };

    // Toggle expanded exam
    const toggleExpandExam = (examId) => {
        setExpandedExam(expandedExam === examId ? null : examId);
        setExpandedSection(null);
    };

    // Toggle expanded section
    const toggleExpandSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    // Toggle expanded question
    const toggleExpandQuestion = (questionId) => {
        setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
    };

    // Get difficulty badge color
    const getDifficultyColor = (difficulty) => {
        switch(difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Format category for display
    const formatCategory = (category) => {
        return category.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Render options for multiple choice questions
    const renderOptions = (options, correctAnswer) => {
        if (!options || options.length === 0) return null;

        return (
            <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Options:</h4>
                <ul className="pl-5 space-y-1">
                    {options.map((option, index) => (
                        <li key={option._id || index} className="flex items-center">
              <span className={`w-4 h-4 mr-2 inline-flex items-center justify-center rounded-full text-xs ${option.isCorrect ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                {String.fromCharCode(65 + index)}
              </span>
                            <span className="text-sm">{option.text}</span>
                            {option.isCorrect && <span className="ml-2 text-xs text-green-600">✓ Correct</span>}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // Render fill in the blanks correct answers
    const renderBlankAnswers = (correctAnswer) => {
        if (!correctAnswer) return null;

        return (
            <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Correct Answers:</h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    {Object.entries(correctAnswer).map(([key, value]) => (
                        <div key={key} className="flex mb-1 last:mb-0">
                            <span className="text-sm font-medium w-16">{key}:</span>
                            <span className="text-sm">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="flex justify-end">
                <a href="/admin/create-exam" className="bg-blue-400 px-3 py-2 rounded-lg text-white">+ Add exam</a>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Exams List</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {exams.map((exam) => (
                            <div key={exam._id} className="border-b border-gray-200 last:border-b-0">
                                <div
                                    className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 ${expandedExam === exam._id ? 'bg-blue-50' : ''}`}
                                    onClick={() => toggleExpandExam(exam._id)}
                                >
                                    <div>
                                        <h3 className="font-medium text-gray-900">{exam.title}</h3>
                                        <p className="text-sm text-gray-500">{exam.description}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </span>
                                        <span className="text-sm text-gray-600">Score: {exam.totalScore}</span>
                                        <svg className={`w-5 h-5 text-gray-500 transform ${expandedExam === exam._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {expandedExam === exam._id && (
                                    <div className="pl-4 pr-4 pb-4">
                                        <div className="mt-2 space-y-3">
                                            {exam.sections.map((section) => (
                                                <div key={section._id} className="bg-gray-50 rounded-md overflow-hidden">
                                                    <div
                                                        className={`flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 ${expandedSection === section._id ? 'bg-blue-50' : ''}`}
                                                        onClick={() => toggleExpandSection(section._id)}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="capitalize font-medium text-gray-700">{section.name}</span>
                                                            <span className="ml-3 text-sm text-gray-500">{section.duration} minutes</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-sm text-gray-600">{section.questions.length} questions</span>
                                                            <svg className={`ml-2 w-4 h-4 text-gray-500 transform ${expandedSection === section._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {expandedSection === section._id && (
                                                        <div className="border-t border-gray-200 p-3">
                                                            <ul className="space-y-4">
                                                                {section.questions.map((questionId) => {
                                                                    const questionData = getQuestionById(questionId);
                                                                    return (
                                                                        <li key={questionId} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                                                            <div
                                                                                className="flex items-start justify-between cursor-pointer"
                                                                                onClick={() => toggleExpandQuestion(questionId)}
                                                                            >
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center mb-2 space-x-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(questionData.difficulty)}`}>
                                              {questionData.difficulty}
                                            </span>
                                                                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                              {questionData.type}
                                            </span>
                                                                                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                              {formatCategory(questionData.category || '')}
                                            </span>
                                                                                        <span className="text-xs font-medium text-blue-600">
                                              {questionData.maxScore || 0} pts
                                            </span>
                                                                                    </div>

                                                                                    <div className="whitespace-pre-line text-sm text-gray-800">
                                                                                        {questionData.questionText}
                                                                                    </div>

                                                                                    {questionData.instructions && (
                                                                                        <div className="mt-2 text-sm italic text-gray-600">
                                                                                            <span className="font-medium">Instructions:</span> {questionData.instructions}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="ml-4 flex-shrink-0">
                                                                                    <svg className={`w-5 h-5 text-gray-400 transform ${expandedQuestion === questionId ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                    </svg>
                                                                                </div>
                                                                            </div>

                                                                            {expandedQuestion === questionId && (
                                                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                                                    {questionData.mediaUrl && (
                                                                                        <div className="mb-4">
                                                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Media:</h4>
                                                                                            {questionData.mediaType === 'audio' ? (
                                                                                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                                                                    <audio controls className="w-full">
                                                                                                        <source src={questionData.mediaUrl} type="audio/mpeg" />
                                                                                                        Your browser does not support the audio element.
                                                                                                    </audio>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                                                                    <p className="text-sm text-gray-600">{questionData.mediaUrl}</p>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                    {questionData.options && questionData.options.length > 0 && questionData.category === "multiple-choice" && (
                                                                                        renderOptions(questionData.options)
                                                                                    )}

                                                                                    {(questionData.category === "fill-in-blanks" || questionData.category === "summarize-text") && questionData.correctAnswer && (
                                                                                        renderBlankAnswers(questionData.correctAnswer)
                                                                                    )}

                                                                                    {questionData.tags && questionData.tags.length > 0 && (
                                                                                        <div className="mt-4">
                                                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
                                                                                            <div className="flex flex-wrap gap-1">
                                                                                                {questionData.tags.map((tag, index) => (
                                                                                                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                    {tag}
                                                  </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="mt-4 pt-2 flex justify-end space-x-2">
                                                                                        <button className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">
                                                                                            Edit
                                                                                        </button>
                                                                                        <button className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded">
                                                                                            Delete
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>

    );
}