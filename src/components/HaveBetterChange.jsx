import React from "react";
import toolImage from "../assets/tool.svg"; // Adjust the path as needed

export default function HaveBetterChance() {
    return (
        <section className="flex flex-col md:flex-row items-center justify-between p-6 md:p-12 bg-[#3D3939] rounded-lg">
            {/* Left Side - Text Content */}
            <div className="max-w-2xl text-center md:text-left">
                <h2 className="text-3xl md:text-6xl font-[500] text-white">
                    Have Better Chance At Scoring Your Desired Score With AcePTE
                </h2>
                <p className="mt-10 text-white">
                    Your Key to PTE Excellence – Comprehensive Lessons, Real Exam Practice, and Smart Study Plans. Sign up today and take the first step toward your PTE success!
                </p>
                <button className="mt-20 px-16 py-3 text-black bg-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition">
                    Start Now
                </button>
            </div>

            {/* Right Side - Image */}
            <div className="mt-6 md:mt-0 w-full md:w-1/2 flex justify-center">
                <img src={toolImage} alt="Tool Illustration" className="w-full max-w-xs md:max-w-sm" />
            </div>
        </section>
    );
}
