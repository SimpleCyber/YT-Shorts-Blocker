"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const CAROUSEL_SLIDES = [
  {
    title: "Reclaim Your Focus",
    description: "Block addictive short-form content and take back control of your time and attention.",
    icon: "fa-bullseye",
  },
  {
    title: "Powerful Analytics",
    description: "Track your focus time and see exactly how much time you save every day.",
    icon: "fa-chart-pie",
  },
  {
    title: "Privacy First",
    description: "Your browsing data never leaves your device. We only store your profile for syncing settings.",
    icon: "fa-user-shield",
  },
];

export default function AuthCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-between p-12 relative overflow-hidden border-r border-slate-200">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-50 blur-3xl opacity-70"></div>
        <div className="absolute top-[60%] -right-[20%] w-[80%] h-[80%] rounded-full bg-slate-50 blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50" style={{ backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-slate-900">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
            <i className="fas fa-shield-alt text-xl text-indigo-600"></i>
          </div>
          <span className="text-2xl font-bold">FocusShield</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-lg mt-12 pl-4 border-l-2 border-indigo-100">
        <div className="min-h-[250px]">
          <div key={currentSlide} className="animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
              <i className={`fas ${CAROUSEL_SLIDES[currentSlide].icon} text-2xl text-indigo-600`}></i>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">{CAROUSEL_SLIDES[currentSlide].title}</h2>
            <p className="text-slate-500 text-lg leading-relaxed">{CAROUSEL_SLIDES[currentSlide].description}</p>
          </div>
        </div>

        <div className="flex gap-2.5 mt-10">
          {CAROUSEL_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-indigo-600" : "w-3 bg-slate-200 hover:bg-slate-300"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-6 text-slate-400 text-sm font-medium mt-auto pt-12">
        <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
        <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
        <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
      </div>
    </div>
  );
}
