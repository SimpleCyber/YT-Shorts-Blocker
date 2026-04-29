"use client";

import React from "react";

export default function Settings() {
  return (
    <section id="view-settings" className="view-section active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Settings</h1>
        <button className="btn btn-outline" style={{ background: "var(--bg-hover)" }}>Enable in Incognito Mode</button>
      </div>

      <div className="settings-section">
        <h3 className="settings-title">General</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Enable FocusShield shortcut option using right-click</div>
            <div className="setting-desc">Add sites to your block list or your focus mode list by right-clicking and selecting the FocusShield menu on a website.</div>
          </div>
          <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-title">Your Privacy Choices <i className="fas fa-check-circle" style={{ color: "var(--primary)" }}></i></h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
          We and our affiliates use the information collected to analyze and improve performance, enable certain features and functionality, understand more about users and their interaction with our product and for market intelligence purposes.
        </p>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Opt Out from Sharing of Browsing Data</div>
            <div className="setting-desc">You can stop the sharing of your browsing data by turning off the automated collection of your browsing data.</div>
          </div>
          <label className="switch"><input type="checkbox" /><span className="slider"></span></label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-title">View</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Show blocked page motivational images</div>
            <div className="setting-desc">Enabling this will show images on a blocked site. Disabling will show a white background.</div>
          </div>
          <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Show remaining time on favicon</div>
            <div className="setting-desc">Enable this to show the time left in current interval on the extension&apos;s favicon.</div>
          </div>
          <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-title">Integrations</h3>
        <div className="setting-item">
          <div className="setting-info" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <i className="fab fa-slack" style={{ fontSize: "24px" }}></i>
            <div>
              <div className="setting-name">Slack</div>
              <div className="setting-desc">Upgrade to FocusShield Unlimited to empower your focus with automations for Slack.</div>
            </div>
          </div>
          <button className="btn-premium premium-element" style={{ width: "auto" }}>Go Unlimited</button>
        </div>
      </div>
    </section>
  );
}
