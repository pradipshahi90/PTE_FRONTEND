import { useState, useEffect } from 'react';
import { Clock, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Volume2 } from 'lucide-react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

const API_BASE_URL = 'http://localhost:5001/api';

export default function ExamInterface() {
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [examCompleted, setExamCompleted] = useState(false);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate(); // ✅ Call it at the top level


    // Load exam data from localStorage
    useEffect(() => {
        const examData = localStorage.getItem('selectedExam');
        if (examData) {
            const parsedExam = JSON.parse(examData);
            setExam(parsedExam);

            // Load timer state from localStorage
            const savedTimerState = localStorage.getItem('examTimerState');
            if (savedTimerState) {
                const { endTime, sectionIndex } = JSON.parse(savedTimerState);
                const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

                if (remaining <= 0) {
                    setExamCompleted(true);
                    setIsTimerRunning(false);
                    setTimeRemaining(0);
                } else {
                    setTimeRemaining(remaining);
                    setCurrentSectionIndex(sectionIndex);
                }
            } else {
                // Initialize timer for the first section
                setTimeRemaining(parsedExam.sections[0].duration * 60);
                // Save initial timer state
                const endTime = Date.now() + (parsedExam.sections[0].duration * 60 * 1000);
                localStorage.setItem('examTimerState', JSON.stringify({
                    endTime,
                    sectionIndex: 0
                }));
            }

            // Load saved answers
            const savedAnswers = localStorage.getItem('examAnswers');
            if (savedAnswers) {
                setAnswers(JSON.parse(savedAnswers));
            }
        }
    }, []);

    // Fetch questions from API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/questions`);
                console.log('response', response.data.data);
                setQuestions(response.data.data || []);
            } catch (error) {
                console.error('Error fetching questions:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // Timer effect
    useEffect(() => {
        if (!isTimerRunning || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    clearInterval(timer);
                    setIsTimerRunning(false);
                    setExamCompleted(true);
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTimerRunning, timeRemaining]);

    // Save timer state whenever it changes
    useEffect(() => {
        if (exam && isTimerRunning) {
            const endTime = Date.now() + (timeRemaining * 1000);
            localStorage.setItem('examTimerState', JSON.stringify({
                endTime,
                sectionIndex: currentSectionIndex
            }));
        }
    }, [timeRemaining, currentSectionIndex, exam, isTimerRunning]);

    // Save answers whenever they change
    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem('examAnswers', JSON.stringify(answers));
        }
    }, [answers]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleNextQuestion = () => {
        if (!exam) return;

        const currentSection = exam.sections[currentSectionIndex];
        if (currentQuestionIndex < currentSection.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (currentSectionIndex < exam.sections.length - 1) {
            // Move to next section
            setCurrentSectionIndex(currentSectionIndex + 1);
            setCurrentQuestionIndex(0);

            // Update timer for new section
            setTimeRemaining(exam.sections[currentSectionIndex + 1].duration * 60);

            // Save new timer state
            const endTime = Date.now() + (exam.sections[currentSectionIndex + 1].duration * 60 * 1000);
            localStorage.setItem('examTimerState', JSON.stringify({
                endTime,
                sectionIndex: currentSectionIndex + 1
            }));
        }
    };

    const handlePrevQuestion = () => {
        if (!exam) return;

        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (currentSectionIndex > 0) {
            // Move to previous section
            setCurrentSectionIndex(currentSectionIndex - 1);
            const prevSectionQuestionsCount = exam.sections[currentSectionIndex - 1].questions.length;
            setCurrentQuestionIndex(prevSectionQuestionsCount - 1);
        }
    };

    const handleMultipleChoiceAnswer = (questionId, optionId) => {
        if (examCompleted) return;

        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleFillInBlankAnswer = (questionId, blankKey, value) => {
        if (examCompleted) return;

        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...(prev[questionId] || {}),
                [blankKey]: value
            }
        }));
    };

    const handleTextAnswer = (questionId, value) => {
        if (examCompleted) return;

        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const calculateScore = () => {
        let totalScore = 0;
        let possibleScore = 0;

        questions.forEach(question => {
            const answer = answers[question._id];
            if (!answer) return;

            possibleScore += question.maxScore;

            if (question.category === 'multiple-choice') {
                // Find the selected option
                const selectedOption = question.options.find(opt => opt._id === answer);
                if (selectedOption && selectedOption.isCorrect) {
                    totalScore += question.maxScore;
                }
            } else if (question.category === 'fill-in-blanks') {
                // Check each blank
                let correctBlanks = 0;
                let totalBlanks = Object.keys(question.correctAnswer).length;

                for (const [key, correctValue] of Object.entries(question.correctAnswer)) {
                    const userValue = answer[key]?.toLowerCase().trim();
                    if (userValue === correctValue.toLowerCase().trim()) {
                        correctBlanks++;
                    }
                }

                // Proportional scoring
                if (totalBlanks > 0) {
                    totalScore += (correctBlanks / totalBlanks) * question.maxScore;
                }
            }
            // For essay and summarize-text types, we would typically need manual grading
            // or an AI-based scoring system which is beyond the scope here
        });

        return {
            score: Math.round(totalScore * 10) / 10, // Round to 1 decimal place
            possibleScore,
            percentage: possibleScore > 0 ? Math.round((totalScore / possibleScore) * 100) : 0
        };
    };

    const handlePlayAudio = (url) => {
        // In a real application, you'd implement actual audio playback
        console.log("Playing audio:", url);
        alert(`Playing audio from: ${url}`);
        // const audio = new Audio(url);
        // audio.play();
    };

    const handleSubmit = () => {
        setExamCompleted(true);
        setIsTimerRunning(false);
        localStorage.removeItem('examTimerState');

        // Calculate score
        const finalScore = calculateScore();
        setScore(finalScore);

        // Create a structured object with all exam data
        const examResults = {
            examId: exam?._id,
            examTitle: exam?.title,
            submittedAt: new Date().toISOString(),
            score: finalScore,
            questionsWithAnswers: questions.map(question => {
                const answer = answers[question._id];

                let formattedAnswer = null;
                let isCorrect = null;

                if (question.category === 'multiple-choice') {
                    const selectedOption = question.options.find(opt => opt._id === answer);
                    console.log('selectedOption',selectedOption);
                    formattedAnswer = selectedOption ? {
                        optionId: selectedOption._id,
                        text: selectedOption.text
                    } : null;
                    isCorrect = selectedOption && selectedOption.isCorrect;
                }
                else if (question.category === 'fill-in-blanks') {
                    formattedAnswer = answer || null;

                    // Calculate how many blanks were answered correctly
                    if (answer) {
                        let correctCount = 0;
                        let totalBlanks = Object.keys(question.correctAnswer).length;

                        for (const [key, correctValue] of Object.entries(question.correctAnswer)) {
                            const userValue = answer[key]?.toLowerCase().trim();
                            if (userValue === correctValue.toLowerCase().trim()) {
                                correctCount++;
                            }
                        }

                        isCorrect = correctCount === totalBlanks ? true :
                            correctCount > 0 ? 'partial' : false;
                    }
                }
                else if (question.category === 'essay' || question.category === 'summarize-text') {
                    formattedAnswer = answer || null;
                    isCorrect = 'manual-grading';
                }
                else {
                    formattedAnswer = answer || null;
                }

                return {
                    questionId: question._id,
                    category: question.category,
                    questionText: question.questionText || question.text,
                    maxScore: question.maxScore,
                    userAnswer: formattedAnswer,
                    correctAnswer: question.category === 'multiple-choice' ?
                        question.options.filter(opt => opt.isCorrect).map(opt => ({ optionId: opt._id, text: opt.text })) :
                        question.correctAnswer,
                    isCorrect: isCorrect
                };
            })
        };

        // Store in localStorage
        localStorage.setItem('lastExamResults', JSON.stringify(examResults));

        // Also log to console for debugging
        console.log("Exam results stored in localStorage:", examResults);
        console.log("Final score:", finalScore);
    };

    const handleFinishAndGoToSpeaking = () => {
        handleSubmit(); // Submit the current exam
        navigate('/exam/speaking-test'); // Navigate to speaking test
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-2xl text-gray-600">Loading exam...</div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-2xl text-red-600">No exam found in storage</div>
            </div>
        );
    }

    const currentSection = exam.sections[currentSectionIndex];
    const currentQuestionId = currentSection?.questions[currentQuestionIndex];
    const currentQuestion = questions.find(q => q._id === currentQuestionId);

    // Render question content based on the question type
    const renderQuestionContent = () => {
        if (!currentQuestion) {
            return (
                <div className="p-6 text-center">
                    <AlertCircle className="mx-auto w-12 h-12 text-orange-500 mb-3" />
                    <p className="text-gray-600">Question data not found. ID: {currentQuestionId}</p>
                </div>
            );
        }

        return (
            <div className="p-6">
                {/* Media Player for audio/video */}
                {currentQuestion.mediaType !== 'none' && currentQuestion.mediaUrl && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                        {currentQuestion.mediaType === 'audio' ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePlayAudio(currentQuestion.mediaUrl)}
                                    className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </button>
                                <div>
                                    <div className="font-medium">Audio Recording</div>
                                    <div className="text-sm text-gray-500">Click to play audio</div>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-gray-200 flex items-center justify-center rounded">
                                <p className="text-gray-500">Video would play here</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Question Text */}
                <div className="mb-6">
                    <div className="text-lg font-medium mb-4 whitespace-pre-line">{currentQuestion.questionText}</div>
                    {currentQuestion.instructions && (
                        <div className="text-gray-700 mb-4 italic">{currentQuestion.instructions}</div>
                    )}
                </div>

                {/* Question Type-specific UI */}
                {currentQuestion.category === 'multiple-choice' && (
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, optionIndex) => (
                            <label
                                key={option._id || `option-${optionIndex}`}
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                    answers[currentQuestion._id] === (option._id || optionIndex) ?
                                        'border-indigo-500 bg-indigo-50' :
                                        'border-gray-200 hover:bg-gray-50'
                                } ${examCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion._id}`}
                                    checked={answers[currentQuestion._id] === (option._id || optionIndex)}
                                    onChange={() => handleMultipleChoiceAnswer(currentQuestion._id, option._id || optionIndex)}
                                    className="w-4 h-4 text-indigo-600"
                                    disabled={examCompleted}
                                />
                                <span className="ml-3">{option.text}</span>
                            </label>
                        ))}
                    </div>
                )}

                {currentQuestion.category === 'fill-in-blanks' && Array.isArray(currentQuestion.options) && (
                    <div className="space-y-6">
                        {currentQuestion.options.map((blankOption, blankIndex) => (
                            <div key={`blank-${blankIndex}`} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {blankOption.blank || `Blank ${blankIndex + 1}`}
                                </label>
                                <select
                                    value={answers[currentQuestion._id]?.[blankOption.blank || `blank${blankIndex + 1}`] || ''}
                                    onChange={(e) => handleFillInBlankAnswer(
                                        currentQuestion._id,
                                        blankOption.blank || `blank${blankIndex + 1}`,
                                        e.target.value
                                    )}
                                    disabled={examCompleted}
                                    className={`w-full p-3 border rounded-md ${examCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <option value="">Select an answer</option>
                                    {blankOption.choices?.map((choice, choiceIndex) => (
                                        <option key={`choice-${blankIndex}-${choiceIndex}`} value={choice}>
                                            {choice}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                {(currentQuestion.category === 'essay' || currentQuestion.category === 'summarize-text') && (
                    <div className="space-y-2">
            <textarea
                value={answers[currentQuestion._id] || ''}
                onChange={(e) => handleTextAnswer(currentQuestion._id, e.target.value)}
                disabled={examCompleted}
                className={`w-full p-4 border rounded-md h-64 resize-none ${examCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder={`Enter your ${currentQuestion.category === 'essay' ? 'essay' : 'summary'} here...`}
            />
                        <div className="text-right text-sm text-gray-500">
                            {answers[currentQuestion._id]?.length || 0} characters
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-indigo-600 text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">{exam.title}</h1>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-700 animate-pulse' : 'bg-indigo-700'}`}>
                            <Clock className="w-5 h-5" />
                            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Submit Exam
                        </button>
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto py-3">
                    <div className="flex gap-2 items-center mb-2">
                        {exam.sections.map((section, idx) => (
                            <div key={section._id} className="flex items-center">
                                {idx > 0 && <span className="mx-2 text-gray-400">→</span>}
                                <span className={`font-medium capitalize ${idx === currentSectionIndex ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {section.name}
                </span>
                            </div>
                        ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{
                                width: `${(((currentSectionIndex * 100) +
                                        (currentQuestionIndex / currentSection.questions.length * 100)) /
                                    exam.sections.length)}%`
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="container mx-auto py-8 px-4">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Section and question title */}
                        <div className="bg-gray-50 border-b p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 capitalize">
                                        {currentSection.name} - Question {currentQuestionIndex + 1} of {currentSection.questions.length}
                                    </h2>
                                    {currentQuestion && (
                                        <div className="flex mt-1 gap-3">
                                            <span className="px-2 py-1 rounded bg-gray-200 text-xs font-medium">{currentQuestion.type}</span>
                                            <span className="px-2 py-1 rounded bg-gray-200 text-xs font-medium">{currentQuestion.category}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                        {currentQuestion.difficulty}
                      </span>
                                        </div>
                                    )}
                                </div>
                                {currentQuestion && (
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Max Score</div>
                                        <div className="font-bold text-indigo-600">{currentQuestion.maxScore} points</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Question content */}
                        {renderQuestionContent()}

                        {/* Navigation */}
                        <div className="bg-gray-50 border-t p-4 flex justify-between">
                            <button
                                onClick={handlePrevQuestion}
                                disabled={currentSectionIndex === 0 && currentQuestionIndex === 0 || examCompleted}
                                className={`flex items-center px-4 py-2 rounded-md font-medium ${
                                    currentSectionIndex === 0 && currentQuestionIndex === 0 || examCompleted
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                Previous
                            </button>
                            <button
                                onClick={
                                    (currentSectionIndex === exam.sections.length - 1 &&
                                        currentQuestionIndex === currentSection.questions.length - 1) ||
                                    examCompleted
                                        ? handleFinishAndGoToSpeaking
                                        : handleNextQuestion
                                }
                                className="flex items-center px-4 py-2 rounded-md font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {(currentSectionIndex === exam.sections.length - 1 &&
                                    currentQuestionIndex === currentSection.questions.length - 1) ||
                                examCompleted
                                    ? (
                                        <>
                                            Move to Speaking Test
                                            <ChevronRight className="w-5 h-5 ml-1" />
                                        </>
                                    )
                                    : (
                                        <>
                                            Next
                                            <ChevronRight className="w-5 h-5 ml-1" />
                                        </>
                                    )
                                }
                            </button>
                        </div>
                    </div>
            </main>
        </div>
    );
}