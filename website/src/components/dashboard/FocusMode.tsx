"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useFocusData } from "../../lib/FocusDataContext";
import { isExtensionAvailable, startFocus, pauseFocus, resetFocus } from "../../lib/extensionBridge";

const TIMER_FULL_DASH = 251.2;

export default function FocusMode() {
  const { data, updateData } = useFocusData();
  const [newWhitelistSite, setNewWhitelistSite] = useState("");
  const [siteError, setSiteError] = useState("");

  const session = data.focusSession;
  const isRunning = session.active && !session.paused;

  const mins = Math.floor(session.timeLeft / 60);
  const secs = session.timeLeft % 60;
  const progress = session.timeLeft / session.duration;
  const dashoffset = TIMER_FULL_DASH - progress * TIMER_FULL_DASH;

  const handleToggle = () => {
    if (!isExtensionAvailable()) return;
    
    if (!session.active) {
      startFocus(session.duration);
    } else {
      pauseFocus();
    }
  };

  const handleReset = () => {
    if (!isExtensionAvailable()) return;
    resetFocus();
  };

  const handleAddWhitelist = () => {
    let site = newWhitelistSite.trim().toLowerCase();
    site = site.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");

    if (!site) return;
    if (data.focusWhitelist.includes(site)) {
      setSiteError("Site already in whitelist");
      return;
    }

    updateData({ focusWhitelist: [...data.focusWhitelist, site] });
    setNewWhitelistSite("");
    setSiteError("");
  };

  const handleRemoveWhitelist = (site: string) => {
    updateData({ focusWhitelist: data.focusWhitelist.filter((s) => s !== site) });
  };

  return (
    <section id="view-focus-mode" className="view-section active">
      <h1 className="page-title">Focus Mode</h1>
      <p className="page-desc">
        Reclaim your productivity with deep work sessions. When active, only your whitelisted sites will be accessible.
      </p>

      <div className="focus-grid">
        {/* Left Column: Timer */}
        <div className="card focus-timer-card">
          <div className="focus-status">
            {session.active ? (session.paused ? "Session Paused" : "Focusing...") : "Ready to focus?"}
          </div>

          <div className="focus-timer">
            <svg viewBox="0 0 100 100">
              <circle className="focus-timer-bg" cx="50" cy="50" r="40"></circle>
              <circle 
                className="focus-timer-progress" 
                cx="50" 
                cy="50" 
                r="40" 
                strokeDasharray="251.2" 
                strokeDashoffset={dashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              ></circle>
            </svg>
            <div className="focus-time-display">
              <div className="time-val">{`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`}</div>
              <div className="time-labels"><span>min</span><span>sec</span></div>
            </div>
          </div>

          <div className="focus-controls">
            <button className="btn btn-outline" onClick={handleReset} disabled={!session.active}>Reset</button>
            <button 
              className={`btn ${isRunning ? "btn-danger" : "btn-success"}`} 
              onClick={handleToggle}
            >
              {session.active ? (session.paused ? "Resume" : "Pause") : "Start Focus"}
            </button>
          </div>
        </div>

        {/* Right Column: Whitelist */}
        <div className="card focus-whitelist-card">
          <div className="card-header-with-info">
            <h3 className="card-title">Focus Whitelist</h3>
            <div className="info-tooltip-wrapper">
              <i className="fas fa-question-circle info-icon"></i>
              <div className="focus-tooltip-content">
                These sites will ONLY be accessible during Focus Mode and will otherwise be disabled.
              </div>
            </div>
          </div>

          <div className="whitelist-input-group">
            <input 
              type="text" 
              className="input-main" 
              placeholder="e.g. docs.google.com" 
              value={newWhitelistSite}
              onChange={(e) => setNewWhitelistSite(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWhitelist()}
            />
            <button className="btn btn-primary" onClick={handleAddWhitelist}>Add</button>
          </div>
          {siteError && <div className="error-text">{siteError}</div>}

          <div className="whitelist-list">
            {data.focusWhitelist.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-list-ul"></i>
                <p>No sites whitelisted for focus</p>
              </div>
            ) : (
              data.focusWhitelist.map((site) => (
                <div key={site} className="whitelist-item">
                  <div className="site-info">
                    <img src={`https://www.google.com/s2/favicons?domain=${site}&sz=32`} alt="" />
                    <span>{site}</span>
                  </div>
                  <button className="btn-icon btn-remove" onClick={() => handleRemoveWhitelist(site)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
