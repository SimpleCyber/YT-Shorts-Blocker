"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useFocusData } from "../../lib/FocusDataContext";
import { checkIncognitoStatus, openExtensionSettings } from "../../lib/extensionBridge";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { data, updateData } = useFocusData();
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
      // Already enabled
    } else {
      setShowIncognitoModal(true);
    }
  };

  const isAdultFilterEnabled = data.blockedCategories?.includes('adult');
  const toggleAdultFilter = () => {
    const currentCats = data.blockedCategories || [];
    if (isAdultFilterEnabled) {
      updateData({ blockedCategories: currentCats.filter(c => c !== 'adult') });
    } else {
      updateData({ blockedCategories: [...currentCats, 'adult'] });
    }
  };

  const relaxationOptions = [
    { label: "None (Hard Block)", value: 0 },
    { label: "30 Seconds", value: 30 },
    { label: "1 Minute", value: 60 },
    { label: "2 Minutes", value: 120 },
    { label: "5 Minutes", value: 300 },
  ];

  if (!mounted) return null;

  return (
    <section id="view-settings" className="view-section active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Settings</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Configure your FocusShield preferences and extension behavior.</p>
        </div>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        
        {/* Global Controls */}
        <div className="settings-section card" style={{ padding: "24px", margin: 0 }}>
          <h3 className="settings-title" style={{ marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-globe" style={{ color: "var(--primary)" }}></i> Global Controls
          </h3>
          
          <div className="setting-item" style={{ marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
            <div className="setting-info">
              <div className="setting-name">Blocking Mode</div>
              <div className="setting-desc">Master switch for the blocking engine across all sites.</div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={data.isBlockingEnabled} 
                onChange={(e) => updateData({ isBlockingEnabled: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Adult Content Filter</div>
              <div className="setting-desc">Automatically block adult websites and related keywords.</div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={isAdultFilterEnabled} 
                onChange={toggleAdultFilter}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Extension Behavior */}
        <div className="settings-section card" style={{ padding: "24px", margin: 0 }}>
          <h3 className="settings-title" style={{ marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-puzzle-piece" style={{ color: "var(--primary)" }}></i> Extension Behavior
          </h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Blocker Relaxation Timer</div>
              <div className="setting-desc">How long to wait on the block screen before access is allowed.</div>
            </div>
            <select 
              value={data.duration ?? 60}
              onChange={(e) => updateData({ duration: parseInt(e.target.value) })}
              style={{ 
                padding: "8px 12px", 
                borderRadius: "8px", 
                border: "1px solid var(--border)", 
                background: "var(--bg-main)", 
                color: "var(--text-main)", 
                outline: "none", 
                cursor: "pointer", 
                fontSize: "14px", 
                fontWeight: 600 
              }}
            >
              {relaxationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section card" style={{ padding: "24px", margin: 0 }}>
          <h3 className="settings-title" style={{ marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-palette" style={{ color: "var(--primary)" }}></i> Appearance
          </h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Dashboard Theme</div>
              <div className="setting-desc">Customize the look and feel of your FocusShield dashboard.</div>
            </div>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{ 
                padding: "8px 12px", 
                borderRadius: "8px", 
                border: "1px solid var(--border)", 
                background: "var(--bg-main)", 
                color: "var(--text-main)", 
                outline: "none", 
                cursor: "pointer", 
                fontSize: "14px", 
                fontWeight: 600 
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Security & Sync */}
        <div className="settings-section card" style={{ padding: "24px", margin: 0 }}>
          <h3 className="settings-title" style={{ marginTop: 0, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-shield-alt" style={{ color: "var(--primary)" }}></i> Security & Sync
          </h3>
          
          <div className="setting-item" style={{ marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
            <div className="setting-info">
              <div className="setting-name">Password Protection</div>
              <div className="setting-desc">Status of your dashboard and settings access lock.</div>
            </div>
            <div style={{ 
              fontSize: "13px", 
              fontWeight: 700, 
              color: data.passwordProtection?.enabled ? "var(--success)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              {data.passwordProtection?.enabled ? (
                <><i className="fas fa-lock"></i> Active</>
              ) : (
                <><i className="fas fa-lock-open"></i> Not Configured</>
              )}
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Cloud Synchronization</div>
              <div className="setting-desc">Your settings are automatically synced across devices.</div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>
              <i className="fas fa-cloud-check"></i> Fully Synced
            </div>
          </div>
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
