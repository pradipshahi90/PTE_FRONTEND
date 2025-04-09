import React, { useEffect, useState } from 'react';
import { Api } from "../utils/Api.js";
import toast from "react-hot-toast";
import { GenericRepo } from "../repo/GenericRepo.js";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/authStore.js";
import { Lock } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const Learn = () => {
    const navigate = useNavigate();
    const repo = new GenericRepo();
    const [readingMaterials, setReadingMaterials] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [reorderInputs, setReorderInputs] = useState({});
    const [results, setResults] = useState({});

    const getReadingMaterials = () => {
        repo.list(
            `${Api.GET_READING_MATERIAL}`,
            "",
            (data) => {
                console.log('Fetched data:', data.readingMaterials);
                setReadingMaterials(data.readingMaterials);

                // Initialize answers and results objects
                const initialAnswers = {};
                const initialReorderInputs = {};
                data.readingMaterials.forEach(material => {
                    initialAnswers[material.id] = null;
                    if (material.type === "reorder") {
                        initialReorderInputs[material.id] = "";
                    }
                });
                setUserAnswers(initialAnswers);
                setReorderInputs(initialReorderInputs);
            },
            (error) => {
                console.log("Error fetching data:", error);
                toast.error("Failed to load learning materials");
            }
        );
    };

    const handleOptionSelect = (materialId, optionText) => {
        setUserAnswers(prev => ({
            ...prev,
            [materialId]: optionText
        }));
    };

    const handleReorderInputChange = (materialId, value) => {
        setReorderInputs(prev => ({
            ...prev,
            [materialId]: value
        }));
    };

    const checkAnswer = (material) => {
        let isCorrect = false;

        if (material.type === "reorder") {
            // For reorder, check if the input matches the correct order
            const userOrderInput = reorderInputs[material.id].split(',').map(num => num.trim());

            if (userOrderInput.length === material.options.length) {
                const correctOrder = [...material.options].sort((a, b) => a.order - b.order).map(opt => opt.text);
                const userOrder = userOrderInput.map(index => {
                    const idx = parseInt(index) - 1;
                    return idx >= 0 && idx < material.options.length ? material.options[idx].text : null;
                });

                isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
            }
        } else {
            // For MCQ, fill-in-blanks, etc.
            const correctOption = material.options.find(opt => opt.isCorrect);
            isCorrect = userAnswers[material.id] === correctOption.text;
        }

        setResults(prev => ({
            ...prev,
            [material.id]: isCorrect
        }));

        toast[isCorrect ? 'success' : 'error'](
            isCorrect ? "Correct answer!" : "Incorrect, try again!"
        );
    };

    useEffect(() => {
        getReadingMaterials();
    }, []);

    const renderQuestion = (material) => {
        if (material.isPremium) {
            return (
                <div className="relative" key={material.id}>
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-70 backdrop-blur-md flex items-center justify-center z-10 rounded-lg">
                        <div className="flex flex-col items-center">
                            <Lock className="w-12 h-12 text-gray-500 mb-2" />
                            <p className="text-gray-700 font-semibold">Premium Content</p>
                            <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">
                                Upgrade to Access
                            </button>
                        </div>
                    </div>
                    {renderQuestionContent(material)}
                </div>
            );
        }

        return renderQuestionContent(material);
    };

    const renderQuestionContent = (material) => {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6" key={material.id}>
                <div className="mb-2 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{material.title}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {material.type.replace(/-/g, ' ')}
                    </span>
                </div>

                {material.passage && (
                    <div className="my-4 p-4 bg-gray-50 rounded-md">
                        <p className="text-gray-700">{material.passage}</p>
                    </div>
                )}

                <p className="text-gray-700 mb-4">{material.content}</p>

                {renderAnswerOptions(material)}

                {results[material.id] !== undefined && (
                    <div className={`mt-3 p-2 rounded ${results[material.id] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {results[material.id] ? 'Correct! Well done!' : 'Incorrect. Try again!'}
                    </div>
                )}
            </div>
        );
    };

    const renderAnswerOptions = (material) => {
        switch (material.type) {
            case "mcq":
            case "fill-in-blanks":
            case "reading-comprehension":
            case "reading-writing-fill-in-the-blank":
                return (
                    <>
                        <div className="space-y-2">
                            {material.options.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => !material.isPremium && handleOptionSelect(material.id, option.text)}
                                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                        userAnswers[material.id] === option.text
                                            ? 'bg-blue-100 border-blue-400'
                                            : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    {option.text}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => !material.isPremium && checkAnswer(material)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            disabled={!userAnswers[material.id]}
                        >
                            Check Answer
                        </button>
                    </>
                );
            case "reorder":
                return (
                    <>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {material.options.map((option, index) => (
                                    <div key={index} className="bg-gray-100 rounded-md p-3 text-center">
                                        <span className="font-bold text-gray-700">{index + 1}:</span> {option.text}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Enter the correct order (e.g., 1,3,2,4):
                                </label>
                                <input
                                    type="text"
                                    value={reorderInputs[material.id] || ''}
                                    onChange={(e) => !material.isPremium && handleReorderInputChange(material.id, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter numbers separated by commas"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => !material.isPremium && checkAnswer(material)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            disabled={!reorderInputs[material.id]}
                        >
                            Check Answer
                        </button>
                    </>
                );
            default:
                return <p>Unsupported question type</p>;
        }
    };

    return (
        <div className="container mx-auto flex flex-col gap-8">
            <Header/>
            <div className="">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Learning Materials</h1>
                    <p className="text-gray-600 mt-2">Test your knowledge with these interactive questions</p>
                </div>

                {readingMaterials.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {readingMaterials.map(material => renderQuestion(material))}
                    </div>
                )}
            </div>
            <Footer/>
        </div>
    );
};

export default Learn;