"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import { getData, setData, isExtensionAvailable } from "../../lib/extensionBridge";
import Sidebar from "../../components/dashboard/Sidebar";
import BlockSites from "../../components/dashboard/BlockSites";
import UsageLimit from "../../components/dashboard/UsageLimit";
import Insights from "../../components/dashboard/Insights";
import FocusMode from "../../components/dashboard/FocusMode";
import Settings from "../../components/dashboard/Settings";
import DashboardPrivacy from "../../components/dashboard/DashboardPrivacy";
import AddBlockModal from "../../components/dashboard/AddBlockModal";
import { doc, getDoc, onSnapshot, DocumentSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FocusData, useFocusData } from "../../lib/FocusDataContext";
import "./dashboard.css";

export default function DashboardPage() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();
  const { data: focusData, updateData, loading: dataLoading } = useFocusData();

  const [activeView, setActiveView] = useState("view-block-sites");
  const [userPlan, setUserPlan] = useState<string>("free");
  const [extensionConnected, setExtensionConnected] = useState(true);

  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
    usageLimit: true,
    insights: true,
    focusMode: true,
    blockSites: true,
    passwordProtection: true,
    settings: true,
    aboutBlocking: true,
    blockingToggle: true,
    upgradeCard: true,
    profileSection: true,
    ext_blockSites: true,
    ext_focusMode: true,
    ext_insights: true,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"block" | "usage">("block");

  // Refresh key to force re-render of child components after modal saves
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth gate
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const loadInitialState = useCallback(async () => {
    if (!user) return;
    
    if (!isExtensionAvailable()) {
      setExtensionConnected(false);
    }
    
    try {
      // 2. Load user plan from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserPlan(userDoc.data().plan || "free");
      }
      
      setExtensionConnected(isExtensionAvailable());
    } catch (e) {
      console.error("Initialization failed", e);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Listen for features from Firestore (Real-time)
    const unsubFeatures = onSnapshot(doc(db, "system", "features"), (docSnap: DocumentSnapshot) => {
      if (docSnap.exists()) {
        const featData = docSnap.data() as any;
        setFeatureFlags(featData);
        
        // Push visibility flags to extension immediately
        if (isExtensionAvailable()) {
          setData({ 
            ext_blockSites: featData.ext_blockSites ?? true,
            ext_focusMode: featData.ext_focusMode ?? true,
            ext_insights: featData.ext_insights ?? true
          }).catch(e => console.error("Failed to push extension flags", e));
        }
      }
    });

    return () => unsubFeatures();
  }, [user]);

  useEffect(() => {
    if (user) loadInitialState();
  }, [loadInitialState, user]);

  const handleBlockingToggle = (enabled: boolean) => {
    updateData({ isBlockingEnabled: enabled });
  };

  const openBlockModal = () => { setModalMode("block"); setIsModalOpen(true); };
  const openUsageModal = () => { setModalMode("usage"); setIsModalOpen(true); };
  const handleModalDone = () => { setIsModalOpen(false); setRefreshKey((k) => k + 1); };

  const isUnlimited = userPlan === "unlimited" || userPlan === "premium";

  const renderActiveView = () => {
    switch (activeView) {
      case "view-block-sites":
        return <BlockSites key={`block-${refreshKey}`} isAdminUnlocked={isUnlimited} onOpenModal={openBlockModal} />;
      case "view-usage-limit":
        return <UsageLimit key={`usage-${refreshKey}`} onOpenModal={openUsageModal} />;
      case "view-insights":
        return <Insights key={`insights-${refreshKey}`} />;
      case "view-focus-mode":
        return <FocusMode />;
      case "view-settings":
        return <Settings />;
      case "view-privacy":
        return <DashboardPrivacy />;
      case "view-password":
        return (
          <section className="view-section active">
            <h1 className="page-title">Password Protection</h1>
            <p className="page-desc">Protect your focus by requiring a password to change settings or unblock sites.</p>
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fas fa-lock" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "20px" }}></i>
              <h3>{isUnlimited ? "Feature Unlocked" : "Premium Feature"}</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>
                {isUnlimited 
                  ? "This feature is active. Functionality will be expanded in future updates." 
                  : "This feature is locked. Please upgrade to Unlimited plan to enable password protection."}
              </p>
            </div>
          </section>
        );
      case "view-custom-page":
        return (
          <section className="view-section active">
            <h1 className="page-title">Custom Block Page</h1>
            <p className="page-desc">Personalize your block screen with your own message or image.</p>
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fas fa-paint-brush" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "20px" }}></i>
              <h3>{isUnlimited ? "Feature Unlocked" : "Premium Feature"}</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>
                {isUnlimited 
                  ? "This feature is active. Functionality will be expanded in future updates." 
                  : "This feature is locked. Please upgrade to Unlimited plan to customize your block page."}
              </p>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (loading || !user || dataLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg-main)" }}>
        <div style={{ width: "32px", height: "32px", border: "4px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : "U";
  const userPhoto = user.photoBase64 || user.photoURL;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100%", overflow: "hidden" }}>
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          isAdminUnlocked={isUnlimited}
          isBlockingEnabled={focusData.isBlockingEnabled}
          onBlockingToggle={handleBlockingToggle}
          featureFlags={featureFlags}
        />

        <div className="main-wrapper">
        <header className="header">
          {!extensionConnected && (
            <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "8px", color: "var(--danger)", fontSize: "13px", fontWeight: 600 }}>
              <i className="fas fa-exclamation-triangle"></i> Extension not detected — install FocusShield to sync data
            </div>
          )}
          
          {(!isUnlimited && featureFlags.upgradeCard) && (
            <button className="btn-premium premium-element" style={{ width: "auto" }}>Go Unlimited</button>
          )}

          {/* <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", fontWeight: 600, fontSize: "14px" }}>
            <i className="fas fa-star" style={{ color: "#64748b" }}></i> 45
          </div> */}

          {/* User info + Sign Out */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {featureFlags.profileSection && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }}>
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={user.displayName || "User"}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: 700 }}>
                    {userInitial}
                  </div>
                )}
                {user.displayName || "User"}
              </div>
            )}
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

      <AddBlockModal
        isOpen={isModalOpen}
        mode={modalMode}
        isAdminUnlocked={isUnlimited}
        onClose={() => setIsModalOpen(false)}
        onDone={handleModalDone}
      />
    </>
  );
}
