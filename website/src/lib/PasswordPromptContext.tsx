"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <div className="modal-overlay active" style={{ zIndex: 10000 }}>
          <div className="card" style={{ width: "400px", maxWidth: "90vw", zIndex: 10001, margin: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                <i className="fas fa-lock" style={{ fontSize: "20px", color: "var(--primary)" }}></i>
              </div>
              <h3 style={{ margin: "0 0 8px 0" }}>Password Required</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
                This action is protected. Enter your password to continue.
              </p>
            </div>

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
                {error && (
                  <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "8px", fontWeight: 600 }}>
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </p>
                )}
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
          </div>
        </div>
      )}
    </PasswordPromptContext.Provider>
  );
};
