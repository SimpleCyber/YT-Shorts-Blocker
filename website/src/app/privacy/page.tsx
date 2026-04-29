"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import "@/components/landing/landing.css";

export default function PrivacyPage() {
  const lastUpdated = "April 30, 2026";

  return (
    <div className="landing-page">
      <Navbar />
      
      <main style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: "left", marginBottom: "40px" }}>
            <div className="section-label">Legal & Privacy</div>
            <h1>Privacy Policy</h1>
            <p style={{ margin: "0" }}>Last updated: {lastUpdated}</p>
          </div>

          <div className="privacy-content-detailed" style={{ maxWidth: "800px" }}>
            <section style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)" }}>1. Introduction</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
                FocusShield ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use the FocusShield browser extension and associated dashboard. Our primary goal is to provide a powerful focus tool while maintaining absolute privacy for our users.
              </p>
            </section>

            <section style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)" }}>2. User Data Collection</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
                FocusShield is designed with a "privacy-first" architecture. 
                <br /><br />
                <strong>Browser Extension:</strong> The extension does not collect or transmit any personal data, browsing history, or keystrokes to our servers. We do not use tracking cookies or analytics within the extension.
                <br /><br />
                <strong>Web Dashboard:</strong> If you choose to sync your data across devices using our dashboard, we collect your email address and basic profile information (such as name and profile picture) via Google Authentication to identify your account and secure your data.
              </p>
            </section>

            <section style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)" }}>3. Data Handling</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
                We use the information we collect solely for the purpose of providing and improving the FocusShield service. 
                Your email is used for authentication and account management. Your configuration settings (block lists, usage limits, and focus stats) are handled to ensure they are available to you across your authorized devices.
              </p>
            </section>

            <section style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)" }}>4. Storage</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
                <strong>Local Storage:</strong> By default, all your settings and block lists are stored locally on your device using <code>chrome.storage.local</code>.
                <br /><br />
                <strong>Cloud Storage:</strong> If you use the synchronization feature, your data is stored securely in Firebase (Google Cloud Platform). This data is encrypted and accessible only by you through your authenticated account.
              </p>
            </section>

            <section style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)" }}>5. Data Sharing and Third Parties</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
                We do not sell, trade, or otherwise transfer your personal information to outside parties. 
                We use Firebase for data storage and authentication. These services are provided by Google and are subject to their own privacy policies. We do not share your browsing habits or blocked site lists with any third parties.
              </p>
            </section>

            <section style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)" }}>6. Data Security</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
                We implement a variety of security measures to maintain the safety of your information. All communication between the extension, dashboard, and our database is conducted over secure HTTPS connections. We use industry-standard authentication protocols to ensure that only you can access your data.
              </p>
            </section>

            <section style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)" }}>7. Data Retention and Deletion</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
                We retain your data for as long as your account is active or as needed to provide you services. 
                You can delete your local data at any time by clearing the extension storage or uninstalling the extension. 
                If you wish to delete your synced data and account, you can do so through the dashboard settings or by contacting our support team. Once deleted, your data cannot be recovered.
              </p>
            </section>

            <section style={{ marginTop: "60px", padding: "30px", background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
              <h3 style={{ marginBottom: "12px" }}>Questions?</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@focusshield.app" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>support@focusshield.app</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .privacy-content-detailed h2 {
          position: relative;
          display: inline-block;
        }
        .privacy-content-detailed h2::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 40px;
          height: 3px;
          background: var(--primary);
          border-radius: 2px;
        }
        @media (max-width: 768px) {
          main {
            padding-top: 100px !important;
          }
          h1 {
            font-size: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
