"use client";

import React from "react";

export default function UserTable() {
  const users = [
    { name: "John Doe", email: "john@example.com", plan: "Premium", status: "Active", joined: "2024-04-20" },
    { name: "Alice Smith", email: "alice@outlook.com", plan: "Free", status: "Active", joined: "2024-04-25" },
    { name: "Robert Wilson", email: "bob@gmail.com", plan: "Premium", status: "Inactive", joined: "2024-03-15" },
    { name: "Emily Brown", email: "emily@tech.io", plan: "Free", status: "Active", joined: "2024-04-28" },
  ];

  return (
    <section className="view-section">
      <h1 className="page-title">User Management</h1>
      <p className="page-desc">Manage your application users, subscriptions, and account status.</p>

      <div className="table-container">
        <div className="table-header">
          <div>USER</div>
          <div>PLAN</div>
          <div>JOINED</div>
          <div>STATUS</div>
        </div>

        {users.map((user, i) => (
          <div key={i} className="table-row">
            <div className="user-info">
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</div>
              </div>
            </div>
            <div style={{ fontWeight: 500 }}>{user.plan}</div>
            <div style={{ color: "var(--text-muted)" }}>{user.joined}</div>
            <div>
              <span className={`badge ${user.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                {user.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button className="btn btn-outline">
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        <button className="btn btn-outline" style={{ marginLeft: "12px" }}>
          Next <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>
  );
}
