"use client";

import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Install the Extension",
      description: "Click \"Add to Chrome\" and FocusShield is instantly active. Zero configuration needed."
    },
    {
      number: 2,
      title: "Customize Your Block List",
      description: "Add distracting sites, set usage limits, and choose categories to block from the clean dashboard."
    },
    {
      number: 3,
      title: "Reclaim Your Time",
      description: "Watch your productivity soar. Track progress with Focus Insights and keep improving every day."
    }
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-label"><i className="fas fa-route"></i> How It Works</div>
          <h2>Up and running in 30 seconds</h2>
          <p>No accounts, no sign-ups. Just install and start focusing.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card reveal">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
