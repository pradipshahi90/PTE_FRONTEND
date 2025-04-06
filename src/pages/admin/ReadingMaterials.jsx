import React, {useEffect, useRef, useState} from 'react';
import { GenericRepo } from "../../repo/GenericRepo.js";
import { Api } from "../../utils/Api.js";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import DeleteConfirmation from "../../components/DeleteConfirmation.jsx";
import { Search } from 'lucide-react';

const App = () => {
    const repo = new GenericRepo();
    const [questions, setQuestions] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemId, setItemId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debounceRef = useRef(null);
    let debounceTimer;


    const getReadingMaterials = () => {
        repo.list(
            `${Api.GET_READING_MATERIAL}`,
            "",
            (data) => {
                console.log('Fetched data:', data.readingMaterials);
                setQuestions(data.readingMaterials); // ✅ Correct way to update state
            },
            (error) => {
                console.log("Error fetching data:", error);
            }
        );
    };

    const filterReadingMaterials = (value) => {
        repo.list(
            `${Api.GET_READING_MATERIAL}/filter`,
            value,
            (data) => {
                setQuestions(data.readingMaterials);
            },
            (error) => {
                console.log("Error fetching data:", error);
            }
        );
    };
    useEffect(() => {
        getReadingMaterials(); // ✅ Runs only once when the component mounts
    }, []);

    // Function to toggle answer visibility
    const toggleAnswer = (id) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === id ? { ...q, showAnswer: !q.showAnswer } : q
            )
        );
    };

    // Example function that handles the deletion of the item by ID
    const handleDelete = (id) => {
        repo.destroy(
            `${Api.GET_READING_MATERIAL}/${id}`,
            (data) =>{
                console.log('data', data);
                closeDeleteModal();
                getReadingMaterials();
            },
            (error)=>{
                console.log('error',error);
                closeDeleteModal();
            }

        )
    };

    // Open the delete modal and set the item ID
    const openDeleteModal = (id) => {
        setItemId(id);
        setShowDeleteModal(true);
    };

    // Close the delete modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
    };



    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debounceApiCall(value);
    };

    const debounceApiCall = (value) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (value.trim() === '') {
                getReadingMaterials();
            } else {
                filterReadingMaterials(value);
            }
        }, 300);
    };


    return (
        <AdminLayout>

            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Reading Materials</h1>
                <div className="flex mb-6 justify-between gap-6 items-center">
                    <div className="relative w-90">
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full px-4 py-3 pl-12 rounded-xl shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-gray-400"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all text-sm"
                        >
                            Search
                        </button>
                    </div>
                    <a href="/admin/reading-materials/add" className='bg-blue-500 text-white px-4 py-2 rounded-lg'>+ Add
                        new</a>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {questions.length > 0 ? (
                        questions.map((question) => (
                            <div key={question.id}
                                 className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                                <h2 className="text-xl font-semibold text-gray-800">{question.title}</h2>
                                <p className="text-gray-600 mt-2">{question.content}</p>

                                {/* Display options */}
                                <QuestionDisplay question={question}/>

                                {/* Show Answer Button */}
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={() => toggleAnswer(question.id)}
                                        className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300"
                                    >
                                        {question.showAnswer ? "Hide Answer" : "Show Answer"}
                                    </button>
                                </div>

                                {/* Show the answers if the button is clicked */}
                                {question.showAnswer && <AnswerDisplay options={question.options || []} type={question.type} />}

                                {/* Edit/Delete Buttons */}
                                <div className="flex justify-between items-center mt-4">
                                    <a href={`/admin/reading-materials/edit/${question.slug}`}
                                       className="bg-yellow-500 text-white py-1 px-4 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                                    >
                                        Edit
                                    </a>
                                    <button onClick={() => openDeleteModal(question.id)}
                                            className="bg-red-500 text-white py-1 px-4 cursor-pointer rounded-lg hover:bg-red-600 transition-all duration-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No Materials Found</p>
                    )}
                </div>
            </div>
            {showDeleteModal && (
                <DeleteConfirmation
                    id={itemId}
                    onDelete={handleDelete}
                    onClose={closeDeleteModal}
                />
            )}
        </AdminLayout>

    );
};

// QuestionDisplay handles rendering different types of questions
const QuestionDisplay = ({ question }) => {
    if (!question) return null;

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800">Question Type: {question.type}</h3>
            {/* Display Options */}
            {question.type === 'reorder' ? (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Reorder the following:</h3>
                    <ul className="list-disc pl-5">
                        {(question.options || []).map((option, index) => (
                            <li key={index} className="text-gray-700">{option.text}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    showDeleteModal<h3 className="text-lg font-semibold text-gray-800">Options:</h3>
                    <ul className="list-disc pl-5">
                        {(question.options || []).map((option, index) => (
                            <li key={index} className="text-gray-700">{option.text}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

    );
};

// AnswerDisplay component to show the correct answers
const AnswerDisplay = ({ options, type }) => {
    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-green-500">Correct Answer:</h3>
            <ul className="list-disc pl-5">
                {(options || []).map((option, index) => {
                    if (type === "reorder") {
                        return (
                            <li key={index} className="text-gray-700">{option.order}</li>
                        );
                    } else {
                        return (
                            option.isCorrect && (
                                <li key={index} className="text-gray-700">{option.text}</li>
                            )
                        );
                    }
                })}
            </ul>

        </div>
    );
};


export default App;
