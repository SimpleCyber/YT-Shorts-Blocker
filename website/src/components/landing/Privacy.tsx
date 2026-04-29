"use client";

import React from "react";

export default function Privacy() {
  const checklist = [
    "Zero data collection or transmission",
    "No tracking cookies or analytics",
    "No backend servers — fully offline",
    "All settings stored locally via chrome.storage",
    "100% ad-free and tracker-free"
  ];

  const privacyCards = [
    {
      icon: <i className="fas fa-database"></i>,
      title: "Local Storage Only",
      description: "Block lists and settings are saved in your browser profile",
      colorClass: "card-indigo"
    },
    {
      icon: <i className="fas fa-shield-halved"></i>,
      title: "No Servers",
      description: "Zero external connections. Everything runs on your machine",
      colorClass: "card-green"
    },
    {
      icon: <i className="fas fa-eye-slash"></i>,
      title: "No Tracking",
      description: "We never see or store your browsing history",
      colorClass: "card-red"
    },
    {
      icon: <i className="fas fa-code"></i>,
      title: "Open Permissions",
      description: "Every permission is justified and documented",
      colorClass: "card-amber"
    }
  ];

  return (
    <section className="privacy-section" id="privacy">
      <div className="container">
        <div className="privacy-grid">
          <div className="privacy-content reveal">
            <div className="section-label"><i className="fas fa-lock"></i> Privacy First</div>
            <h2>Your data stays on your device. Period.</h2>
            <p>
              FocusShield was built with a privacy-first architecture. We don't have servers, we don't track you, and we don't sell anything. Everything runs 100% locally in your browser.
            </p>
            <ul className="privacy-checklist">
              {checklist.map((item, index) => (
                <li key={index}>
                  <i className="fas fa-check-circle text-success"></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="privacy-visual reveal">
            {privacyCards.map((card, index) => (
              <div key={index} className={`privacy-card ${card.colorClass}`}>
                <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                  {card.icon}
                </div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
