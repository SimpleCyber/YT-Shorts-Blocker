"use client";

import React, { useState, useEffect } from "react";
import { useFocusData } from "../../lib/FocusDataContext";
import { useAuth } from "../../lib/AuthContext";

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
  const { user, sendFocusResetLink, isResetMode } = useAuth();
  const passwordProtection = data.passwordProtection || { enabled: false, passwordHash: "", lockUntil: null };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [urlResetMode, setUrlResetMode] = useState(false);
  
  const [isChanging, setIsChanging] = useState(false);
  const [lockDuration, setLockDuration] = useState("1"); // days
  const [timeLeftStr, setTimeLeftStr] = useState("");

  const isEnabled = passwordProtection.enabled;
  const hasPassword = !!passwordProtection.passwordHash;
  const lockUntil = passwordProtection.lockUntil || 0;
  const isLocked = lockUntil > Date.now();

  const durationOptions = [
    { label: "1 Day", value: "1" },
    { label: "2 Days", value: "2" },
    { label: "5 Days", value: "5" },
    { label: "1 Week", value: "7" },
    { label: "2 Weeks", value: "14" },
    { label: "3 Weeks", value: "21" },
    { label: "1 Month", value: "30" },
  ];

  // If the user arrived via a reset link, we allow them to set a new password without the old one
  const resetModeActive = (isResetMode || urlResetMode);

  // Auto-trigger reset email if requested via URL OR detect reset mode from URL directly
  useEffect(() => {
    const url = new URL(window.location.href);
    
    // Check for direct reset mode from URL (redundancy for AuthContext)
    if (url.searchParams.get('mode') === 'reset-focus-password') {
      setUrlResetMode(true);
    }

    if (url.searchParams.get('trigger-reset') === 'true' && user?.email) {
      handleForgotPassword();
      // Clean up param
      url.searchParams.delete('trigger-reset');
      window.history.replaceState({}, '', url.toString());
    }
  }, [user]);

  // Countdown logic
  useEffect(() => {
    if (!isLocked) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = lockUntil - now;

      if (diff <= 0) {
        setTimeLeftStr("");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeftStr(`${days} days and ${hours} hours remaining`);
      } else if (hours > 0) {
        setTimeLeftStr(`${hours} hours and ${minutes} minutes remaining`);
      } else {
        setTimeLeftStr(`${minutes} minutes and ${seconds} seconds remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockUntil]);

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

  const handleForgotPassword = async () => {
    if (!user?.email) {
      setError("Unable to find user email.");
      return;
    }
    
    setError("");
    setSuccess("");
    setIsSendingLink(true);
    
    try {
      await sendFocusResetLink(user.email);
      setSuccess("Reset link sent to your email! Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setIsSendingLink(false);
    }
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

    if (hasPassword && !resetModeActive) {
      const hashedCurrent = await hashPassword(currentPassword);
      if (hashedCurrent !== passwordProtection.passwordHash) {
        setError("Current password is incorrect.");
        return;
      }
    }

    const newHash = await hashPassword(newPassword);
    updateData({
      passwordProtection: {
        ...passwordProtection,
        passwordHash: newHash,
      },
    });

    setSuccess(resetModeActive ? "Password successfully reset!" : "Password successfully set!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChanging(false);
    
    if (resetModeActive) {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      window.history.replaceState({}, '', url.toString());
    }
    
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleLockSettings = () => {
    const days = parseInt(lockDuration);
    const msToAdd = days * 24 * 60 * 60 * 1000;
    const newLockUntil = Date.now() + msToAdd;

    updateData({
      passwordProtection: {
        ...passwordProtection,
        lockUntil: newLockUntil,
      }
    });
  };

  // If locked, show the standardized lock screen
  if (isLocked) {
    return (
      <section className="view-section active">
        <h1 className="page-title">Password Protection</h1>
        <p className="page-desc">Protect your focus by requiring a password to change settings or unblock sites.</p>
        
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <i className="fas fa-lock" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "20px" }}></i>
          <h3>Password Settings Locked</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "16px", fontWeight: 600 }}>
            {timeLeftStr}
          </p>
          <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "14px", maxWidth: "450px", margin: "12px auto 0 auto" }}>
            This feature is active. Access to edit these settings is restricted to help you maintain your commitment to productivity.
          </p>
        </div>
      </section>
    );
  }

  // If premium locked
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

      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
          {resetModeActive ? "Reset Forgotten Password" : (hasPassword ? (isChanging ? "Change Password" : "Password Set") : "Set Password")}
        </h3>
        
        {resetModeActive && (
          <p style={{ color: "var(--primary)", fontSize: "14px", marginBottom: "16px", fontWeight: 600 }}>
            <i className="fas fa-envelope-open-text"></i> Email verified. You can now set a new password.
          </p>
        )}
        
        {hasPassword && !isChanging && !resetModeActive ? (
          <div>
            <p style={{ color: "var(--success)", fontSize: "14px", marginBottom: "16px" }}>
              <i className="fas fa-check-circle"></i> A password is currently set.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setIsChanging(true)}
              >
                Change Password
              </button>
              <button 
                className="btn btn-outline" 
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                onClick={handleForgotPassword}
                disabled={isSendingLink}
              >
                {isSendingLink ? "Sending..." : "Forgot Password?"}
              </button>
            </div>
            {success && <div style={{ color: "var(--success)", fontSize: "13px", marginTop: "16px", fontWeight: 600 }}>{success}</div>}
            {error && <div style={{ color: "var(--danger)", fontSize: "13px", marginTop: "16px", fontWeight: 600 }}>{error}</div>}
          </div>
        ) : (
          <form onSubmit={handleSetPassword}>
            {hasPassword && !resetModeActive && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>
                    Current Password
                  </label>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                    disabled={isSendingLink}
                  >
                    {isSendingLink ? "Sending..." : "Forgot Password?"}
                  </button>
                </div>
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
                {resetModeActive ? "Reset Password" : "Save Password"}
              </button>
              {(hasPassword && isChanging && !resetModeActive) && (
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

      <div style={{ marginTop: "32px", padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <i className="fas fa-user-lock" style={{ color: "var(--primary)", fontSize: "18px" }}></i>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Self-Lock Settings</h3>
          <div style={{ position: "relative", display: "inline-block" }} className="tooltip-trigger">
            <i className="far fa-question-circle" style={{ color: "var(--text-muted)", cursor: "help", fontSize: "14px" }}></i>
            <div className="tooltip-content" style={{
              visibility: "hidden",
              position: "absolute",
              bottom: "125%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-main)",
              textAlign: "center",
              padding: "8px 12px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid var(--border)",
              width: "200px",
              zIndex: 10,
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "1.4",
              opacity: 0,
              transition: "opacity 0.2s, visibility 0.2s"
            }}>
              Locks your password settings so they can't be changed or disabled until the timer ends.
            </div>
          </div>
          <style>{`
            .tooltip-trigger:hover .tooltip-content {
              visibility: visible !important;
              opacity: 1 !important;
            }
          `}</style>
        </div>
        <p style={{ margin: "0 0 20px 0", color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.5" }}>
          Feeling tempted? Lock these password settings for a specific period. During this time, you won't be able to disable password protection or change your password.
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px", width: "100%" }}>
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLockDuration(opt.value)}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: lockDuration === opt.value ? "var(--primary)" : "var(--border)",
                  background: lockDuration === opt.value ? "rgba(79, 70, 229, 0.05)" : "var(--bg-main)",
                  color: lockDuration === opt.value ? "var(--primary)" : "var(--text-main)",
                  fontSize: "13px",
                  fontWeight: lockDuration === opt.value ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleLockSettings}
            disabled={!hasPassword}
            style={{ 
              padding: "8px 24px", 
              fontSize: "13px",
              fontWeight: 600
            }}
          >
            <i className="fas fa-lock" style={{ marginRight: "8px" }}></i> Lock Item
          </button>
        </div>
        
        {!hasPassword && (
          <p style={{ margin: "12px 0 0 0", color: "var(--text-muted)", fontSize: "12px" }}>
            * Set a password first to enable locking.
          </p>
        )}
      </div>
    </section>
  );
}
