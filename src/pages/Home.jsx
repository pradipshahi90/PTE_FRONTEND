import React, { useState } from 'react';
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";
import Stats from "../components/Stats.jsx";
import PopularCourse from "../components/PopularCourse.jsx";
import Partners from "../components/Partners.jsx";
import HaveBetterChance from "../components/HaveBetterChange.jsx";
import ReviewCards from "../components/ReviewCards.jsx";
import Footer from "../components/Footer.jsx";


const Home = () => {

    return (
        <div className="container mx-auto flex flex-col gap-8">
        <Header />
            <Hero />
            <Stats />
            <PopularCourse />
            <Partners />
            <HaveBetterChance />
            <ReviewCards />
            <Footer />
        </div>
    );
};

export default Home;
