"use client";

import React from "react";

export default function Features() {
  const features = [
    {
      icon: <i className="fab fa-youtube"></i>,
      title: "YouTube Shorts Blocker",
      description: "Automatically hide the addictive Shorts shelf and redirect Shorts URLs. Take back control of your YouTube experience.",
      colorClass: "red"
    },
    {
      icon: <i className="fab fa-instagram"></i>,
      title: "Reels Neutralizer",
      description: "Say goodbye to infinite scrolling on Instagram. We block Reels so you can focus on what actually matters.",
      colorClass: "purple"
    },
    {
      icon: <i className="fas fa-ban"></i>,
      title: "Smart Site Blocking",
      description: "Block entire websites, specific URLs, or categories of distracting content with one click from the dashboard.",
      colorClass: "indigo"
    },
    {
      icon: <i className="fas fa-hourglass-half"></i>,
      title: "Usage Limits",
      description: "Set daily time limits for any website. Once you hit your limit, access is blocked until the next day.",
      colorClass: "amber"
    },
    {
      icon: <i className="fas fa-bullseye"></i>,
      title: "Focus Timer",
      description: "Pomodoro-style focus sessions with a beautiful circular timer. Stay productive with work-break cycles.",
      colorClass: "green"
    },
    {
      icon: <i className="fas fa-chart-bar"></i>,
      title: "Focus Insights",
      description: "Visualize your productivity with detailed charts. Track time saved, blocked attempts, and top distractions.",
      colorClass: "sky"
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-label"><i className="fas fa-sparkles"></i> Features</div>
          <h2>Everything you need to stay focused</h2>
          <p>A powerful toolkit designed for productivity, built with privacy at its core.</p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card reveal">
              <div className={`feature-icon-wrap ${feature.colorClass}`}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
