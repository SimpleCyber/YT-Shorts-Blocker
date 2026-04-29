"use client";

import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      <div className="container">
        <a href="#" className="logo">
          <i className="fas fa-shield-alt logo-icon"></i>
          <span className="logo-text">FocusShield</span>
        </a>
        
        <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`} id="nav-links">
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a href="#privacy" onClick={() => setMobileMenuOpen(false)}>Privacy</a>
          <a href="#" className="btn-chrome" id="cta-install-nav">
            <i className="fab fa-chrome"></i> Add to Chrome
          </a>
        </div>

        <button 
          className="menu-toggle" 
          id="menu-toggle" 
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 72px;
            left: 0;
            right: 0;
            background: white;
            padding: 24px;
            border-bottom: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
            gap: 20px;
          }
        }
      `}</style>
    </nav>
  );
}
