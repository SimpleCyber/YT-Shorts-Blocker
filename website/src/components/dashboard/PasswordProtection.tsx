"use client";

import React, { useState } from "react";
import { useFocusData } from "../../lib/FocusDataContext";

interface PasswordProtectionProps {
  isAdminUnlocked: boolean;
}

// Client-side SHA-256 hash helper
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function PasswordProtection({ isAdminUnlocked }: PasswordProtectionProps) {
  const { data, updateData } = useFocusData();
  const passwordProtection = data.passwordProtection || { enabled: false, passwordHash: "" };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [isChanging, setIsChanging] = useState(false);

  const isEnabled = passwordProtection.enabled;
  const hasPassword = !!passwordProtection.passwordHash;

  const handleToggle = (enabled: boolean) => {
    updateData({
      passwordProtection: {
        ...passwordProtection,
        enabled,
      },
    });
    setSuccess(enabled ? "Password protection enabled." : "Password protection disabled.");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (hasPassword) {
      // Need to verify current password first
      const hashedCurrent = await hashPassword(currentPassword);
      if (hashedCurrent !== passwordProtection.passwordHash) {
        setError("Current password is incorrect.");
        return;
      }
    }

    const newHash = await hashPassword(newPassword);
    updateData({
      passwordProtection: {
        enabled: isEnabled, // keep current toggle state
        passwordHash: newHash,
      },
    });

    setSuccess("Password successfully set!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChanging(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  // If locked, show the premium card
  if (!isAdminUnlocked) {
    return (
      <section className="view-section active">
        <h1 className="page-title">Password Protection</h1>
        <p className="page-desc">Protect your focus by requiring a password to change settings or unblock sites.</p>
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <i className="fas fa-lock" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "20px" }}></i>
          <h3>Premium Feature</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>
            This feature is locked. Please upgrade to Unlimited plan to enable password protection.
          </p>
          <button className="btn-premium" style={{ width: "auto", marginTop: "24px", padding: "10px 24px", fontSize: "14px" }}>Go Unlimited</button>
        </div>
      </section>
    );
  }

  return (
    <section className="view-section active">
      <h1 className="page-title">Password Protection</h1>
      <p className="page-desc">Protect your focus by requiring a password to change settings or unblock sites.</p>

      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>Enable Password Protection</h3>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
              Require a password to modify FocusShield settings.
            </p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={!hasPassword}
            />
            <span className="slider"></span>
          </label>
        </div>
        {!hasPassword && (
          <p style={{ margin: "12px 0 0 0", color: "var(--danger)", fontSize: "12px" }}>
            <i className="fas fa-exclamation-triangle"></i> You must set a password before enabling this feature.
          </p>
        )}
      </div>

      <div className="card">
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
          {hasPassword ? (isChanging ? "Change Password" : "Password Set") : "Set Password"}
        </h3>
        
        {hasPassword && !isChanging ? (
          <div>
            <p style={{ color: "var(--success)", fontSize: "14px", marginBottom: "16px" }}>
              <i className="fas fa-check-circle"></i> A password is currently set.
            </p>
            <button 
              className="btn btn-outline" 
              onClick={() => setIsChanging(true)}
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSetPassword}>
            {hasPassword && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-main)",
                    color: "var(--text-main)",
                    fontFamily: "inherit",
                    fontSize: "14px"
                  }}
                  required
                />
              </div>
            )}
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}>
                {hasPassword ? "New Password" : "Password"}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-main)",
                  color: "var(--text-main)",
                  fontFamily: "inherit",
                  fontSize: "14px"
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-main)",
                  color: "var(--text-main)",
                  fontFamily: "inherit",
                  fontSize: "14px"
                }}
                required
              />
            </div>

            {error && <div style={{ color: "var(--danger)", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>{error}</div>}
            {success && <div style={{ color: "var(--success)", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>{success}</div>}

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn btn-success" style={{ padding: "10px 24px" }}>
                Save Password
              </button>
              {hasPassword && isChanging && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => {
                    setIsChanging(false);
                    setError("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
