import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from '../assets/hero.svg'; // Adjust the path as needed

const courses = [
    { id: 1, title: "Course 1", img: "https://via.placeholder.com/300" },
    { id: 2, title: "Course 2", img: "https://via.placeholder.com/300" },
    { id: 3, title: "Course 3", img: "https://via.placeholder.com/300" },
    { id: 4, title: "Course 4", img: "https://via.placeholder.com/300" },
    { id: 5, title: "Course 5", img: "https://via.placeholder.com/300" },
    { id: 6, title: "Course 6", img: "https://via.placeholder.com/300" }
];

export default function PopularCourse() {
    const [index, setIndex] = useState(0);
    const maxIndex = Math.ceil(courses.length / 3) - 1;

    const nextSlide = () => {
        if (index < maxIndex) {
            setIndex((prev) => prev + 1);
        }
    };

    const prevSlide = () => {
        if (index > 0) {
            setIndex((prev) => prev - 1);
        }
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

            <div className=" overflow-hidden">
                <motion.div
                    animate={{ x: `-${index * 100}%` }}
                    transition={{ ease: "easeOut", duration: 0.5 }}
                    className="flex gap-4"
                >
                    {courses.map((course) => (
                        <div key={course.id} className="w-1/3 border border-black flex-shrink-0 bg-white rounded-lg p-4">
                            <img src={heroImage} alt={course.title} className="p-4 border border-black rounded-xl object-cover" />
                            <h3 className="text-lg font-medium mt-2">{course.title}</h3>
                            <button className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-xl cursor-pointer transition">
                                Learn More
                            </button>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}