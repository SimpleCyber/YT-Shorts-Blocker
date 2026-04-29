"use client";

import React, { useEffect } from "react";
import "../components/landing/landing.css";

// Components
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import StatsBar from "../components/landing/StatsBar";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Privacy from "../components/landing/Privacy";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Home() {
  useEffect(() => {
    // Scroll reveal animation logic
    const revealElements = document.querySelectorAll(".reveal");
    
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1, 
        rootMargin: "0px 0px -40px 0px" 
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    // Cleanup
    return () => {
      revealElements.forEach((el) => revealObserver.unobserve(el));
    };
  }, []);

  return (
    <div className="landing-page">
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <HowItWorks />
        <Privacy />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
