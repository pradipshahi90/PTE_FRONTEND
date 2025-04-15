import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDown, ArrowRight, BookOpen, Clock, Award } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const ExamSelectionPage = () => {
    const [exams, setExams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [expandedExam, setExpandedExam] = useState(null);
    const [startExam, setStartExam] = useState(false);
    const [currentExam, setCurrentExam] = useState(null);

    useEffect(() => {
        handleFetchExams();
        handleFetchQuestions();
    }, []);

    const handleFetchExams = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    // Fetch questions from API
    const handleFetchQuestions = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/questions`);
            setQuestions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching questions:', error.response?.data || error.message);
        }
    };

    const toggleExamExpansion = (examId) => {
        setExpandedExam(expandedExam === examId ? null : examId);
    };

    const handleExamSelection = (examId) => {
        setSelectedExamId(examId);
    };

    const handleStartExam = (exam) => {
        setCurrentExam(exam);
        localStorage.setItem("selectedExam", JSON.stringify(exam));
        setStartExam(true);
    };

    const calculateTotalDuration = (sections) => {
        return sections.reduce((total, section) => total + section.duration, 0);
    };

    const getQuestionDetails = (questionId) => {
        return questions.find(q => q._id === questionId) || {};
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (startExam && currentExam) {
        return <ExamTaking exam={currentExam} questions={questions} onBack={() => setStartExam(false)} />;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">Exam Selection</h1>

            <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-700">
                    Please select an exam from the list below to begin your assessment.
                    Each exam contains different sections with varied question types to test your skills.
                </p>
            </div>

            <div className="space-y-4">
                {exams.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No exams available at the moment.</p>
                    </div>
                ) : (
                    exams.map((exam) => (
                        <div
                            key={exam._id}
                            className={`border rounded-lg overflow-hidden transition-all duration-300 shadow hover:shadow-md ${selectedExamId === exam._id ? 'border-blue-500' : 'border-gray-200'}`}
                        >
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer ${selectedExamId === exam._id ? 'bg-blue-50' : 'bg-white'}`}
                                onClick={() => {
                                    handleExamSelection(exam._id);
                                    toggleExamExpansion(exam._id);
                                }}
                            >
                                <div className="flex items-center">
                                    <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                                    <div>
                                        <h3 className="font-medium text-lg text-gray-800">{exam.title}</h3>
                                        <p className="text-gray-600 text-sm">{exam.description || "No description available"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-4 flex items-center">
                                        <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                        <span className="text-sm text-gray-500">{calculateTotalDuration(exam.sections)} min</span>
                                    </div>
                                    <div className="mr-4 flex items-center">
                                        <Award className="h-4 w-4 text-gray-500 mr-1" />
                                        <span className="text-sm text-gray-500">{exam.totalScore} pts</span>
                                    </div>
                                    {expandedExam === exam._id ?
                                        <ArrowDown className="h-5 w-5 text-blue-500" /> :
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    }
                                </div>
                            </div>

                            {expandedExam === exam._id && (
                                <div className="border-t border-gray-200 bg-white p-4">
                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-700 mb-2">Exam Sections:</h4>
                                        <div className="space-y-3">
                                            {exam.sections.map((section) => (
                                                <div key={section._id} className="bg-gray-50 p-3 rounded">
                                                    <div className="flex justify-between mb-2">
                                                        <h5 className="font-medium text-gray-700 capitalize">{section.name} Section</h5>
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                                            <span className="text-sm text-gray-500">{section.duration} min</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {section.questions.map((questionId) => {
                                                            const question = getQuestionDetails(questionId);
                                                            return (
                                                                <div key={questionId} className="text-sm text-gray-600 pl-2 border-l-2 border-gray-300">
                                                                    {question.questionText ?
                                                                        question.questionText.length > 70 ?
                                                                            `${question.questionText.substring(0, 70)}...` :
                                                                            question.questionText
                                                                        : 'Loading question...'}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleStartExam(exam)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                                        >
                                            Start Exam
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// This would be a separate component for taking the exam
const ExamTaking = ({ exam, questions, onBack }) => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-blue-800">{exam.title}</h1>
                <button
                    onClick={onBack}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                >
                    Back to Exams
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Exam Instructions</h2>
                <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
                    <li>This exam consists of {exam.sections.length} sections</li>
                    <li>Total duration: {calculateTotalDuration(exam.sections)} minutes</li>
                    <li>Total score: {exam.totalScore} points</li>
                    <li>Answer all questions to the best of your ability</li>
                    <li>You can navigate between sections using the navigation bar</li>
                </ul>

                <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Sections:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {exam.sections.map((section, index) => (
                            <div key={section._id} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-medium capitalize text-blue-800">{section.name}</h4>
                                <div className="flex justify-between mt-2 text-sm text-gray-600">
                                    <span>{section.questions.length} questions</span>
                                    <span>{section.duration} minutes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <a href="/exam-room" className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-md transition-colors text-lg">
                        Begin Exam
                    </a>
                </div>
            </div>
        </div>
    );
};

function calculateTotalDuration(sections) {
    return sections.reduce((total, section) => total + section.duration, 0);
}

export default ExamSelectionPage;