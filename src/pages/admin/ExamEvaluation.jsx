import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from "../../layouts/AdminLayout.jsx";

const ExamResultsPage = () => {
    const [examResults, setExamResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExamResults = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5001/api/exam-results');
                setExamResults(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching exam results:', err);
                setError('Failed to load exam results. Please try again later.');
                setLoading(false);
            }
        };

        fetchExamResults();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const viewDetails = (result) => {
        setSelectedResult(result);
        console.log('result',result);
    };


    const closeDetails = () => {
        setSelectedResult(null);
    };

    const assignMarks = (result) => {
        // Store the entire result object in localStorage
        localStorage.setItem('selectedResult', JSON.stringify(result));
        console.log('result',result);
        navigate("/admin/exam-results/assign-marks");
    };

    // Calculate completion percentage
    const calculateCompletion = (result) => {
        if (!result.questionsWithAnswers) return 0;
        const totalQuestions = result.questionsWithAnswers.length + (result.speakingTest?.length || 0);
        return totalQuestions > 0 ? Math.round((result.questionsWithAnswers.length / totalQuestions) * 100) : 0;
    };

    // Calculate automated score where possible
    const calculateAutomatedScore = (questionsWithAnswers) => {
        if (!questionsWithAnswers || questionsWithAnswers.length === 0) return { score: 0, total: 0, manualRequired: false };

        let earnedPoints = 0;
        let totalPossiblePoints = 0;
        let manualGradingRequired = false;

        questionsWithAnswers.forEach(question => {
            // Add to total possible points
            const maxScore = question.maxScore || 0;
            totalPossiblePoints += maxScore;

            // Check if manual grading is required
            if (question.isCorrect === 'manual-grading') {
                manualGradingRequired = true;
            } else if (question.isCorrect === 'true') {
                // Fully correct answer
                earnedPoints += maxScore;
            } else if (question.isCorrect === 'partial') {
                // Partial credit - estimate 50% for display purposes only
                earnedPoints += maxScore / 2;
            }
        });

        return {
            score: earnedPoints,
            total: totalPossiblePoints,
            manualRequired: manualGradingRequired
        };
    };

    return (
        <AdminLayout>

        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Exam Results Dashboard</h1>
                    <p className="text-lg text-center text-gray-500">View and analyze all examination results</p>
                    <div className="h-1 w-32 bg-gray-300 mx-auto mt-4"></div>
                </header>

                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && examResults.length === 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
                        <p>No exam results found.</p>
                    </div>
                )}

                {!loading && !error && examResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {examResults.map((result) => {
                            const scoreInfo = calculateAutomatedScore(result.questionsWithAnswers);
                            const completionPercentage = calculateCompletion(result);

                            return (
                                <div
                                    key={result._id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="bg-gray-100 border-b border-gray-200 p-4">
                                        <h2 className="text-xl font-semibold text-gray-800 truncate">
                                            {result.examId?.title || result.examTitle || "Untitled Exam"}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Student: {result.userId?.name || "Unknown Student"}
                                        </p>
                                    </div>
                                    <div className="p-5">
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`font-semibold px-2 py-1 rounded-full text-sm ${result.isResultChecked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {result.isResultChecked ? 'Checked' : 'Pending Review'}
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-600">Score:</span>
                                                <span className="font-semibold">
                          {result.totalMarks ? `${result.totalMarks}%` :
                              (scoreInfo.manualRequired ?
                                  `~${Math.round((scoreInfo.score / scoreInfo.total) * 100)}% (est.)` :
                                  `${Math.round((scoreInfo.score / scoreInfo.total) * 100)}%`)}
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-gray-600">Completion:</span>
                                                <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{ width: `${completionPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {result.submittedAt && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Submitted:</span>
                                                    <span className="text-gray-500">{formatDate(result.submittedAt)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => viewDetails(result)}
                                                className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors duration-300 flex items-center justify-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                                View
                                            </button>
                                            <button
                                                onClick={() => assignMarks(result)}
                                                className={`flex-1 py-2 px-3 ${result.isResultChecked ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : 'bg-blue-500 hover:bg-blue-600 text-white'} font-medium rounded-md transition-colors duration-300 flex items-center justify-center`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                                {result.isResultChecked ? 'Edit Marks' : 'Assign Marks'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Detail Modal */}
                {selectedResult && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
                            <div className="bg-gray-100 border-b border-gray-200 p-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {selectedResult.examId?.title || selectedResult.examTitle || "Exam Details"}
                                    </h2>
                                    <p className="text-gray-500 mt-1">
                                        Student: {selectedResult.userId?.name || "Unknown Student"}
                                    </p>
                                </div>
                                <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className=" gap-6 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Exam Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">ID:</span>
                                                <span className="font-mono text-sm text-gray-800">{selectedResult._id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">User ID:</span>
                                                <span className="font-mono text-sm text-gray-800">
                          {typeof selectedResult.userId === 'object' ? selectedResult.userId._id : selectedResult.userId}
                        </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Submitted:</span>
                                                <span>{selectedResult.submittedAt ? formatDate(selectedResult.submittedAt) : 'N/A'}</span>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                                {/* Questions With Answers Section */}
                                {selectedResult.questionsWithAnswers && selectedResult.questionsWithAnswers.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Questions and Answers</h3>
                                        <div className="space-y-4">
                                            {selectedResult.questionsWithAnswers.map((qa, index) => (
                                                <div key={qa._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                    <div className="flex justify-between mb-2">
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-700 mr-2">Question {index + 1}</span>
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {qa.category || "Unknown Type"}
                              </span>
                                                        </div>
                                                        {selectedResult.isResultChecked ? (
                                                            <span className={`font-semibold text-sm ${qa.isCorrect === 'true' ? 'text-green-600' : qa.isCorrect === 'false' ? 'text-red-600' : qa.isCorrect === 'partial' ? 'text-yellow-600' : 'text-gray-600'}`}>
                                {qa.isCorrect === 'true' ? 'Correct' : qa.isCorrect === 'false' ? 'Incorrect' : qa.isCorrect === 'partial' ? 'Partially Correct' : 'Pending'}
                                                                {qa.maxScore !== undefined && ` (${qa.isCorrect === 'true' ? qa.maxScore : qa.isCorrect === 'partial' ? `${Math.floor(qa.maxScore/2)}` : '0'}/${qa.maxScore} marks)`}
                              </span>
                                                        ) : (
                                                            qa.isCorrect === 'manual-grading' ? (
                                                                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  Requires Manual Grading
                                </span>
                                                            ) : qa.isCorrect === 'true' || qa.isCorrect === 'partial' || qa.isCorrect === 'false' ? (
                                                                <span className={`text-sm px-2 py-1 rounded-full ${qa.isCorrect === 'true' ? 'bg-green-100 text-green-800' : qa.isCorrect === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  {qa.isCorrect === 'true' ? 'Auto-graded: Correct' : qa.isCorrect === 'partial' ? 'Auto-graded: Partial' : 'Auto-graded: Incorrect'}
                                </span>
                                                            ) : (
                                                                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  Not Graded
                                </span>
                                                            )
                                                        )}
                                                    </div>

                                                    {qa.questionText && (
                                                        <div className="mb-3">
                                                            <p className="text-sm text-gray-600 mb-1">Question:</p>
                                                            <p className="text-gray-800 bg-gray-50 p-2 rounded">{qa.questionText}</p>
                                                        </div>
                                                    )}

                                                    {qa.category === 'fill-in-blanks' && qa.userAnswer && typeof qa.userAnswer === 'object' ? (
                                                        <div className="mb-3">
                                                            <p className="text-sm text-gray-600 mb-1">User's Answers:</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {Object.entries(qa.userAnswer).map(([key, value], idx) => (
                                                                    <div key={idx} className="flex justify-between border rounded p-2 bg-gray-50">
                                                                        <span className="font-medium">{key}:</span>
                                                                        <span className={qa.correctAnswer && qa.correctAnswer[key] === value ? "text-green-600" : "text-red-600"}>
                                      {value}
                                                                            {qa.correctAnswer && qa.correctAnswer[key] !== value && (
                                                                                <span className="text-xs ml-2 text-gray-500">
                                          (Correct: {qa.correctAnswer[key]})
                                        </span>
                                                                            )}
                                    </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : qa.userAnswer && (
                                                        <div className="mb-3">
                                                            <p className="text-sm text-gray-600 mb-1">User's Answer:</p>
                                                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                                                {typeof qa.userAnswer === 'object' ?
                                                                    <p className="text-gray-800">{qa.userAnswer.text || JSON.stringify(qa.userAnswer)}</p> :
                                                                    <p className="text-gray-800">{qa.userAnswer}</p>
                                                                }
                                                            </div>
                                                        </div>
                                                    )}

                                                    {qa.correctAnswer && (
                                                        <div>
                                                            <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                                                            <div className="bg-green-50 p-2 rounded border border-green-100">
                                                                {typeof qa.correctAnswer === 'object' && !Array.isArray(qa.correctAnswer) ?
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {Object.entries(qa.correctAnswer).map(([key, value], idx) => (
                                                                            <div key={idx} className="flex justify-between">
                                                                                <span className="font-medium">{key}:</span>
                                                                                <span>{value}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div> :
                                                                    Array.isArray(qa.correctAnswer) ?
                                                                        qa.correctAnswer.map((answer, idx) => (
                                                                            <p key={idx} className="text-gray-800">{answer.text || JSON.stringify(answer)}</p>
                                                                        )) :
                                                                        <p className="text-gray-800">{qa.correctAnswer.toString()}</p>
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Speaking Test Section */}
                                {selectedResult.speakingTest && selectedResult.speakingTest.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Speaking Test Submissions</h3>
                                        <div className="space-y-4">
                                            {selectedResult.speakingTest.map((item, index) => (
                                                <div key={item.questionId || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-medium text-gray-700">{item.type || "Question"} #{index + 1}</span>
                                                        <span className="text-sm text-gray-500">{formatDate(item.answeredAt)}</span>
                                                    </div>
                                                    <p className="text-gray-700 mb-3">{item.question}</p>
                                                    {item.audioPath && (
                                                        <div className="mt-2">
                                                            <audio controls className="w-full" src={`http://localhost:5001${item.audioPath}`}>
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                        </div>
                                                    )}

                                                    {selectedResult.isResultChecked ? (
                                                        item.score ? (
                                                            <div className="mt-3 flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                                                                <span className="text-gray-600">Score:</span>
                                                                <span className="font-semibold">{item.score}/{item.maxScore || 10}</span>
                                                            </div>
                                                        ) : null
                                                    ) : null}

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </AdminLayout>

    );
};

export default ExamResultsPage;