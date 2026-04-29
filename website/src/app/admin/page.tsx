"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminOverview from "../../components/admin/AdminOverview";
import UserTable from "../../components/admin/UserTable";
import FeatureManagement from "../../components/admin/FeatureManagement";
import "./admin.css";

export default function AdminPage() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.email !== adminEmail) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, adminEmail]);

  if (loading || !user || user.email !== adminEmail) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc" }}>
        <div style={{ width: "32px", height: "32px", border: "4px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <UserTable />;
      case "features":
        return <FeatureManagement />;
      default:
        return (
          <div className="view-section active">
            <h1 className="page-title">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fas fa-lock" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "20px" }}></i>
              <h3>Section Under Construction</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>This admin feature is currently being developed.</p>
            </div>
          </div>
        );
    }
  };

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : "A";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100%", overflow: "hidden" }}>
        <AdminSidebar 
          activeView={activeView} 
          onNavigate={setActiveView} 
        />

        <div className="main-wrapper">
          <header className="header">
            <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
               <button 
                onClick={() => router.push("/dashboard")}
                className="btn btn-outline"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                <i className="fas fa-arrow-left"></i> User Dashboard
              </button>
            </div>

            {/* Admin Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Admin"}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: 700 }}>
                    {userInitial}
                  </div>
                )}
                {user.displayName || "Admin"}
              </div>
              <button
                onClick={signOutUser}
                className="btn btn-outline"
                style={{ padding: "4px 10px", fontSize: "11px", color: "var(--text-muted)" }}
                title="Sign out"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </header>

          <main className="content-area">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </>
  );
}
