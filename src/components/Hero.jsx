import React from 'react';
import heroImage from '../assets/hero.svg'; // Adjust the path as needed

export default function Hero() {
    return (
        <section className="flex flex-col-reverse md:flex-row items-center justify-between p-6 md:p-12">
            {/* Left Side: Text */}
            <div className="w-full md:w-1/2 text-center md:text-left space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900">
                    The Ultimate <span className="primary-color">PTE</span> Study Companion
                </h1>
                <p className="text-base md:text-sm text-gray-700">
                    Learn, Practice, and Master Every Section of the PTE to Secure Your Desired Score
                </p>
            </div>

            {/* Right Side: Image */}
            <div className="w-full mb-10 md:w-1/2 flex justify-center">
                <img src={heroImage} alt="PTE Study Companion" className="w-3/4 md:w-full h-auto" />
            </div>
        </section>
    );
}
