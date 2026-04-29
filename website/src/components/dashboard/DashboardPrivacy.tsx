"use client";

import React from "react";

export default function DashboardPrivacy() {
  return (
    <section id="view-privacy" className="view-section active">
      <h1 className="page-title">Privacy Policy</h1>
      <p className="page-desc">Last Updated: April 26, 2026</p>

      <div className="card">
        <h3 style={{ marginBottom: "12px" }}>Our Commitment</h3>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "24px" }}>
          FocusShield was built with a privacy-first mindset. We believe that your browsing habits and productivity data should remain yours and yours alone. This policy explains how we handle data and why we require certain permissions.
        </p>

        <h3 style={{ marginBottom: "12px" }}>Data Collection</h3>
        <div style={{ background: "#e0e7ff", color: "#1e3a8a", padding: "12px", borderRadius: "8px", marginBottom: "12px", fontWeight: 600 }}>
          FocusShield does not collect, store, or transmit any personal data to external servers.
        </div>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "24px" }}>
          We do not track your browsing history, we do not use cookies for tracking, and we do not have a backend server that stores your information. All data used by the extension stays on your local device.
        </p>

        <h3 style={{ marginBottom: "12px" }}>Local Storage</h3>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "24px" }}>
          We use <code>chrome.storage.local</code> to save your settings, such as your custom list of blocked websites, usage limits, and the preferred block duration for the timer. This data is stored locally in your browser profile and is never shared with us or any third party.
        </p>
      </div>
    </section>
  );
}
