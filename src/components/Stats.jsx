import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function Stats() {
    const [offset, setOffset] = useState(0);
    const [isUp, setIsUp] = useState(true);

    return (
        <div className="relative flex flex-col items-center gap-4">
            <motion.button
                onClick={() => {
                    setOffset((prev) => (isUp ? prev - 50 : prev + 50));
                    setIsUp(!isUp);
                }}
                animate={{ y: offset }}
                transition={{ type: "spring", stiffness: 80 }}
                className="mt-12 md:mt-10 p-2 rounded-full hover:bg-gray-300 transition z-10 relative"
            >
                {isUp ? (
                    <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
            </motion.button>

            <motion.section
                animate={{ y: offset }}
                transition={{ type: "spring", stiffness: 80 }}
                className="flex flex-col-reverse md:flex-row items-center justify-between bg-white  rounded-2xl w-full  text-center md:text-left gap-4 md:gap-12"
            >
                <div className="flex gap-4 items-center text-xl font-medium">
                    <p className="text-3xl font-bold primary-color">25+</p>
                    <span className="text-gray-700">Years of eLearning Education Experience</span>
                </div>
                <div className="flex gap-4 items-center text-xl font-medium">
                    <p className="text-3xl font-bold primary-color">22k</p>
                    <span className="text-gray-700">Students enrolled in AcePTE Courses</span>
                </div>
                <div className="flex gap-4 items-center  text-xl font-medium">
                    <p className="text-3xl font-bold primary-color">80%</p>
                    <span className="text-gray-700">Increase in your old PTE score guaranteed</span>
                </div>
            </motion.section>
        </div>
    );
}