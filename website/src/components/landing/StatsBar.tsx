"use client";

import React from "react";

export default function StatsBar() {
  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "2.5hrs", label: "Avg. Time Saved Daily" },
    { number: "500K+", label: "Distractions Blocked" },
    { number: "4.8★", label: "Chrome Store Rating" },
  ];

  return (
    <section className="stats-bar reveal">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
