"use client";

import React from "react";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isAdminUnlocked: boolean;
  onAdminToggle: () => void;
  isBlockingEnabled: boolean;
  onBlockingToggle: (enabled: boolean) => void;
}

export default function Sidebar({
  activeView,
  onNavigate,
  isAdminUnlocked,
  onAdminToggle,
  isBlockingEnabled,
  onBlockingToggle,
}: SidebarProps) {
  const navItems = [
    { id: "view-block-sites", icon: "fa-th-large", label: "Block Sites" },
    { id: "view-usage-limit", icon: "fa-hourglass-half", label: "Usage Limit" },
    { id: "view-insights", icon: "fa-chart-bar", label: "Insights" },
    { id: "view-focus-mode", icon: "fa-bullseye", label: "Focus Mode" },
  ];

  const lockedItems = [
    { id: "view-password", icon: "fa-lock", label: "Password Protection" },
    { id: "view-custom-page", icon: "fa-edit", label: "Custom Block Page" },
  ];

  const bottomItems = [
    { id: "view-settings", icon: "fa-cog", label: "Settings" },
    { id: "view-privacy", icon: "fa-info-circle", label: "About" },
  ];

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

        <div className="nav-divider"></div>

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

        <div className="nav-divider"></div>

        {bottomItems.map((item) => (
          <a
            key={item.id}
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <i className={`fas ${item.icon}`}></i> {item.label}
          </a>
        ))}

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
      </nav>

      {!isAdminUnlocked && (
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
