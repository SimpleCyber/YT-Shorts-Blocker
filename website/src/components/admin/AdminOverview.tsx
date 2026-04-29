"use client";

import React from "react";

export default function AdminOverview() {
  const stats = [
    { label: "Total Users", value: "1,284", trend: "+12%", up: true, icon: "fa-users" },
    { label: "Active Blocks", value: "45,902", trend: "+8%", up: true, icon: "fa-shield-halved" },
    { label: "Monthly Revenue", value: "$12,450", trend: "Stable", up: null, icon: "fa-credit-card" },
  ];

  return (
    <section className="view-section">
      <h1 className="page-title">Admin Overview</h1>
      <p className="page-desc">System performance and user engagement metrics at a glance.</p>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
            </div>
            {stat.trend && (
              <div className={`stat-trend ${stat.up === true ? "trend-up" : stat.up === false ? "trend-down" : ""}`}>
                {stat.up === true ? <i className="fas fa-arrow-up"></i> : stat.up === false ? <i className="fas fa-arrow-down"></i> : <i className="fas fa-minus"></i>}
                {stat.trend} from last month
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", marginTop: "24px" }}>
        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>System Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></div>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>API Services</span>
              </div>
              <span className="badge badge-active">Operational</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></div>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>Firestore Database</span>
              </div>
              <span className="badge badge-active">Operational</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></div>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>Extension Sync Server</span>
              </div>
              <span className="badge badge-active">Operational</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>Recent Notifications</h3>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
            <i className="fas fa-bell-slash" style={{ fontSize: "24px", marginBottom: "12px", opacity: 0.3 }}></i>
            <p>No new system alerts.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
