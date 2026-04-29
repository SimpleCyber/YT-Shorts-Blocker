"use client";

import React from "react";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isAdminUnlocked: boolean;
  isBlockingEnabled: boolean;
  onBlockingToggle: (enabled: boolean) => void;
  featureFlags?: {
    usageLimit: boolean;
    insights: boolean;
    focusMode: boolean;
    blockSites: boolean;
    passwordProtection: boolean;
    settings: boolean;
    aboutBlocking: boolean;
  };
}

export default function Sidebar({
  activeView,
  onNavigate,
  isAdminUnlocked,
  isBlockingEnabled,
  onBlockingToggle,
  featureFlags,
}: SidebarProps) {
  const navItems = [
    { id: "view-block-sites", icon: "fa-th-large", label: "Block Sites", visible: featureFlags?.blockSites !== false },
    { id: "view-usage-limit", icon: "fa-hourglass-half", label: "Usage Limit", visible: featureFlags?.usageLimit !== false },
    { id: "view-insights", icon: "fa-chart-bar", label: "Insights", visible: featureFlags?.insights !== false },
    { id: "view-focus-mode", icon: "fa-bullseye", label: "Focus Mode", visible: featureFlags?.focusMode !== false },
  ].filter(item => item.visible);

  const lockedItems = [
    { id: "view-password", icon: "fa-lock", label: "Password Protection", visible: featureFlags?.passwordProtection !== false },
    { id: "view-custom-page", icon: "fa-edit", label: "Custom Block Page", visible: featureFlags?.passwordProtection !== false },
  ].filter(item => item.visible);

  const bottomItems = [
    { id: "view-settings", icon: "fa-cog", label: "Settings", visible: featureFlags?.settings !== false },
    { id: "view-privacy", icon: "fa-info-circle", label: "About", visible: featureFlags?.aboutBlocking !== false },
  ].filter(item => item.visible);

  return (
    <aside className="sidebar">
      <div className="brand">
        <i className="fas fa-shield-alt"></i> FocusShield
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => (
          <a
            key={item.id}
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <i className={`fas ${item.icon}`}></i> {item.label}
          </a>
        ))}

        {lockedItems.length > 0 && <div className="nav-divider"></div>}

        {lockedItems.map((item) => (
          <a
            key={item.id}
            className={`nav-item ${!isAdminUnlocked ? "locked-feature" : ""} ${activeView === item.id ? "active" : ""}`}
            style={
              !isAdminUnlocked
                ? { opacity: 0.7, cursor: "not-allowed" }
                : undefined
            }
            onClick={() => {
              if (isAdminUnlocked) onNavigate(item.id);
            }}
          >
            <i className={`fas ${item.icon}`}></i> {item.label}
            {!isAdminUnlocked && (
              <span className="badge-locked">
                <i className="fas fa-lock" style={{ fontSize: "8px" }}></i>
              </span>
            )}
          </a>
        ))}

        {bottomItems.length > 0 && <div className="nav-divider"></div>}

        {bottomItems.map((item) => (
          <a
            key={item.id}
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <i className={`fas ${item.icon}`}></i> {item.label}
          </a>
        ))}

        {featureFlags?.blockSites !== false && (
          <>
            <div className="nav-divider"></div>
            <div
              className="nav-item"
              style={{ cursor: "default", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                <i className="fas fa-ban"></i> Blocking
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isBlockingEnabled}
                  onChange={(e) => onBlockingToggle(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </>
        )}
      </nav>

      {(!isAdminUnlocked && featureFlags?.passwordProtection !== false) && (
        <div className="premium-card premium-element">
          <i className="fas fa-unlock-alt"></i>
          <div className="premium-title">Password Protection</div>
          <div className="premium-desc">
            Make it harder to remove sites from your block list
          </div>
          <button className="btn-premium">Go Unlimited</button>
        </div>
      )}
    </aside>
  );
}
