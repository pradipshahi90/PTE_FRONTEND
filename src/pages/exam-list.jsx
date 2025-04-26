import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {useAuthStore} from "../utils/authStore.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const UserExamResults = () => {
    const { user } = useAuthStore();
    const [examResults, setExamResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchUserExams = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5001/api/exam-results/${user.id}`);
                setExamResults(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching exam results:', err);
                setError('Failed to load your exam results. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserExams();
    }, [user]);

    // Helper function to safely render answer content
    const renderAnswerContent = (answer) => {
        if (answer === null || answer === undefined) {
            return 'No answer provided';
        }

        if (typeof answer === 'string') {
            return answer;
        }

        if (typeof answer === 'object') {
            // If it's an object with a text property (like multiple choice)
            if (answer.text) {
                return answer.text;
            }

            // If it's an object with blank fields (fill-in-the-blanks)
            if (Object.keys(answer).some(key => key.includes('blank'))) {
                return (
                    <div className="space-y-2">
                        {Object.entries(answer).map(([key, value]) => (
                            <div key={key} className="flex">
                                <span className="font-medium mr-2">{key}:</span>
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>
                );
            }

            // Fallback for other object types
            return JSON.stringify(answer);
        }

        // Fallback for any other type
        return String(answer);
    };

    const viewExamDetails = (result) => {
        setSelectedResult(result);
        setActiveTab('overview');
    };

    const closeDetails = () => {
        setSelectedResult(null);
    };

    const getStatusBadge = (result) => {
        if (!result.isResultChecked) {
            return (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pending Review
        </span>
            );
        }

        const percentage = result.score?.percentage || 0;
        if (percentage >= 70) {
            return (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Passed
        </span>
            );
        } else {
            return (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Failed
        </span>
            );
        }
    };

    // Helper function to render correct answer based on question type
    const renderCorrectAnswer = (qa) => {
        if (qa.category === 'multiple-choice' && Array.isArray(qa.correctAnswer)) {
            return qa.correctAnswer[0]?.text || 'Not available';
        } else if (typeof qa.correctAnswer === 'object' && !Array.isArray(qa.correctAnswer)) {
            return (
                <div className="space-y-2">
                    {Object.entries(qa.correctAnswer).map(([key, value]) => (
                        <div key={key} className="flex">
                            <span className="font-medium mr-2">{key}:</span>
                            <span>{value}</span>
                        </div>
                    ))}
                </div>
            );
        } else {
            return qa.correctAnswer || 'Not available';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700">Loading your exam results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-red-600">Error</h2>
                    <p className="mt-2 text-gray-700">{error}</p>
                    <button
                        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
      <div className="container mx-auto">
          <Header />
          <div className="min-h-screen bg-gray-50 py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {!selectedResult ? (
                      <div>
                          <div className="mb-8">
                              <h1 className="text-3xl font-bold text-gray-900">My Exam Results</h1>
                              <p className="mt-2 text-gray-600">View all your submitted exams and their results</p>
                          </div>

                          {examResults.length === 0 ? (
                              <div className="text-center py-12 bg-white rounded-lg shadow">
                                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <h3 className="mt-2 text-lg font-medium text-gray-900">No Exam Results</h3>
                                  <p className="mt-1 text-gray-500">You haven't taken any exams yet.</p>
                              </div>
                          ) : (
                              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                  <ul className="divide-y divide-gray-200">
                                      {examResults.map((result) => (
                                          <li key={result._id}>
                                              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150">
                                                  <div className="flex items-center justify-between">
                                                      <div className="flex flex-col sm:flex-row sm:items-center">
                                                          <p className="text-sm font-medium text-blue-600 truncate">
                                                              {result.examId?.title || 'Unnamed Exam'}
                                                          </p>
                                                          <div className="mt-2 sm:mt-0 sm:ml-6">
                                                              {getStatusBadge(result)}
                                                          </div>
                                                      </div>
                                                      <div className="ml-2 flex-shrink-0 flex">
                                                          <button
                                                              onClick={() => viewExamDetails(result)}
                                                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                                          >
                                                              View Details
                                                          </button>
                                                      </div>
                                                  </div>
                                                  <div className="mt-2 sm:flex sm:justify-between">
                                                      <div className="sm:flex">
                                                          <p className="flex items-center text-sm text-gray-500">
                              <span className="truncate">
                                {result.isResultChecked
                                    ? `Score: ${result.totalMarks || 0} / ${result.score?.possibleScore || 0}`
                                    : 'Awaiting Review'}
                              </span>
                                                          </p>
                                                      </div>
                                                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                          <p>
                                                              Submitted on {format(new Date(result.submittedAt), 'MMM d, yyyy')}
                                                          </p>
                                                      </div>
                                                  </div>
                                              </div>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          )}
                      </div>
                  ) : (
                      <div>
                          <div className="flex items-center mb-6">
                              <button
                                  onClick={closeDetails}
                                  className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
                              >
                                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                  </svg>
                                  Back to Results
                              </button>
                              <h1 className="text-2xl font-bold text-gray-900">
                                  {selectedResult.examId?.title || 'Exam Result Details'}
                              </h1>
                          </div>

                          <div className="bg-white rounded-lg shadow overflow-hidden">
                              {/* Result Status Banner */}
                              <div className={`py-4 px-6 ${selectedResult.isResultChecked
                                  ? (selectedResult.score?.percentage >= 70 ? 'bg-green-50' : 'bg-red-50')
                                  : 'bg-yellow-50'}`}>
                                  <div className="flex items-center justify-between flex-wrap">
                                      <div className="flex items-center">
                                          {selectedResult.isResultChecked ? (
                                              <div className={`flex-shrink-0 rounded-full p-1 ${
                                                  selectedResult.score?.percentage >= 70 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                  <svg className={`h-6 w-6 ${
                                                      selectedResult.score?.percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}
                                                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      {selectedResult.score?.percentage >= 70 ? (
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                      ) : (
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                      )}
                                                  </svg>
                                              </div>
                                          ) : (
                                              <div className="flex-shrink-0 rounded-full p-1 bg-yellow-100">
                                                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                  </svg>
                                              </div>
                                          )}
                                          <div className="ml-3">
                                              <h3 className={`text-lg font-medium ${
                                                  !selectedResult.isResultChecked
                                                      ? 'text-yellow-800'
                                                      : (selectedResult.score?.percentage >= 70 ? 'text-green-800' : 'text-red-800')
                                              }`}>
                                                  {!selectedResult.isResultChecked
                                                      ? 'Pending Review'
                                                      : (selectedResult.score?.percentage >= 70 ? 'Passed' : 'Failed')}
                                              </h3>
                                              <div className="mt-1 text-sm">
                                                  {selectedResult.isResultChecked ? (
                                                      <p>
                                                          Final Score: <span className="font-semibold">{selectedResult.totalMarks || 0}</span> / {selectedResult.score?.possibleScore || 0}
                                                          (<span className="font-semibold">{selectedResult.score?.percentage || 0}%</span>)
                                                      </p>
                                                  ) : (
                                                      <p>Your exam is being reviewed by an administrator.</p>
                                                  )}
                                              </div>
                                          </div>
                                      </div>
                                      <div className="mt-2 sm:mt-0">
                                          <p className="text-sm">
                                              Submitted on {format(new Date(selectedResult.submittedAt), 'MMMM d, yyyy, h:mm a')}
                                          </p>
                                      </div>
                                  </div>
                              </div>

                              {/* Tabs */}
                              <div className="border-b border-gray-200">
                                  <nav className="flex -mb-px">
                                      <button
                                          onClick={() => setActiveTab('overview')}
                                          className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                                              activeTab === 'overview'
                                                  ? 'border-blue-500 text-blue-600'
                                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                          }`}
                                      >
                                          Overview
                                      </button>
                                      <button
                                          onClick={() => setActiveTab('questions')}
                                          className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                                              activeTab === 'questions'
                                                  ? 'border-blue-500 text-blue-600'
                                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                          }`}
                                      >
                                          Questions & Answers
                                      </button>
                                      {selectedResult.speakingTest?.length > 0 && (
                                          <button
                                              onClick={() => setActiveTab('speaking')}
                                              className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                                                  activeTab === 'speaking'
                                                      ? 'border-blue-500 text-blue-600'
                                                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                              }`}
                                          >
                                              Speaking Test
                                          </button>
                                      )}
                                  </nav>
                              </div>

                              {/* Tab Content */}
                              <div className="p-6">
                                  {activeTab === 'overview' && (
                                      <div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                              <div className="bg-gray-50 rounded-lg p-6">
                                                  <h3 className="text-lg font-medium text-gray-900 mb-2">Score Summary</h3>
                                                  <div className="flex flex-col space-y-2">
                                                      <div className="flex justify-between">
                                                          <span className="text-gray-500">Score:</span>
                                                          <span className="font-medium">
                              {selectedResult.isResultChecked ? selectedResult.totalMarks || 0 : 'Pending'}
                            </span>
                                                      </div>
                                                      <div className="flex justify-between">
                                                          <span className="text-gray-500">Total Possible:</span>
                                                          <span className="font-medium">{selectedResult.score?.possibleScore || 0}</span>
                                                      </div>
                                                      <div className="flex justify-between">
                                                          <span className="text-gray-500">Percentage:</span>
                                                          <span className="font-medium">
                              {selectedResult.isResultChecked ? `${selectedResult.score?.percentage || 0}%` : 'Pending'}
                            </span>
                                                      </div>
                                                  </div>

                                                  {selectedResult.isResultChecked && (
                                                      <div className="mt-4">
                                                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                              <div
                                                                  className={`h-2.5 rounded-full ${
                                                                      selectedResult.score?.percentage >= 70 ? 'bg-green-600' : 'bg-red-600'
                                                                  }`}
                                                                  style={{ width: `${selectedResult.score?.percentage || 0}%` }}
                                                              ></div>
                                                          </div>
                                                      </div>
                                                  )}
                                              </div>

                                              <div className="bg-gray-50 rounded-lg p-6">
                                                  <h3 className="text-lg font-medium text-gray-900 mb-2">Exam Details</h3>
                                                  <div className="flex flex-col space-y-2">
                                                      <div className="flex justify-between">
                                                          <span className="text-gray-500">Title:</span>
                                                          <span className="font-medium">{selectedResult.examId?.title || 'Unnamed Exam'}</span>
                                                      </div>
                                                      <div className="flex justify-between">
                                                          <span className="text-gray-500">Questions:</span>
                                                          <span className="font-medium">{selectedResult.questionsWithAnswers?.length || 0}</span>
                                                      </div>
                                                      <div className="flex justify-between">
                                                          <span className="text-gray-500">Speaking Tasks:</span>
                                                          <span className="font-medium">{selectedResult.speakingTest?.length || 0}</span>
                                                      </div>
                                                  </div>
                                              </div>

                                              <div className="bg-gray-50 rounded-lg p-6">
                                                  <h3 className="text-lg font-medium text-gray-900 mb-2">Status</h3>
                                                  <div className="flex flex-col space-y-4">
                                                      <div>
                                                          <span className="block text-gray-500">Review Status:</span>
                                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                              selectedResult.isResultChecked
                                                                  ? 'bg-green-100 text-green-800'
                                                                  : 'bg-yellow-100 text-yellow-800'
                                                          }`}>
                              {selectedResult.isResultChecked ? 'Reviewed' : 'Pending Review'}
                            </span>
                                                      </div>
                                                      <div>
                                                          <span className="block text-gray-500">Result:</span>
                                                          {selectedResult.isResultChecked ? (
                                                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                  selectedResult.score?.percentage >= 70
                                                                      ? 'bg-green-100 text-green-800'
                                                                      : 'bg-red-100 text-red-800'
                                                              }`}>
                                {selectedResult.score?.percentage >= 70 ? 'Passed' : 'Failed'}
                              </span>
                                                          ) : (
                                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Awaiting Result
                              </span>
                                                          )}
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  )}

                                  {activeTab === 'questions' && (
                                      <div>
                                          <h3 className="text-lg font-medium text-gray-900 mb-4">Questions & Answers</h3>

                                          <div className="space-y-6">
                                              {selectedResult.questionsWithAnswers.map((qa, index) => (
                                                  <div key={qa._id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                                                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                          <div className="flex justify-between items-center">
                                                              <h4 className="text-sm font-medium text-gray-900">Question {index + 1}</h4>
                                                              <div className="flex items-center">
                                <span className="mr-2 text-sm text-gray-500">
                                  {qa.isCorrect === 'true' ? 'Correct' :
                                      qa.isCorrect === 'false' ? 'Incorrect' :
                                          qa.isCorrect === 'partial' ? 'Partially Correct' : 'Manual Grading'}
                                </span>
                                                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                      qa.isCorrect === 'true' ? 'bg-green-100 text-green-800' :
                                                                          qa.isCorrect === 'false' ? 'bg-red-100 text-red-800' :
                                                                              qa.isCorrect === 'partial' ? 'bg-blue-100 text-blue-800' :
                                                                                  'bg-yellow-100 text-yellow-800'
                                                                  }`}>
                                  {qa.maxScore} point{qa.maxScore !== 1 ? 's' : ''}
                                </span>
                                                              </div>
                                                          </div>
                                                      </div>

                                                      <div className="px-4 py-3">
                                                          <div className="mb-4">
                                                              <h5 className="text-sm font-medium text-gray-700 mb-1">Question:</h5>
                                                              <p className="text-gray-900 whitespace-pre-line">{qa.questionText}</p>
                                                          </div>

                                                          <div className="mb-4">
                                                              <h5 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h5>
                                                              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                                  {renderAnswerContent(qa.userAnswer)}
                                                              </div>
                                                          </div>

                                                          {selectedResult.isResultChecked && (
                                                              <div>
                                                                  <h5 className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</h5>
                                                                  <div className="bg-green-50 p-3 rounded border border-green-200">
                                                                      {renderCorrectAnswer(qa)}
                                                                  </div>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  {activeTab === 'speaking' && (
                                      <div>
                                          <h3 className="text-lg font-medium text-gray-900 mb-4">Speaking Test</h3>

                                          <div className="space-y-6">
                                              {selectedResult.speakingTest.map((item, index) => (
                                                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                          <div className="flex justify-between items-center">
                                                              <h4 className="text-sm font-medium text-gray-900">
                                                                  {item.type} - Question {index + 1}
                                                              </h4>
                                                              <span className="text-sm text-gray-500">
                                Answered at {format(new Date(item.answeredAt), 'h:mm a')}
                              </span>
                                                          </div>
                                                      </div>

                                                      <div className="px-4 py-3">
                                                          <div className="mb-4">
                                                              <h5 className="text-sm font-medium text-gray-700 mb-1">Task:</h5>
                                                              <p className="text-gray-900">{item.question}</p>
                                                          </div>

                                                          <div>
                                                              <h5 className="text-sm font-medium text-gray-700 mb-2">Your Recording:</h5>
                                                              {item.audioPath ? (
                                                                  <audio
                                                                      controls
                                                                      className="w-full"
                                                                      src={`http://localhost:5001${item.audioPath}`}
                                                                  >
                                                                      Your browser does not support the audio element.
                                                                  </audio>
                                                              ) : (
                                                                  <p className="text-gray-500 italic">Audio not available</p>
                                                              )}
                                                          </div>
                                                      </div>
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
          <Footer />
      </div>
    );
};

export default UserExamResults;