import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";


export default function PopularCourse() {
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

    return (
        <div className="relative w-full mx-auto overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevSlide}
                    disabled={index === 0}
                    className={`p-2 rounded-full transition ${index === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-2xl font-semibold">Popular Courses</h2>
                <button
                    onClick={nextSlide}
                    disabled={index === maxIndex}
                    className={`p-2 rounded-full transition ${index === maxIndex ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="overflow-hidden">
                <motion.div
                    animate={{ x: `-${index * 100}%` }}
                    transition={{ ease: "easeOut", duration: 0.5 }}
                    className="flex gap-4"
                >
                    {courses.map((course) => (
                        <div key={course._id} className="w-1/3 border border-black flex-shrink-0 bg-white rounded-lg p-4">
                            <img src={course.course_image} alt={course.course_name} className="p-4 border border-black rounded-xl object-cover w-full h-48" />
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
    );
}
