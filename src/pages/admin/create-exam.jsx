import React, { useState } from 'react';
import AdminLayout from "../../layouts/AdminLayout.jsx";

const API_BASE_URL = 'http://localhost:5001/api';

const CreateExamForm = () => {
    const [examData, setExamData] = useState({
        title: '',
        description: '',
        sections: [
            {
                name: 'reading',
                duration: 30,
                questions: []
            }
        ],
        isActive: true
    });

    const [currentSection, setCurrentSection] = useState(0);
    const [questionType, setQuestionType] = useState('multiple-choice');
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({
        type: 'reading',
        category: 'multiple-choice',
        difficulty: 'medium',
        questionText: '',
        instructions: '',
        mediaType: 'none',
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ],
        maxScore: 1,
        tags: []
    });

    const [fillBlanksData, setFillBlanksData] = useState({
        blanks: 4,
        blankOptions: [
            { blank: 'blank1', choices: ['', '', '', ''] },
            { blank: 'blank2', choices: ['', '', '', ''] },
            { blank: 'blank3', choices: ['', '', '', ''] },
            { blank: 'blank4', choices: ['', '', '', ''] }
        ],
        correctAnswer: {
            blank1: '',
            blank2: '',
            blank3: '',
            blank4: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tagInput, setTagInput] = useState('');

    const handleExamChange = (e) => {
        const { name, value } = e.target;
        setExamData({ ...examData, [name]: value });
    };

    const handleSectionChange = (e, index) => {
        const { name, value } = e.target;
        const updatedSections = [...examData.sections];
        updatedSections[index] = { ...updatedSections[index], [name]: value };
        setExamData({ ...examData, sections: updatedSections });
    };

    const addSection = () => {
        setExamData({
            ...examData,
            sections: [
                ...examData.sections,
                {
                    name: '',
                    duration: 30,
                    questions: []
                }
            ]
        });
        setCurrentSection(examData.sections.length);
    };

    const removeSection = (index) => {
        const updatedSections = [...examData.sections];
        updatedSections.splice(index, 1);
        setExamData({ ...examData, sections: updatedSections });
        if (currentSection >= index && currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion({ ...currentQuestion, [name]: value });
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...currentQuestion.options];
        updatedOptions[index] = { ...updatedOptions[index], text: value };
        setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
    };

    const handleCorrectOptionChange = (index) => {
        const updatedOptions = currentQuestion.options.map((option, i) => ({
            ...option,
            isCorrect: i === index
        }));
        setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
    };

    const handleTagInput = (e) => {
        setTagInput(e.target.value);
    };

    const addTag = () => {
        if (tagInput.trim() !== '' && !currentQuestion.tags.includes(tagInput.trim())) {
            setCurrentQuestion({
                ...currentQuestion,
                tags: [...currentQuestion.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setCurrentQuestion({
            ...currentQuestion,
            tags: currentQuestion.tags.filter(t => t !== tag)
        });
    };

    const handleFillBlanksChange = (blankIndex, optionIndex, value) => {
        const updatedBlankOptions = [...fillBlanksData.blankOptions];
        updatedBlankOptions[blankIndex].choices[optionIndex] = value;
        setFillBlanksData({ ...fillBlanksData, blankOptions: updatedBlankOptions });
    };

    const handleCorrectBlankChange = (blank, value) => {
        setFillBlanksData({
            ...fillBlanksData,
            correctAnswer: { ...fillBlanksData.correctAnswer, [blank]: value }
        });
    };

    const updateBlanksCount = (count) => {
        const newCount = parseInt(count);
        if (newCount > 0 && newCount <= 10) {
            // Create new blank options structure
            const blankOptions = [];
            const correctAnswer = {};

            for (let i = 0; i < newCount; i++) {
                const blankKey = `blank${i+1}`;
                blankOptions.push({
                    blank: blankKey,
                    choices: ['', '', '', '']
                });
                correctAnswer[blankKey] = '';
            }

            setFillBlanksData({
                ...fillBlanksData,
                blanks: newCount,
                blankOptions,
                correctAnswer
            });
        }
    };

    const addQuestion = () => {
        let finalQuestion = { ...currentQuestion };

        if (currentQuestion.category === 'fill-in-blanks') {
            finalQuestion = {
                ...finalQuestion,
                options: fillBlanksData.blankOptions,
                correctAnswer: fillBlanksData.correctAnswer
            };
        }

        // Ensure proper structure for the question
        // Remove any unnecessary fields
        if (finalQuestion.category !== 'fill-in-blanks') {
            delete finalQuestion.correctAnswer;
        }

        if (finalQuestion.category !== 'summarize-text' && finalQuestion.category !== 'essay') {
            // Keep options for multiple-choice and fill-in-blanks
        } else {
            delete finalQuestion.options;
        }

        if (finalQuestion.mediaType === 'none') {
            delete finalQuestion.mediaUrl;
        }

        const updatedSections = [...examData.sections];
        updatedSections[currentSection] = {
            ...updatedSections[currentSection],
            questions: [...updatedSections[currentSection].questions, finalQuestion]
        };

        setExamData({ ...examData, sections: updatedSections });
        resetQuestionForm();
    };

    const resetQuestionForm = () => {
        setCurrentQuestion({
            type: examData.sections[currentSection].name || 'reading',
            category: 'multiple-choice',
            difficulty: 'medium',
            questionText: '',
            instructions: '',
            mediaType: 'none',
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            maxScore: 1,
            tags: []
        });

        setFillBlanksData({
            blanks: 4,
            blankOptions: [
                { blank: 'blank1', choices: ['', '', '', ''] },
                { blank: 'blank2', choices: ['', '', '', ''] },
                { blank: 'blank3', choices: ['', '', '', ''] },
                { blank: 'blank4', choices: ['', '', '', ''] }
            ],
            correctAnswer: {
                blank1: '',
                blank2: '',
                blank3: '',
                blank4: ''
            }
        });

        setShowQuestionForm(false);
    };

    const removeQuestion = (questionIndex) => {
        const updatedSections = [...examData.sections];
        updatedSections[currentSection].questions.splice(questionIndex, 1);
        setExamData({ ...examData, sections: updatedSections });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate that we have at least one question in each section
            for (const section of examData.sections) {
                if (!section.name) {
                    throw new Error("All sections must have a name");
                }

                if (section.questions.length === 0) {
                    throw new Error(`Section '${section.name}' must have at least one question`);
                }
            }

            // Make a copy of the exam data to send
            const examToSubmit = {
                title: examData.title,
                description: examData.description,
                sections: examData.sections,
                isActive: examData.isActive
            };

            console.log("Submitting exam data:", JSON.stringify(examToSubmit, null, 2));

            const response = await fetch(`${API_BASE_URL}/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(examToSubmit),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create exam');
            }

            alert('Exam created successfully!');

            // Reset form or redirect
            setExamData({
                title: '',
                description: '',
                sections: [
                    {
                        name: 'reading',
                        duration: 30,
                        questions: []
                    }
                ],
                isActive: true
            });
            setCurrentSection(0);

        } catch (error) {
            console.error('Error creating exam:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to load sample data
    const loadSampleData = () => {
        // Sample data for PTE Academic Practice Test 2
        const sampleData = {
            "title": "PTE Academic Practice Test 2",
            "description": "An engaging practice test focusing on reading, writing, and listening sections.",
            "sections": [
                {
                    "name": "reading",
                    "duration": 32,
                    "questions": [
                        {
                            "type": "reading",
                            "category": "multiple-choice",
                            "difficulty": "medium",
                            "questionText": "Read the passage and choose the correct option.\n\nThe Great Barrier Reef, located off the coast of Queensland in northeastern Australia, is the largest coral reef system in the world. Stretching over 2,300 kilometers, it can be seen from outer space and is often referred to as the single largest living organism on Earth. However, rising ocean temperatures have caused widespread coral bleaching, threatening this UNESCO World Heritage site.",
                            "instructions": "According to the passage, which statement is true about the Great Barrier Reef?",
                            "mediaType": "none",
                            "options": [
                                {
                                    "text": "It is located in Western Australia.",
                                    "isCorrect": false
                                },
                                {
                                    "text": "It is the largest coral reef system in the world.",
                                    "isCorrect": true
                                },
                                {
                                    "text": "It covers less than 1,000 kilometers.",
                                    "isCorrect": false
                                },
                                {
                                    "text": "It is immune to the effects of climate change.",
                                    "isCorrect": false
                                }
                            ],
                            "maxScore": 2,
                            "tags": ["reading", "environment", "australia", "geography"]
                        },
                        {
                            "type": "reading",
                            "category": "fill-in-blanks",
                            "difficulty": "hard",
                            "questionText": "Complete the text about artificial intelligence by selecting the appropriate words.\n\nArtificial intelligence (AI) has ______(blank1) rapidly in recent years, transforming many industries. Machine learning, a subset of AI, allows computers to ______(blank2) from data without being explicitly programmed. Deep learning, which uses neural networks with many ______(blank3), has led to breakthroughs in image and speech recognition. Despite these advances, many experts argue that we are still far from achieving ______(blank4) general intelligence.",
                            "instructions": "Select the most appropriate word for each blank.",
                            "mediaType": "none",
                            "options": [
                                {
                                    "blank": "blank1",
                                    "choices": ["evolved", "decreased", "disappeared", "reversed"]
                                },
                                {
                                    "blank": "blank2",
                                    "choices": ["learn", "forget", "deteriorate", "withdraw"]
                                },
                                {
                                    "blank": "blank3",
                                    "choices": ["layers", "failures", "problems", "restrictions"]
                                },
                                {
                                    "blank": "blank4",
                                    "choices": ["artificial", "human", "superior", "limited"]
                                }
                            ],
                            "correctAnswer": {
                                "blank1": "evolved",
                                "blank2": "learn",
                                "blank3": "layers",
                                "blank4": "artificial"
                            },
                            "maxScore": 4,
                            "tags": ["reading", "technology", "AI", "computer science"]
                        }
                    ]
                },
                {
                    "name": "writing",
                    "duration": 38,
                    "questions": [
                        {
                            "type": "writing",
                            "category": "summarize-text",
                            "difficulty": "medium",
                            "questionText": "Read the following text and summarize it in one sentence (5-75 words).\n\nSpace exploration has evolved dramatically since the first satellite, Sputnik 1, was launched in 1957. The Apollo missions landed humans on the Moon, and robotic rovers have explored Mars. The International Space Station represents a collaboration among multiple countries. Now, private companies like SpaceX and Blue Origin are developing technology for space tourism and potential Mars colonization. Despite budget constraints and technical challenges, the desire to explore beyond Earth continues to drive innovation in space technology.",
                            "instructions": "Provide a concise one-sentence summary of the text.",
                            "mediaType": "none",
                            "correctAnswer": "Space exploration has progressed from satellite launches and moon landings to international collaboration and private company involvement, with ongoing innovations despite challenges, all driven by humanity's persistent desire to explore beyond Earth.",
                            "maxScore": 5,
                            "tags": ["writing", "summarization", "space", "history", "technology"]
                        },
                        {
                            "type": "writing",
                            "category": "essay",
                            "difficulty": "hard",
                            "questionText": "In many countries, the proportion of older people is steadily increasing, while the birth rate is declining. Discuss the causes of these demographic changes and examine their social and economic implications for society.",
                            "instructions": "Write an essay of 250-300 words. Include an introduction, body paragraphs, and a conclusion.",
                            "mediaType": "none",
                            "maxScore": 15,
                            "tags": ["writing", "essay", "demographics", "society", "economics"]
                        }
                    ]
                },
                {
                    "name": "listening",
                    "duration": 43,
                    "questions": [
                        {
                            "type": "listening",
                            "category": "multiple-choice",
                            "difficulty": "easy",
                            "questionText": "Listen to the conversation about weekend plans and answer the question.",
                            "instructions": "What does the woman decide to do on Saturday?",
                            "mediaUrl": "https://example.com/audio/weekend_plans.mp3",
                            "mediaType": "audio",
                            "options": [
                                {
                                    "text": "Visit her parents",
                                    "isCorrect": false
                                },
                                {
                                    "text": "Go hiking with friends",
                                    "isCorrect": true
                                },
                                {
                                    "text": "Stay home and watch movies",
                                    "isCorrect": false
                                },
                                {
                                    "text": "Attend a concert",
                                    "isCorrect": false
                                }
                            ],
                            "maxScore": 1,
                            "tags": ["listening", "conversation", "leisure", "plans"]
                        },
                        {
                            "type": "listening",
                            "category": "fill-in-blanks",
                            "difficulty": "medium",
                            "questionText": "Listen to the lecture about climate change and fill in the missing words.",
                            "instructions": "Type the exact words you hear in each blank.",
                            "mediaUrl": "https://example.com/audio/climate_lecture.mp3",
                            "mediaType": "audio",
                            "options": [
                                {
                                    "blank": "blank1",
                                    "choices": ["emissions", "omissions", "commissions", "admissions"]
                                },
                                {
                                    "blank": "blank2",
                                    "choices": ["renewable", "removable", "remarkable", "reliable"]
                                },
                                {
                                    "blank": "blank3",
                                    "choices": ["sustainable", "sustained", "sustaining", "sustainability"]
                                },
                                {
                                    "blank": "blank4",
                                    "choices": ["impact", "effect", "affect", "influence"]
                                },
                                {
                                    "blank": "blank5",
                                    "choices": ["global", "local", "regional", "universal"]
                                }
                            ],
                            "correctAnswer": {
                                "blank1": "emissions",
                                "blank2": "renewable",
                                "blank3": "sustainable",
                                "blank4": "impact",
                                "blank5": "global"
                            },
                            "maxScore": 5,
                            "tags": ["listening", "environment", "climate change", "science", "education"]
                        }
                    ]
                }
            ],
            "isActive": true
        };

        setExamData(sampleData);
    };

    return (
        <AdminLayout>
            <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Create Exam</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="flex justify-end mb-4">
                <button
                    type="button"
                    onClick={loadSampleData}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                    Load Sample Data
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Exam Info */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Exam Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={examData.title}
                                onChange={handleExamChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={examData.description}
                                onChange={handleExamChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={examData.isActive}
                                    onChange={(e) => setExamData({ ...examData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Sections</h2>
                        <button
                            type="button"
                            onClick={addSection}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Add Section
                        </button>
                    </div>

                    {/* Section Tabs */}
                    <div className="flex mb-4 border-b overflow-x-auto">
                        {examData.sections.map((section, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`px-4 py-2 font-medium ${
                                    currentSection === index
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                onClick={() => setCurrentSection(index)}
                            >
                                {section.name || `Section ${index + 1}`}
                            </button>
                        ))}
                    </div>

                    {/* Current Section Content */}
                    <div className="space-y-4">
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={examData.sections[currentSection].name}
                                    onChange={(e) => handleSectionChange(e, currentSection)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., reading, writing, listening"
                                    required
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={examData.sections[currentSection].duration}
                                    onChange={(e) => handleSectionChange(e, currentSection)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    min="1"
                                    required
                                />
                            </div>

                            {examData.sections.length > 1 && (
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => removeSection(currentSection)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Questions List */}
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Questions</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowQuestionForm(true)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Add Question
                                </button>
                            </div>

                            {examData.sections[currentSection].questions.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No questions added yet</p>
                            ) : (
                                <ul className="space-y-2">
                                    {examData.sections[currentSection].questions.map((q, idx) => (
                                        <li key={idx} className="border rounded-md p-3 flex justify-between items-center">
                                            <div>
                                                <span className="font-medium">#{idx + 1} - {q.category} ({q.difficulty})</span>
                                                <p className="text-sm text-gray-600 truncate max-w-lg">
                                                    {q.questionText.substring(0, 100)}
                                                    {q.questionText.length > 100 ? '...' : ''}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(idx)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Form */}
                {showQuestionForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Add Question</h3>
                            <button
                                type="button"
                                onClick={resetQuestionForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Question Type & Category */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={currentQuestion.type}
                                        onChange={handleQuestionChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="reading">Reading</option>
                                        <option value="writing">Writing</option>
                                        <option value="listening">Listening</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={currentQuestion.category}
                                        onChange={(e) => {
                                            setQuestionType(e.target.value);
                                            handleQuestionChange(e);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="multiple-choice">Multiple Choice</option>
                                        <option value="fill-in-blanks">Fill in Blanks</option>
                                        <option value="summarize-text">Summarize Text</option>
                                        <option value="essay">Essay</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Difficulty
                                    </label>
                                    <select
                                        name="difficulty"
                                        value={currentQuestion.difficulty}
                                        onChange={handleQuestionChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question Text
                                </label>
                                <textarea
                                    name="questionText"
                                    value={currentQuestion.questionText}
                                    onChange={handleQuestionChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows="3"
                                    required
                                />
                            </div>

                            {/* Instructions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instructions
                                </label>
                                <input
                                    type="text"
                                    name="instructions"
                                    value={currentQuestion.instructions}
                                    onChange={handleQuestionChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Media Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Media Type
                                </label>
                                <select
                                    name="mediaType"
                                    value={currentQuestion.mediaType}
                                    onChange={handleQuestionChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="none">None</option>
                                    <option value="audio">Audio</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>

                            {currentQuestion.mediaType !== 'none' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Media URL
                                    </label>
                                    <input
                                        type="text"
                                        name="mediaUrl"
                                        value={currentQuestion.mediaUrl || ''}
                                        onChange={handleQuestionChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="https://example.com/media/file"
                                    />
                                </div>
                            )}

                            {/* Max Score */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Score
                                </label>
                                <input
                                    type="number"
                                    name="maxScore"
                                    value={currentQuestion.maxScore}
                                    onChange={handleQuestionChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={handleTagInput}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                                        placeholder="Add tag"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    {currentQuestion.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                                        >
                      {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 text-blue-500 hover:text-blue-700"
                                            >
                        &times;
                      </button>
                    </span>
                                    ))}
                                </div>
                            </div>

                            {/* Question Type Specific Inputs */}
                            {questionType === 'multiple-choice' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Options
                                    </label>

                                    {currentQuestion.options.map((option, idx) => (
                                        <div key={idx} className="flex items-center mb-2">
                                            <input
                                                type="radio"
                                                name="correctOption"
                                                checked={option.isCorrect}
                                                onChange={() => handleCorrectOptionChange(idx)}
                                                className="h-4 w-4 text-blue-600 mr-2"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder={`Option ${idx + 1}`}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {questionType === 'fill-in-blanks' && (
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Number of Blanks
                                        </label>
                                        <input
                                            type="number"
                                            value={fillBlanksData.blanks}
                                            onChange={(e) => updateBlanksCount(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            min="1"
                                            max="10"
                                        />
                                    </div>

                                    {fillBlanksData.blankOptions.map((blank, blankIdx) => (
                                        <div key={blankIdx} className="mb-6 border p-4 rounded-md">
                                            <h4 className="text-md font-medium mb-2">Blank {blankIdx + 1}</h4>

                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Correct Answer
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fillBlanksData.correctAnswer[blank.blank] || ''}
                                                    onChange={(e) => handleCorrectBlankChange(blank.blank, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Options
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {blank.choices.map((choice, choiceIdx) => (
                                                        <input
                                                            key={choiceIdx}
                                                            type="text"
                                                            value={choice}
                                                            onChange={(e) => handleFillBlanksChange(blankIdx, choiceIdx, e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 rounded-md"
                                                            placeholder={`Option ${choiceIdx + 1}`}
                                                            required
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {questionType === 'summarize-text' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correct Answer (Sample Summary)
                                    </label>
                                    <textarea
                                        name="correctAnswer"
                                        value={currentQuestion.correctAnswer || ''}
                                        onChange={(e) => setCurrentQuestion({
                                            ...currentQuestion,
                                            correctAnswer: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        rows="3"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Add Question
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Create Exam
                    </button>
                </div>
            </form>
        </div>
        </AdminLayout>

    );
};

export default CreateExamForm;