"use client";

import React from "react";

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  limit: number;
}

export default function LimitModal({ isOpen, onClose, title, message, limit }: LimitModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay active" 
      style={{ zIndex: 3000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="limit-modal" style={{ maxWidth: "450px", textAlign: "center", padding: "40px 30px" }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          background: "rgba(245, 158, 11, 0.1)", 
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          margin: "0 auto 24px"
        }}>
          <i className="fas fa-crown" style={{ fontSize: "32px", color: "var(--accent)" }}></i>
        </div>
        
        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px", color: "var(--text-main)" }}>
          {title}
        </h2>
        
        <p style={{ color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "32px", fontSize: "15px" }}>
          {message}
        </p>

        {/* <div style={{ 
          background: "#f8fafc", 
          borderRadius: "12px", 
          padding: "20px", 
          marginBottom: "32px",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          textAlign: "left"
        }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            background: "white", 
            borderRadius: "10px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <i className="fas fa-shield-alt" style={{ color: "var(--primary)" }}></i>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Free Plan Limit: {limit} items</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Upgrade for unlimited protection</div>
          </div>
        </div> */}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button 
            className="btn-premium" 
            style={{ width: "100%", padding: "14px", fontSize: "16px" }}
            onClick={() => {
              // Trigger upgrade flow
              onClose();
            }}
          >
            Upgrade to Go Unlimited
          </button>
          <button 
            onClick={onClose}
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "var(--text-muted)", 
              fontSize: "14px", 
              fontWeight: 600,
              cursor: "pointer",
              padding: "8px"
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
