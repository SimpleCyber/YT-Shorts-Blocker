"use client";

import React from "react";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-badge">
          <i className="fas fa-bolt"></i>
          Free & Privacy-First Extension
        </div>
        
        <h1>Stop Scrolling.<br /><span className="highlight">Start Living.</span></h1>
        
        <p className="hero-desc">
          Block addictive short-form content, set smart usage limits, and track your productivity — all from a beautiful dashboard that respects your privacy.
        </p>
        
        <div className="hero-actions">
          <a href="#" className="btn-chrome" id="cta-install-hero">
            <i className="fab fa-chrome"></i> Install FocusShield — It's Free
          </a>
          <a href="#features" className="btn-outline-nav">
            <i className="fas fa-arrow-down"></i> See Features
          </a>
        </div>
        
        <div className="hero-trust">
          <span><i className="fas fa-check-circle"></i> 100% Free</span>
          <span><i className="fas fa-check-circle"></i> No Data Collection</span>
          <span className="stars">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star-half-alt"></i>
            <span style={{ color: "var(--text-dim)", marginLeft: "4px" }}>4.8 Rating</span>
          </span>
        </div>
        
        {/* <div className="hero-visual">
            <img src="/hero-dashboard.png" alt="FocusShield Dashboard Preview" loading="lazy" />
        </div> */}
      </div>
    </section>
  );
}
