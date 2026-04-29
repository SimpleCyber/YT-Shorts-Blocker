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
    profileSection: boolean;
  };
  user: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    photoBase64?: string | null;
  };
  userInitial: string;
  signOutUser: () => void;
}

export default function Sidebar({
  activeView,
  onNavigate,
  isAdminUnlocked,
  isBlockingEnabled,
  onBlockingToggle,
  featureFlags,
  user,
  userInitial,
  signOutUser,
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
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <i className="fas fa-ban"></i> 
                <span>Blocking</span>
                <div className="tooltip-container">
                  <i className="fas fa-question-circle tooltip-icon"></i>
                  <div className="tooltip-content">
                    <b>What is this for?</b>
                    1. If the toggle mode is on, then our Chrome extension will come into effect and block the sites and pages.<br/><br/>
                    2. If it is off, the extension will not apply the blocking mode. It still keeps track of all the websites, counts, and timers, but it will not apply any restrictions like blocking websites or other actions.
                  </div>
                </div>
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

      {featureFlags?.profileSection !== false && (
        <div className="sidebar-profile">
          <div className="nav-divider"></div>
          <div className="profile-container">
            {user?.photoBase64 || user?.photoURL ? (
              <img
                src={user.photoBase64 || user.photoURL || ""}
                alt={user.displayName || "User"}
                className="profile-img"
              />
            ) : (
              <div className="profile-initial">{userInitial}</div>
            )}
            <div className="profile-info">
              <span className="profile-name">{user?.displayName || "User"}</span>
              <span className="profile-email">{user?.email}</span>
              <button onClick={signOutUser} className="profile-logout">
                <i className="fas fa-sign-out-alt"></i> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sidebar-profile {
          padding: 0 12px 20px 12px;
          margin-top: auto;
        }
        .profile-container {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: var(--bg-hover);
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .profile-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
        }
        .profile-initial {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 700;
        }
        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }
        .profile-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .profile-email {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .profile-logout {
          margin-top: 8px;
          background: none;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          transition: all 0.2s;
        }
        .profile-logout:hover {
          background: white;
          color: var(--danger);
          border-color: var(--danger);
        }
      `}</style>
    </aside>
  );
}
