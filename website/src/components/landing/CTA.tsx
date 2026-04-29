"use client";

import React from "react";

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box reveal">
          <h2>Ready to reclaim your focus?</h2>
          <p>Join thousands of users who've taken back control of their screen time. It takes 10 seconds to install.</p>
          <a href="#" className="btn-chrome" id="cta-install-bottom">
            <i className="fab fa-chrome"></i> Add to Chrome for Free
          </a>
          <div className="cta-subtext">
            <i className="fas fa-check-circle text-success"></i>  
            Free forever &bull; No sign-up required &bull; Privacy-first
          </div>
        </div>
      </div>
    </section>
  );
}
