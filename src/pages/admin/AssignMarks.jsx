import { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, AlertCircle,
    Save, ChevronDown, ChevronUp,
    Loader, Award, User, Calendar
} from 'lucide-react';
import {useNavigate} from "react-router-dom";

import toast from "react-hot-toast";
import AdminLayout from "../../layouts/AdminLayout.jsx";

const ExamGradingPage = () => {
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [manualGrades, setManualGrades] = useState({});
    const [totalScore, setTotalScore] = useState(0);
    const [possibleScore, setPossibleScore] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [expandedQuestions, setExpandedQuestions] = useState({});
    const navigate = useNavigate(); // ✅ Call it at the top level


    useEffect(() => {
        // Get exam data from localStorage
        const storedData = localStorage.getItem('selectedResult');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                setExamData(parsedData);

                // Initialize manual grades for questions that need manual grading
                const initialManualGrades = {};
                parsedData.questionsWithAnswers.forEach(question => {
                    if (question.isCorrect === "manual-grading") {
                        initialManualGrades[question.questionId] = 0;
                    }
                });

                // Initialize for speaking test if present
                if (parsedData.speakingTest && parsedData.speakingTest.length > 0) {
                    parsedData.speakingTest.forEach(speaking => {
                        initialManualGrades[speaking.questionId] = 0;
                    });
                }

                setManualGrades(initialManualGrades);

                // Calculate initial scores from auto-graded questions
                calculateScores(parsedData, initialManualGrades);
            } catch (e) {
                console.error("Error parsing exam data:", e);
            }
        }
        setLoading(false);
    }, []);

    const calculateScores = (data, manualScores) => {
        if (!data) return;

        let total = 0;
        let possible = 0;

        // Calculate scores from automatically graded questions
        data.questionsWithAnswers.forEach(question => {
            possible += question.maxScore;

            if (question.isCorrect === "true") {
                total += question.maxScore;
            } else if (question.isCorrect === "partial") {
                // For partial, calculate based on correct answers
                if (question.category === "fill-in-blanks") {
                    const blanks = Object.keys(question.correctAnswer);
                    let correctBlanks = 0;

                    blanks.forEach(blankKey => {
                        if (question.userAnswer[blankKey]?.toLowerCase() === question.correctAnswer[blankKey]?.toLowerCase()) {
                            correctBlanks++;
                        }
                    });

                    total += (correctBlanks / blanks.length) * question.maxScore;
                }
            } else if (question.isCorrect === "manual-grading") {
                // Add scores from manually graded questions
                total += manualScores[question.questionId] || 0;
            }
        });

        // Handle speaking test scoring if present
        if (data.speakingTest && data.speakingTest.length > 0) {
            data.speakingTest.forEach(speaking => {
                // Default max score for speaking is 5 if not specified
                const speakingMaxScore = speaking.maxScore || 5;
                possible += speakingMaxScore;
                total += manualScores[speaking.questionId] || 0;
            });
        }

        setTotalScore(Math.round(total * 10) / 10);
        setPossibleScore(possible);
        setPercentage(Math.round((total / possible) * 100));
    };

    const handleManualGradeChange = (questionId, value) => {
        const numValue = parseFloat(value) || 0;
        const updatedGrades = { ...manualGrades, [questionId]: numValue };
        setManualGrades(updatedGrades);
        calculateScores(examData, updatedGrades);
    };

    // Function to update the exam result via API
    const updateExamResultStatus = async (examData) => {
        try {
            // Extract the necessary data
            const { _id, score, isResultChecked } = examData;

            // Create the payload
            const updatePayload = {
                totalMarks: score.score, // Use the score as totalMarks
                isResultChecked: true    // Mark as checked
            };

            console.log('Sending update to API:', updatePayload);

            // Make the API call
            const response = await fetch(`http://localhost:5001/api/exam-results/${_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload),
            });

            // Check if the request was successful
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            console.log('Exam result updated successfully:', result);
            navigate("/admin/exam-results");
            return result;
        } catch (error) {
            console.error('Failed to update exam result:', error);
            throw error;
        }
    };

// Updated handleSubmit function with API call
    const handleSubmit = async () => {
        if (!examData) return;

        try {
            // Create updated exam data with new scores
            const updatedExamData = {
                ...examData,
                score: {
                    score: totalScore,
                    possibleScore: possibleScore,
                    percentage: percentage
                },
                isResultChecked: true
            };

            // Update localStorage
            localStorage.setItem('selectedResult', JSON.stringify(updatedExamData));
            console.log('Updated exam data:', updatedExamData);

            // Make the API call to update the status
            const apiResult = await updateExamResultStatus(updatedExamData);

            // Show success message to user
            // This could be a toast notification or other UI feedback
            toast.success('Exam result has been successfully updated!');

        } catch (error) {
            // Handle errors - could show error message to user
            console.error('Error during submission:', error);
            toast.error('Failed to update the exam result. Please try again.');
        }
    };
    const toggleQuestion = (questionId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-blue-500" size={32} />
                <span className="ml-2">Loading exam data...</span>
            </div>
        );
    }

    if (!examData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
                    <AlertCircle className="text-yellow-500 mr-2" size={24} />
                    <p className="text-lg">No exam data found. Please select an exam result to grade.</p>
                </div>
            </div>
        );
    }

    // Generate a unique key for each question
    const getUniqueQuestionKey = (questionId, section) => {
        return `${section}-${questionId}`;
    };

    return (
        <AdminLayout>

        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-2xl font-bold mb-2">
                    Exam Grading: {examData.examId?.title || "Unknown Exam"}
                </h1>
                <div className="flex items-center mb-1">
                    <User className="mr-2" size={18} />
                    <p className="text-gray-700">
                        Student: {examData.userId?.name || "Unknown Student"}
                    </p>
                </div>
                <div className="flex items-center mb-4">
                    <Calendar className="mr-2" size={18} />
                    <p className="text-gray-700">
                        Submitted: {new Date(examData.submittedAt).toLocaleString()}
                    </p>
                </div>

                <div className="mt-6 mb-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center">
                            <Award className="text-blue-500 mr-3" size={28} />
                            <div>
                                <p className="text-sm text-gray-600">Current Score</p>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-blue-600">{totalScore}</span>
                                    <span className="text-xl text-gray-500">/{possibleScore}</span>
                                    <span className="ml-3 text-lg text-gray-600">({percentage}%)</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Automatically Graded Questions</h2>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {examData.questionsWithAnswers
                            .filter(q => q.isCorrect !== "manual-grading")
                            .map((question) => {
                                // Calculate score for this question
                                let questionScore = 0;
                                if (question.isCorrect === "true") {
                                    questionScore = question.maxScore;
                                } else if (question.isCorrect === "partial" && question.category === "fill-in-blanks") {
                                    const blanks = Object.keys(question.correctAnswer);
                                    let correctBlanks = 0;

                                    blanks.forEach(blankKey => {
                                        if (question.userAnswer[blankKey]?.toLowerCase() === question.correctAnswer[blankKey]?.toLowerCase()) {
                                            correctBlanks++;
                                        }
                                    });

                                    questionScore = (correctBlanks / blanks.length) * question.maxScore;
                                }

                                // Generate a unique key for this question
                                const uniqueKey = getUniqueQuestionKey(question.questionId, 'auto');

                                return (
                                    <>
                                        <tr key={uniqueKey}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {question.category}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {question.questionText.length > 60
                                                    ? `${question.questionText.substring(0, 60)}...`
                                                    : question.questionText}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {question.isCorrect === "true" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="mr-1" size={14} />
                              Correct
                            </span>
                                                )}
                                                {question.isCorrect === "false" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="mr-1" size={14} />
                              Incorrect
                            </span>
                                                )}
                                                {question.isCorrect === "partial" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertCircle className="mr-1" size={14} />
                              Partial
                            </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {Math.round(questionScore * 10) / 10}/{question.maxScore}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                                                <button
                                                    className="flex items-center text-blue-500 hover:text-blue-700"
                                                    onClick={() => toggleQuestion(uniqueKey)}
                                                >
                                                    {expandedQuestions[uniqueKey] ? (
                                                        <>Hide <ChevronUp size={16} className="ml-1" /></>
                                                    ) : (
                                                        <>View <ChevronDown size={16} className="ml-1" /></>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedQuestions[uniqueKey] && (
                                            <tr key={`${uniqueKey}-details`}>
                                                <td colSpan="5" className="px-6 py-4 bg-gray-50">
                                                    <div className="text-sm">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="font-medium text-gray-700 mb-2">Question Text:</p>
                                                                <p className="text-gray-600 mb-4">{question.questionText}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-700 mb-2">Correct Answer:</p>
                                                                <div className="bg-green-50 p-3 rounded border border-green-200">
                                                                    {question.category === "fill-in-blanks" ? (
                                                                        <div className="space-y-2">
                                                                            {Object.entries(question.correctAnswer).map(([key, value]) => (
                                                                                <div key={key} className="flex">
                                                                                    <span className="font-medium mr-2">{key}:</span>
                                                                                    <span>{value}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <pre className="whitespace-pre-wrap">
                                        {typeof question.correctAnswer === 'string'
                                            ? question.correctAnswer
                                            : Array.isArray(question.correctAnswer)
                                                ? question.correctAnswer.map(opt => opt.text).join(", ")
                                                : JSON.stringify(question.correctAnswer, null, 2)
                                        }
                                      </pre>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-700 mb-2">User Answer:</p>
                                                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                                                    {question.category === "fill-in-blanks" ? (
                                                                        <div className="space-y-2">
                                                                            {Object.entries(question.userAnswer).map(([key, value]) => {
                                                                                const isCorrect = question.correctAnswer[key]?.toLowerCase() === value?.toLowerCase();
                                                                                return (
                                                                                    <div key={key} className="flex">
                                                                                        <span className="font-medium mr-2">{key}:</span>
                                                                                        <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                                                {value} {isCorrect ? <CheckCircle size={14} className="inline ml-1" /> : <XCircle size={14} className="inline ml-1" />}
                                              </span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <pre className="whitespace-pre-wrap">
                                 {typeof question.userAnswer === 'string'
                                     ? question.userAnswer
                                     : question.userAnswer?.text || ''}

                                      </pre>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-700 mb-2">Scoring:</p>
                                                                <p className="text-gray-600">
                                                                    Score: {Math.round(questionScore * 10) / 10} / {question.maxScore}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Manually Graded Questions</h2>

            <div className="space-y-6 mb-8">
                {examData.questionsWithAnswers
                    .filter(q => q.isCorrect === "manual-grading")
                    .map((question) => {
                        // Generate a unique key for this manual question
                        const uniqueKey = getUniqueQuestionKey(question.questionId, 'manual');

                        return (
                            <div key={uniqueKey} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-medium">{question.category}</h3>
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Max Score: {question.maxScore}
                  </span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-700 mb-2">{question.questionText}</p>
                                </div>

                                <div className="border-t border-b border-gray-200 py-4 my-4">
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">User Answer:</h4>
                                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                        <pre className="text-sm whitespace-pre-wrap">{question.userAnswer}</pre>
                                    </div>
                                </div>

                                {question.correctAnswer && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-600 mb-2">Reference Answer:</h4>
                                        <div className="bg-green-50 p-4 rounded border border-green-200">
                      <pre className="text-sm whitespace-pre-wrap">{
                          typeof question.correctAnswer === 'string'
                              ? question.correctAnswer
                              : JSON.stringify(question.correctAnswer, null, 2)
                      }</pre>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assign Score (out of {question.maxScore})
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max={question.maxScore}
                                            step="0.5"
                                            value={manualGrades[question.questionId] || 0}
                                            onChange={(e) => handleManualGradeChange(question.questionId, e.target.value)}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                        />
                                        <span className="ml-2 text-gray-500">/ {question.maxScore}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Speaking Test Section if available */}
            {examData.speakingTest && examData.speakingTest.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold mb-4">Speaking Test</h2>

                    <div className="space-y-6 mb-8">
                        {examData.speakingTest.map((speaking) => {
                            // Generate a unique key for this speaking question
                            const uniqueKey = getUniqueQuestionKey(speaking.questionId, 'speaking');

                            return (
                                <div key={uniqueKey} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-medium">{speaking.type}</h3>
                                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Max Score: {speaking.maxScore || 5}
                    </span>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-gray-700 mb-2">{speaking.question}</p>
                                    </div>

                                    {speaking.audioPath && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-600 mb-2">Audio Response:</h4>
                                            <audio controls className="w-full">
                                                <source src={`http://localhost:5001${speaking.audioPath}`}
                                                        type="audio/webm"/>
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Assign Score (out of {speaking.maxScore || 5})
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max={speaking.maxScore || 5}
                                                step="0.5"
                                                value={manualGrades[speaking.questionId] || 0}
                                                onChange={(e) => handleManualGradeChange(speaking.questionId, e.target.value)}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                            />
                                            <span className="ml-2 text-gray-500">/ {speaking.maxScore || 5}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors"
                >
                    <Save className="mr-2" size={18} />
                    Save and Submit Grades
                </button>
            </div>
        </div>
        </AdminLayout>

    );
};

export default ExamGradingPage;