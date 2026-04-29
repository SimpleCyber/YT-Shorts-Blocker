"use client";

import React from "react";

interface AdminSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function AdminSidebar({ activeView, onNavigate }: AdminSidebarProps) {
  const navItems = [
    { id: "overview", icon: "fa-chart-pie", label: "Overview" },
    { id: "users", icon: "fa-users", label: "User Management" },
    { id: "revenue", icon: "fa-dollar-sign", label: "Revenue" },
  ];

  const systemItems = [
    { id: "settings", icon: "fa-cogs", label: "System Settings" },
    { id: "logs", icon: "fa-list-alt", label: "Audit Logs" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <i className="fas fa-shield-alt"></i> FocusShield <span style={{ fontSize: "10px", background: "var(--primary)", color: "white", padding: "2px 6px", borderRadius: "10px", marginLeft: "4px" }}>ADMIN</span>
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

        {systemItems.map((item) => (
          <a
            key={item.id}
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <i className={`fas ${item.icon}`}></i> {item.label}
          </a>
        ))}
      </nav>

      <div className="card" style={{ margin: "20px 12px", padding: "16px", background: "var(--bg-main)", textAlign: "center" }}>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>Logged in as Admin</p>
        <div style={{ fontSize: "12px", fontWeight: 700 }}>v1.0.4-stable</div>
      </div>
    </aside>
  );
}
