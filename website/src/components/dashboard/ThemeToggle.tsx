"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div style={{ width: "32px", height: "32px" }} />;
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? "var(--bg-hover)" : "transparent",
          border: "none",
          cursor: "pointer",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          borderRadius: "50%",
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => e.currentTarget.style.color = "var(--text-main)"}
        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
        title="Toggle Theme"
      >
        {resolvedTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            background: "var(--bg-sidebar)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            padding: "8px",
            minWidth: "140px",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
        >
          <button
            onClick={() => { setTheme("light"); setIsOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: theme === "light" ? "var(--bg-hover)" : "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "var(--text-main)", fontWeight: 600, fontSize: "13px", textAlign: "left", transition: "background 0.2s" }}
          >
            <Sun size={14} /> Light
          </button>
          <button
            onClick={() => { setTheme("dark"); setIsOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: theme === "dark" ? "var(--bg-hover)" : "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "var(--text-main)", fontWeight: 600, fontSize: "13px", textAlign: "left", transition: "background 0.2s" }}
          >
            <Moon size={14} /> Dark
          </button>
          <button
            onClick={() => { setTheme("system"); setIsOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: theme === "system" ? "var(--bg-hover)" : "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "var(--text-main)", fontWeight: 600, fontSize: "13px", textAlign: "left", transition: "background 0.2s" }}
          >
            <Monitor size={14} /> System
          </button>
        </div>
      )}
    </div>
  );
}
