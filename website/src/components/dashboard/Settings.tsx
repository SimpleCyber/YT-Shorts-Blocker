"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { checkIncognitoStatus, openExtensionSettings } from "../../lib/extensionBridge";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isIncognitoAllowed, setIsIncognitoAllowed] = useState(false);
  const [showIncognitoModal, setShowIncognitoModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initial check
    checkIncognitoStatus().then(setIsIncognitoAllowed);
    
    // Check periodically or on focus
    const handleFocus = () => {
      checkIncognitoStatus().then(setIsIncognitoAllowed);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleIncognitoClick = () => {
    if (isIncognitoAllowed) {
      // Already enabled, maybe show a "You're all set" message
    } else {
      setShowIncognitoModal(true);
    }
  };

  return (
    <section id="view-settings" className="view-section active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Settings</h1>
        <button 
          className={`btn ${isIncognitoAllowed ? "btn-success" : "btn-outline"}`} 
          style={{ 
            background: isIncognitoAllowed ? "rgba(16, 185, 129, 0.1)" : "var(--bg-hover)",
            color: isIncognitoAllowed ? "var(--success)" : "inherit",
            borderColor: isIncognitoAllowed ? "var(--success)" : "var(--border)",
            fontWeight: 700
          }}
          onClick={handleIncognitoClick}
        >
          {isIncognitoAllowed ? (
            <><i className="fas fa-check-circle" style={{ marginRight: "8px" }}></i> Enabled in Incognito</>
          ) : (
            "Enable in Incognito Mode"
          )}
        </button>
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
        <h3 className="settings-title">Appearance</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Theme</div>
            <div className="setting-desc">Select your preferred color theme for the dashboard.</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {mounted ? (
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-main)", color: "var(--text-main)", outline: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            ) : (
              <div style={{ width: "90px", height: "36px", borderRadius: "8px", background: "var(--bg-hover)" }}></div>
            )}
          </div>
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

      {/* Incognito Instruction Modal */}
      {showIncognitoModal && (
        <div className="modal-overlay active" style={{ zIndex: 10000 }} onClick={() => setShowIncognitoModal(false)}>
          <div 
            className="card" 
            style={{ width: "500px", maxWidth: "90vw", margin: "auto", padding: "32px", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto" }}>
              <i className="fas fa-user-secret" style={{ fontSize: "28px", color: "var(--primary)" }}></i>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>Enable Incognito Mode</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
              To stay focused even in private windows, you need to manually grant the extension permission in your browser settings.
            </p>
            
            <div style={{ textAlign: "left", background: "var(--bg-main)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "24px" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>1</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>Click the button below to open <b>Extension Settings</b>.</div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>2</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>Scroll down to find the <b>&quot;Allow in Incognito&quot;</b> toggle.</div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>3</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>Turn it <b>ON</b> and return to this dashboard.</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowIncognitoModal(false)}>Close</button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2, justifyContent: "center", background: "var(--primary)", color: "white" }}
                onClick={() => {
                  openExtensionSettings();
                }}
              >
                Open Extension Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
