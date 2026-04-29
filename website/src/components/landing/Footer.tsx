"use client";

import React from "react";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <a href="/" className="logo">
            <i className="fas fa-shield-alt logo-icon"></i>
            <span className="logo-text">FocusShield</span>
          </a>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="/privacy">Privacy</a>
            <a href="mailto:support@focusshield.app">Support</a>
          </div>
        </div>
        <div className="copyright">
          &copy; {new Date().getFullYear()} FocusShield. All rights reserved. Built for focus.
        </div>
      </div>
    </footer>
  );
}
