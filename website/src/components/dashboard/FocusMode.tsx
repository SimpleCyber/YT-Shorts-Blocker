"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { getData, DEFAULTS } from "../../lib/extensionBridge";

const TIMER_FULL_DASH = 251.2;

export default function FocusMode() {
  const [focusTimeLeft, setFocusTimeLeft] = useState(DEFAULTS.focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [blockCount, setBlockCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadBlockCount = useCallback(async () => {
    try {
      const result = await getData(["blockedSites", "blockedCategories", "blockedKeywords"]);
      const sites = (result.blockedSites as string[]) || [];
      const cats = (result.blockedCategories as string[]) || [];
      const kws = (result.blockedKeywords as string[]) || [];
      setBlockCount(sites.length + cats.length + (kws.length > 0 ? 1 : 0));
    } catch { /* extension not available */ }
  }, []);

  useEffect(() => { loadBlockCount(); }, [loadBlockCount]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setFocusTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const mins = Math.floor(focusTimeLeft / 60);
  const secs = focusTimeLeft % 60;
  const progress = focusTimeLeft / DEFAULTS.focusDuration;
  const dashoffset = TIMER_FULL_DASH - progress * TIMER_FULL_DASH;

  const handleToggle = () => setIsRunning((r) => !r);
  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setFocusTimeLeft(DEFAULTS.focusDuration);
  };

  return (
    <section id="view-focus-mode" className="view-section active">
      <h1 className="page-title">Focus Mode</h1>
      <p className="page-desc">
        To focus on a task and be more productive use focus mode to set your work time and break intervals. Add sites to your block list to avoid distractions during a focus session
      </p>

      <div className="card focus-container">
        <div style={{ marginBottom: "24px", color: "var(--text-main)", fontWeight: 600 }}>
          1 of 2 cycles | <span style={{ color: "var(--text-muted)" }}>Focus for 25 minutes</span>
        </div>

        <div className="focus-timer">
          <svg viewBox="0 0 100 100">
            <circle className="focus-timer-bg" cx="50" cy="50" r="40"></circle>
            <circle className="focus-timer-progress" cx="50" cy="50" r="40" strokeDasharray="251.2" strokeDashoffset={dashoffset}></circle>
          </svg>
          <div className="focus-time-display">
            <div className="time-val">{`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`}</div>
            <div className="time-labels"><span>min</span><span>sec</span></div>
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          {blockCount > 0 ? `${blockCount} items in block list active` : "No sites in block list blocked"}
        </p>

        <div className="focus-controls">
          <button className="btn btn-outline" style={{ width: "100px", justifyContent: "center" }} onClick={handleReset}>Reset</button>
          <button className={`btn ${isRunning ? "btn-outline" : "btn-success"}`} style={{ width: "100px", justifyContent: "center" }} onClick={handleToggle}>
            {isRunning ? "Pause" : "Start"}
          </button>
        </div>
      </div>
    </section>
  );
}
