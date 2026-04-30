"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useFocusData } from "./FocusDataContext";

interface PasswordPromptContextType {
  requirePassword: (action: () => void) => void;
}

const PasswordPromptContext = createContext<PasswordPromptContextType | null>(null);

export const usePasswordPrompt = () => {
  const ctx = useContext(PasswordPromptContext);
  if (!ctx) throw new Error("usePasswordPrompt must be used within PasswordPromptProvider");
  return ctx;
};

// SHA-256 hash helper
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const PasswordPromptProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useFocusData();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [timeLeftStr, setTimeLeftStr] = useState("");

  const lockUntil = data.passwordProtection?.lockUntil || 0;
  const isLocked = lockUntil > Date.now();

  const requirePassword = (action: () => void) => {
    if (data.passwordProtection?.enabled && data.passwordProtection?.passwordHash) {
      setPendingAction(() => action);
      setIsOpen(true);
      setPasswordInput("");
      setError("");
    } else {
      action(); // Proceed immediately if disabled
    }
  };

  // Countdown logic for the modal
  useEffect(() => {
    if (!isOpen || !isLocked) return;

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
  }, [isOpen, isLocked, lockUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return; // Action is blocked

    const hash = await hashPassword(passwordInput);
    if (hash === data.passwordProtection?.passwordHash) {
      setIsOpen(false);
      if (pendingAction) pendingAction();
      setPendingAction(null);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPendingAction(null);
    setPasswordInput("");
    setError("");
  };

  return (
    <PasswordPromptContext.Provider value={{ requirePassword }}>
      {children}
      
      {isOpen && (
        <div 
          className="modal-overlay active" 
          style={{ zIndex: 10000, cursor: "pointer" }}
          onClick={handleCancel}
        >
          <div 
            className="card" 
            style={{ width: "450px", maxWidth: "90vw", zIndex: 10001, margin: "auto", cursor: "default" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: isLocked ? "0" : "20px" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "50%", 
                background: "var(--bg-hover)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 12px auto" 
              }}>
                <i className={`fas ${isLocked ? "fa-lock" : "fa-shield-alt"}`} style={{ fontSize: "20px", color: "var(--primary)" }}></i>
              </div>
              <h3 style={{ margin: "0 0 8px 0" }}>{isLocked ? "Action Locked" : "Password Required"}</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
                {isLocked 
                  ? "This action cannot be performed because you have locked your settings." 
                  : "This action is protected. Enter your password to continue."
                }
              </p>
            </div>

            {isLocked ? (
              <div style={{ textAlign: "center", padding: "20px 0 10px 0" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary)" }}>
                  {timeLeftStr}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                  Action restricted until the lock expires.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-main)",
                      color: "var(--text-main)",
                      fontFamily: "inherit",
                      fontSize: "14px"
                    }}
                    required
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                    {error ? (
                      <p style={{ color: "var(--danger)", fontSize: "12px", fontWeight: 600, margin: 0 }}>
                        <i className="fas fa-exclamation-circle"></i> {error}
                      </p>
                    ) : <div></div>}
                    <a 
                      href="/dashboard?view=view-password&trigger-reset=true" 
                      style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={handleCancel}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center", background: "var(--primary)", color: "white" }}
                  >
                    Confirm
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PasswordPromptContext.Provider>
  );
};
