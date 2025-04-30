import React, { useEffect, useState } from 'react';
import { Api } from "../utils/Api.js";
import toast from "react-hot-toast";
import { GenericRepo } from "../repo/GenericRepo.js";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/authStore.js";
import {ChevronLeft, ChevronRight, Lock} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import PaymentModal from "../components/PaymentModal.jsx";
import axios from "axios";
import {motion} from "framer-motion";

const Learn = () => {
    const navigate = useNavigate();
    const repo = new GenericRepo();
    const [readingMaterials, setReadingMaterials] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [reorderInputs, setReorderInputs] = useState({});
    const [results, setResults] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const currentUser = useAuthStore.getState().user;
    const [courses, setCourses] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/courses/get-courses");
                setCourses(res.data.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    const maxIndex = Math.max(0, Math.ceil(courses.length / 3) - 1);

    const nextSlide = () => {
        if (index < maxIndex) setIndex((prev) => prev + 1);
    };

    const prevSlide = () => {
        if (index > 0) setIndex((prev) => prev - 1);
    };


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
        if(!currentUser){
            toast.error("Please login first");
            return;
        }
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
        const isLoggedIn = !!currentUser;
        const isPremiumLocked = material.isPremium && (!isLoggedIn || !currentUser.is_premium_purchased);

        const handleLockedClick = () => {
            if (!isLoggedIn) {
                toast.error("Please login first");
            } else {
                console.log('haha');
                setShowPaymentModal(true);
            }
        };

        return (
            <div className="relative" key={material.id}>
                {material.isPremium && isPremiumLocked && (
                    <div
                        className="absolute inset-0 bg-gray-100 bg-opacity-70 backdrop-blur-md flex items-center justify-center z-10 rounded-lg cursor-pointer"
                        onClick={handleLockedClick}
                    >
                        <div className="flex flex-col items-center pointer-events-none">
                            <Lock className="w-12 h-12 text-gray-500 mb-2" />
                            <p className="text-gray-700 font-semibold">Premium Content</p>
                            {isLoggedIn && (
                                <button
                                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition pointer-events-auto"
                                >
                                    Upgrade to Access
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Disable interaction when locked */}
                <div  className={isPremiumLocked ? 'pointer-events-none select-none' : ''}>
                    {renderQuestionContent(material)}
                </div>

                {showPaymentModal && (
                    <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
                )}
            </div>
        );
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
                            className="mt-4 cursor-pointer   px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
            <div className="relative w-full mx-auto overflow-hidden p-6">
                <h2 className="text-2xl font-semibold">Practise Courses</h2>
                <p className="text-gray-400 mb-4">Download these courses and get your desired score. </p>
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={prevSlide}
                        disabled={index === 0}
                        className={`p-2 rounded-full transition ${index === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600"/>
                    </button>

                    <button
                        onClick={nextSlide}
                        disabled={index === maxIndex}
                        className={`p-2 rounded-full transition ${index === maxIndex ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
                    >
                        <ChevronRight className="w-6 h-6 text-gray-600"/>
                    </button>
                </div>

                <div className="overflow-hidden">
                    <motion.div
                        animate={{x: `-${index * 100}%`}}
                        transition={{ease: "easeOut", duration: 0.5}}
                        className="flex gap-4"
                    >
                        {courses.map((course) => (
                            <div key={course._id}
                                 className="w-1/3 border border-black flex-shrink-0 bg-white rounded-lg p-4">
                                <img src={course.course_image} alt={course.course_name}
                                     className="p-4 border border-black rounded-xl object-cover w-full h-48"/>
                                <h3 className="text-lg font-medium mt-2">{course.course_name}</h3>
                                <a
                                    href={course.course_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 w-full block text-center px-4 py-2 bg-blue-500 text-white rounded-xl cursor-pointer transition hover:bg-blue-600"
                                >
                                    Learn More
                                </a>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

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