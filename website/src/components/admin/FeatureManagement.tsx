"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { isExtensionAvailable, setData } from "../../lib/extensionBridge";

export default function FeatureManagement() {
  const [features, setFeatures] = useState({
    // Website Features
    usageLimit: true,
    insights: true,
    focusMode: true,
    blockSites: true,
    passwordProtection: true,
    settings: true,
    aboutBlocking: true,
    blockingToggle: true,
    upgradeCard: true,
    // Extension Features
    ext_blockSites: true,
    ext_focusMode: true,
    ext_insights: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadFeatures() {
      try {
        const docRef = doc(db, "system", "features");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFeatures((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error("Error loading features:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatures();
  }, []);

  const handleToggle = async (key: string) => {
    const updated = { ...features, [key]: !((features as any)[key]) };
    setFeatures(updated);
    
    setSaving(true);
    try {
      await setDoc(doc(db, "system", "features"), updated, { merge: true });
      
      // Push to extension immediately if it's an extension flag
      if (key.startsWith("ext_") && isExtensionAvailable()) {
        await setData({ [key]: updated[key as keyof typeof updated] });
      }
    } catch (err) {
      console.error("Error saving feature flag:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading feature controls...</div>;

  const websiteFeatures = [
    { id: "blockSites", label: "Block Sites Component", icon: "fa-th-large", desc: "Manage website block list" },
    { id: "focusMode", label: "Focus Mode Component", icon: "fa-bullseye", desc: "Pomodoro focus sessions" },
    { id: "insights", label: "Insights Component", icon: "fa-chart-bar", desc: "User analytics & tracking" },
    { id: "usageLimit", label: "Usage Limit Component", icon: "fa-hourglass-half", desc: "Daily time limit manager" },
    { id: "blockingToggle", label: "Blocking Toggle", icon: "fa-toggle-on", desc: "The switch in the sidebar" },
    { id: "upgradeCard", label: "Upgrade Promotion", icon: "fa-star", desc: "The premium upgrade card" },
    { id: "profileSection", label: "Profile Section", icon: "fa-user-circle", desc: "User info in the header" },
    { id: "passwordProtection", label: "Premium Protections", icon: "fa-lock", desc: "Password & custom page" },
    { id: "settings", label: "Settings View", icon: "fa-cog", desc: "User configuration page" },
    { id: "aboutBlocking", label: "About Section", icon: "fa-info-circle", desc: "Info and documentation" },
  ];

  const extensionFeatures = [
    { id: "ext_blockSites", label: "Block Sites Feature", icon: "fa-ban", desc: "Enable blocking tab in extension" },
    { id: "ext_focusMode", label: "Focus Mode Feature", icon: "fa-bullseye", desc: "Enable Pomodoro tab in extension" },
    { id: "ext_insights", label: "Insights Feature", icon: "fa-chart-bar", desc: "Enable analytics tab in extension" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "24px" }}>
      {/* Website Features */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Website Feature Management</h2>
            <p className="page-desc" style={{ marginBottom: 0 }}>Control what users see on the dashboard.</p>
          </div>
          {saving && <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>Saving...</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {websiteFeatures.map((f) => (
            <div key={f.id} className="setting-item" style={{ background: "var(--bg-main)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <div className="setting-info">
                <div className="setting-name" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className={`fas ${f.icon}`} style={{ color: "var(--primary)", width: "20px" }}></i>
                  {f.label}
                </div>
                <div className="setting-desc">{f.desc}</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={(features as any)[f.id]}
                  onChange={() => handleToggle(f.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Extension Features */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Chrome Extension Feature Management</h2>
            <p className="page-desc" style={{ marginBottom: 0 }}>Control internal extension logic and visibility.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {extensionFeatures.map((f) => (
            <div key={f.id} className="setting-item" style={{ background: "var(--bg-main)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <div className="setting-info">
                <div className="setting-name" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className={`fas ${f.icon}`} style={{ color: "#f59e0b", width: "20px" }}></i>
                  {f.label}
                </div>
                <div className="setting-desc">{f.desc}</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={(features as any)[f.id]}
                  onChange={() => handleToggle(f.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
