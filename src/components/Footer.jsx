import React from "react";
import logo from "/logo.svg";
import userImage from "../assets/user1.svg";

export default function Footer() {
    return (
        <footer className="border border-t-2 border-l-0 border-r-0 border-b-0  py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center md:items-start">
            {/* Left Section */}
            <div className="flex flex-col items-center md:items-start">
                <img src={logo} alt="Logo" className="w-30 mb-4" />
                <p className="text-sm">+1 234 567 890</p>
                <p className="text-sm">+1 987 654 321</p>
                <p className="text-sm">+44 123 456 789</p>
            </div>

            {/* Center Section */}
            <div className="text-center md:text-left mt-6 md:mt-0">
                <h3 className="text-lg font-semibold">Quick Links</h3>
                <ul className="mt-2 space-y-1">
                    <li>Facebook</li>
                    <li>Twitter</li>
                    <li>Instagram</li>
                    <li>LinkedIn</li>
                </ul>
            </div>

            {/* Right Section */}
            <div className="mt-6 md:mt-0">
                <img src={userImage} alt="User" />
            </div>
        </footer>
    );
}
