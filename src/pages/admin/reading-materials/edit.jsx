import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout.jsx";
import { GenericRepo } from "../../../repo/GenericRepo.js";
import { Api } from "../../../utils/Api.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';

const repo = new GenericRepo();

const questionTypes = [
    "mcq",
    "fill-in-blanks",
    "reorder",
    "reading-comprehension",
    "reading-writing-fill-in-the-blank",
];

export default function EditReadingMaterials() {

    const navigate = useNavigate();
    const { slug } = useParams();

    const [formData, setFormData] = useState({
        title: "",
        type: "mcq",
        passage: "",
        content: "",
        options: [{ text: "", isCorrect: false, order: 0 }],
        fileUrl: "",
        isPremium: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleOptionChange = (index, field, value) => {
        const updatedOptions = formData.options.map((option, i) =>
            i === index ? { ...option, [field]: value } : option
        );
        setFormData((prev) => ({ ...prev, options: updatedOptions }));
    };

    const addOption = () => {
        setFormData((prev) => ({
            ...prev,
            options: [...prev.options, { text: "", isCorrect: false, order: prev.options.length }],
        }));
    };

    const removeOption = (index) => {
        setFormData((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const getReadingMaterial = () => {
        repo.list(
            `${Api.GET_READING_MATERIAL}/${slug}`,
            "",
            (data) => {
                setFormData(data.readingMaterial);
            },
            (error) => {
                console.log("Error fetching data:", error);
            }
        );
    };

    useEffect(() => {
        getReadingMaterial(); // ✅ Runs only once when the component mounts
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        repo.update(
            `${Api.EDIT_READING_MATERIAL}/${formData.id}`,
            formData,
            (data) => {
                console.log('data', data);
                toast.success(data.message);
                navigate("/admin/reading-materials");
            },
            (error) => {
                console.log('error', error);
            }
        );
        console.log("Form Data Submitted:", formData);
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title Input */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700" htmlFor="title">
                            Question Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Question Title"
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    {/* Type Selector */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700" htmlFor="type">
                            Question Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        >
                            {questionTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type.replace(/-/g, " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Passage Text */}
                    {(formData.type === "reading-comprehension" ||
                        formData.type === "reading-writing-fill-in-the-blank") && (
                        <div>
                            <label className="block text-lg font-semibold text-gray-700" htmlFor="passage">
                                Passage Text
                            </label>
                            <textarea
                                id="passage"
                                name="passage"
                                value={formData.passage}
                                onChange={handleChange}
                                placeholder="Passage Text"
                                className="w-full p-2 border rounded-md"
                                required
                            ></textarea>
                        </div>
                    )}

                    {/* Content Text */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700" htmlFor="content">
                            Question Content
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Question Content"
                            className="w-full p-2 border rounded-md"
                            required
                        ></textarea>
                    </div>

                    {/* Options */}
                    {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                                placeholder="Option Text"
                                className="w-full p-2 border rounded-md"
                                required
                            />
                            {formData.type === "reorder" && (
                                <input
                                    type="text"
                                    value={option.order}
                                    onChange={(e) => handleOptionChange(index, "order", Number(e.target.value))}
                                    className="w-16 p-2 border rounded-md"
                                />
                            )}
                            {formData.type !== "reorder" && (
                                <input
                                    type="checkbox"
                                    checked={option.isCorrect}
                                    onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)}
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="text-red-500"
                            >
                                X
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addOption} className="text-blue-500">
                        + Add Option
                    </button>

                    {/* Premium Checkbox */}
                    <div>
                        <label className="inline-flex items-center text-lg font-semibold text-gray-700" htmlFor="isPremium">
                            <input
                                type="checkbox"
                                id="isPremium"
                                name="isPremium"
                                checked={formData.isPremium}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            Premium Content
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded-md cursor-pointer"
                    >
                        Update
                    </button>
                </form>
            </div>
        </AdminLayout>
    );

}
