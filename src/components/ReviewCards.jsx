import React from "react";

const reviews = [
    {
        id: 1,
        img: "https://via.placeholder.com/100",
        quote: "Amazing experience!",
        text: "Their courses and fees are very affordable. I like their service.",
        name: "| John Doe"
    },
    {
        id: 2,
        img: "https://via.placeholder.com/100",
        quote: "Highly recommended!",
        text: "The lessons are well-structured, and the practice exams helped me a lot.",
        name: "| Jane Smith"
    },
    {
        id: 3,
        img: "https://via.placeholder.com/100",
        quote: "Great support!",
        text: "Their customer support is excellent. I got all my queries resolved instantly.",
        name: "| Michael Lee"
    }
];

export default function ReviewCards() {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-center mb-4">Reviews that speak
                Volume</h2>
            <div className="grid gap-10 md:grid-cols-3">
            {reviews.map((review) => (
                    <div key={review.id} className="bg-white  rounded-lg p-4 border border-gray-400">
                        <img src="/logo.svg" alt="Reviewer" className="w-16 h-16 mx-auto rounded-full mb-4" />
                        <p className="text-xl font-semibold"><span className="text-xl primary-color block">"</span>{review.quote}</p>
                        <p className="mt-2 text-gray-600">{review.text}</p>
                        <p className="mt-4 font-[600] text-xl text-gray-700">{review.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
