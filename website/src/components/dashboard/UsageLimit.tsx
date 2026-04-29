"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useFocusData } from "../../lib/FocusDataContext";
import { FREE_LIMIT } from "../../lib/extensionBridge";

interface UsageLimitItem {
  domain: string;
  limitMinutes: number;
}

interface UsageLimitProps {
  isAdminUnlocked: boolean;
  showUpgrade: boolean;
  onOpenModal: () => void;
}

export default function UsageLimit({ isAdminUnlocked, showUpgrade, onOpenModal }: UsageLimitProps) {
  const { data, updateData } = useFocusData();
  const { usageLimits } = data;
  const [dayData, setDayData] = useState<Record<string, number>>({});

  const getTodayKey = () => {
    const d = new Date();
    return `insights_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const loadDayData = useCallback(async () => {
    try {
      const { getData } = await import("../../lib/extensionBridge");
      const todayKey = getTodayKey();
      const result = await getData([todayKey]);
      setDayData((result[todayKey] as Record<string, number>) || {});
    } catch { /* Extension not installed */ }
  }, []);

  useEffect(() => { 
    loadDayData();
    const interval = setInterval(loadDayData, 10000); // Refresh usage every 10s
    return () => clearInterval(interval);
  }, [loadDayData]);

  const deleteItem = (index: number) => {
    const updated = [...usageLimits];
    updated.splice(index, 1);
    updateData({ usageLimits: updated });
  };

  const updateLimit = (index: number, value: number) => {
    const updated = [...usageLimits];
    updated[index] = { ...updated[index], limitMinutes: value };
    updateData({ usageLimits: updated });
  };

  const minuteSteps = [5, 10, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const hourSteps: number[] = [];
  for (let h = 1.5; h <= 24; h += 0.5) hourSteps.push(h * 60);

  const remaining = FREE_LIMIT - usageLimits.length;

  return (
    <section id="view-usage-limit" className="view-section active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Usage Limit</h1>
          <p className="page-desc">Set daily time limits for specific websites. Once you reach your limit, access will be blocked until the next day.</p>
        </div>
      </div>
      <div style={{ display: "flex", marginBottom: "32px" }}>
        <button className="btn btn-success" onClick={onOpenModal} style={{ padding: "12px 28px", fontSize: "14px", borderRadius: "8px", fontWeight: 600 }}>
          <i className="fas fa-plus"></i> Add New Site Limit
        </button>
      </div>
      
      <div className="table-container">
        <div className="table-header">
          <div style={{ width: "35%" }}>Website</div>
          <div style={{ width: "30%", textAlign: "center" }}>Progress / Time Remaining</div>
          <div style={{ width: "20%", textAlign: "center" }}>Daily Limit</div>
          <div style={{ width: "15%", textAlign: "right" }}>Actions</div>
        </div>
        <div id="usage-list-container">
          {usageLimits.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", background: "white", borderRadius: "12px" }}>
              <i className="fas fa-clock" style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.3 }}></i>
              <p>No usage limits set. Add a site to start tracking!</p>
            </div>
          ) : usageLimits.map((item, index) => {
            const secsUsed = dayData[item.domain] || 0;
            const minsUsed = Math.floor(secsUsed / 60);
            const limitMins = item.limitMinutes;
            const remainingMins = Math.max(0, limitMins - minsUsed);
            const progress = limitMins > 0 ? Math.min(100, (minsUsed / limitMins) * 100) : 0;
            const isNearLimit = progress > 80;
            const isOverLimit = progress >= 100;

            return (
              <div className="table-row" key={`usage-${item.domain}-${index}`} style={{ padding: "20px 24px" }}>
                <div className="item-info" style={{ width: "35%" }}>
                  <div className="item-icon" style={{ background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <img src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} alt="" />
                  </div>
                  <div className="item-details">
                    <span className="item-domain" style={{ fontWeight: 700, fontSize: "15px" }}>{item.domain}</span>
                    <span className="item-type" style={{ fontSize: "12px" }}>Tracking active</span>
                  </div>
                </div>

                <div style={{ width: "30%", textAlign: "center", padding: "0 20px" }}>
                  <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600 }}>
                    <span style={{ color: isOverLimit ? "var(--danger)" : "var(--text-main)" }}>
                      {minsUsed}m used
                    </span>
                    <span style={{ color: isOverLimit ? "var(--danger)" : "var(--primary)" }}>
                      {limitMins > 0 ? `${remainingMins}m left` : "Unlimited"}
                    </span>
                  </div>
                  <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        width: `${progress}%`, 
                        background: isOverLimit ? "var(--danger)" : isNearLimit ? "#f59e0b" : "var(--primary)",
                        transition: "width 0.5s ease-in-out",
                        boxShadow: isNearLimit ? "0 0 10px rgba(245, 158, 11, 0.3)" : "none"
                      }} 
                    />
                  </div>
                </div>

                <div style={{ width: "20%", textAlign: "center" }}>
                  <select 
                    value={item.limitMinutes} 
                    onChange={(e) => updateLimit(index, parseInt(e.target.value))} 
                    className="settings-input"
                    style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, width: "130px", border: "1px solid var(--border)" }}
                  >
                    <option value={0}>No Limit</option>
                    {minuteSteps.map((m) => <option key={m} value={m}>{m} mins</option>)}
                    {hourSteps.map((m) => <option key={m} value={m}>{m / 60} hours</option>)}
                  </select>
                </div>

                <div style={{ width: "15%", textAlign: "right" }}>
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteItem(index)}
                    style={{ background: "#fee2e2", color: "#ef4444", width: "36px", height: "36px", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(!isAdminUnlocked && showUpgrade) && (
        <div className="banner-upgrade premium-element">
          <div className="banner-text">
            {remaining > 0 ? (
              <>
                <strong>{remaining} place{remaining === 1 ? "" : "s"} left</strong> to set usage limits.{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  Click here to upgrade and enjoy unlimited site limits.
                </span>
              </>
            ) : (
              <>
                <strong>Limit reached!</strong> If you want to add more, you have to upgrade.{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  Take full control of your time with FocusShield Unlimited.
                </span>
              </>
            )}
          </div>
          <button className="btn-premium" style={{ width: "auto" }}>Go Unlimited</button>
        </div>
      )}
    </section>
  );
}
