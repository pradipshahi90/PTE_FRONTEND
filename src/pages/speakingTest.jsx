import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader, AlertTriangle } from 'lucide-react';
import {useAuthStore} from "../utils/authStore.js";
import axios from "axios";

const SpeakingTest = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingComplete, setRecordingComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Fetch speaking questions from the API
    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:5001/api/speaking');
                if (!response.ok) {
                    throw new Error('Failed to fetch speaking questions');
                }
                const data = await response.json();
                setQuestions(data);

                // Select a random question
                if (data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    setCurrentQuestion(data[randomIndex]);
                } else {
                    setError('No speaking questions available');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // Handle start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Reset audio data
            audioChunksRef.current = [];
            setAudioBlob(null);
            setAudioUrl(null);
            setRecordingComplete(false);

            // Create new media recorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);

                setAudioBlob(audioBlob);
                setAudioUrl(audioUrl);
                setRecordingComplete(true);

                // Stop all audio tracks
                stream.getTracks().forEach(track => track.stop());
            });

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please check your browser permissions.');
        }
    };

    // Handle stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Toggle recording
    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // Handle submission
    const handleSubmit = async () => {
        const { user } = useAuthStore.getState(); // get the logged-in user

        if (!audioBlob || !currentQuestion || !user) return;

        setSubmitting(true);

        try {
            const examResultsString = localStorage.getItem('lastExamResults');
            let examResults = examResultsString ? JSON.parse(examResultsString) : null;

            if (!examResults) {
                examResults = {
                    submittedAt: new Date().toISOString(),
                    questionsWithAnswers: []
                };
            }

            // Filter out questions with null userAnswer
            examResults.questionsWithAnswers = examResults.questionsWithAnswers.filter(
                question => question.userAnswer !== null
            );

            // Remove duplicate questions based on questionText
            const uniqueQuestionsMap = new Map();

            examResults.questionsWithAnswers.forEach((q) => {
                if (!uniqueQuestionsMap.has(q.questionText)) {
                    uniqueQuestionsMap.set(q.questionText, q);
                }
            });

            // Now set the questions with unique questionText only
            examResults.questionsWithAnswers = Array.from(uniqueQuestionsMap.values());

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = async () => {
                const base64AudioData = reader.result;

                const speakingResponse = {
                    questionId: currentQuestion._id,
                    type: currentQuestion.type,
                    question: currentQuestion.question,
                    audioData: base64AudioData,
                    answeredAt: new Date().toISOString()
                };

                examResults.speakingTest = examResults.speakingTest || [];
                examResults.speakingTest.push(speakingResponse);

                const fullExamResults = {
                    userId: user.id,
                    ...examResults
                };

                console.log('examResults', examResults);

                // Save to localStorage
                localStorage.setItem('lastExamResults', JSON.stringify(fullExamResults));

                // 🔥 POST to your backend API
                await axios.post('http://localhost:5001/api/exam-results', fullExamResults); // adjust URL if hosted differently

                console.log("✅ Speaking test submission successful!");
                setSubmitting(false);
                setSubmitted(true);
            };
        } catch (err) {
            console.error('❌ Error saving speaking test:', err);
            setError('Failed to save your speaking response');
            setSubmitting(false);
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading speaking test...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Speaking Test</h2>
                <p className="text-gray-600 mb-6">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900">Speaking Test</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Please read or respond to the question below
                    </p>
                </div>

                {/* Question Card */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
                    <div className="p-6">
                        <div className="flex items-center mb-4">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm mr-3">
                {currentQuestion?.type.charAt(0)}
              </span>
                            <span className="font-medium text-indigo-800">{currentQuestion?.type}</span>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-4">{currentQuestion?.question}</h2>

                        {/* Display image if available */}
                        {currentQuestion?.imageUrl && (
                            <div className="mb-6 flex justify-center">
                                <img
                                    src={currentQuestion.imageUrl}
                                    alt="Question visual"
                                    className="rounded-md max-h-64 object-contain"
                                />
                            </div>
                        )}

                        {/* Duration info */}
                        <div className="flex items-center text-sm text-gray-500 mb-6">
                            <span className="mr-2">⏱️</span>
                            <span>Suggested time: {currentQuestion?.duration || 60} seconds</span>
                        </div>

                        {/* Audio Controls */}
                        <div className="flex flex-col items-center mb-6">
                            {!submitted && (
                                <button
                                    onClick={toggleRecording}
                                    disabled={submitting}
                                    className={`flex items-center justify-center h-16 w-16 rounded-full mb-4 transition-colors ${
                                        isRecording
                                            ? 'bg-red-600 hover:bg-red-700 text-white pulse-animation'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    }`}
                                >
                                    {isRecording ? (
                                        <MicOff className="h-8 w-8" />
                                    ) : (
                                        <Mic className="h-8 w-8" />
                                    )}
                                </button>
                            )}

                            <p className="text-sm font-medium text-gray-600">
                                {submitted ? 'Submission complete!' :
                                    isRecording
                                        ? 'Recording... Click to stop'
                                        : recordingComplete
                                            ? 'Recording complete'
                                            : 'Click to start recording'}
                            </p>
                        </div>

                        {/* Audio Player (if recording is complete) */}
                        {recordingComplete && audioUrl && !submitted && (
                            <div className="mb-6">
                                <audio src={audioUrl} controls className="w-full" />
                            </div>
                        )}

                        {/* Success message */}
                        {submitted && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">
                                            Your response has been saved successfully!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                {!submitted && (
                    <div className="flex justify-center">
                        <button
                            onClick={handleSubmit}
                            disabled={!recordingComplete || submitting}
                            className={`flex items-center px-6 py-2 rounded-md font-medium ${
                                !recordingComplete || submitting
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit
                                    <Send className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* CSS for pulsing animation */}
            <style jsx>{`
                .pulse-animation {
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
                    }
                }
            `}</style>
        </div>
    );
};

export default SpeakingTest;