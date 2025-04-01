import React, { useState } from "react";
import partners from '../assets/partners.svg';

const courses = [
    { id: 1, title: "Course 1", img: "https://via.placeholder.com/300" },
    { id: 2, title: "Course 2", img: "https://via.placeholder.com/300" },
    { id: 3, title: "Course 3", img: "https://via.placeholder.com/300" },
    { id: 4, title: "Course 4", img: "https://via.placeholder.com/300" },
    { id: 5, title: "Course 5", img: "https://via.placeholder.com/300" },
    { id: 6, title: "Course 6", img: "https://via.placeholder.com/300" }
];

export default function Partners() {
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
            <div className="flex items-center justify-center mb-4">
                <h2 className="text-2xl font-semibold text-center">Our Partners</h2>
            </div>
            <div className="flex justify-center">
                <img src={partners}/>
            </div>

        </div>
    );
}