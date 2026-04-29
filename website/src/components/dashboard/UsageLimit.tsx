"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getData, DEFAULTS } from "../../lib/extensionBridge";

interface UsageLimitItem {
  domain: string;
  limitMinutes: number;
}

export default function UsageLimit({ onOpenModal }: { onOpenModal: () => void }) {
  const [usageLimits, setUsageLimits] = useState<UsageLimitItem[]>([]);
  const [dayData, setDayData] = useState<Record<string, number>>({});

  const getTodayKey = () => {
    const d = new Date();
    return `insights_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const loadData = useCallback(async () => {
    try {
      const todayKey = getTodayKey();
      const result = await getData(["usageLimits", todayKey]);
      setUsageLimits((result.usageLimits as UsageLimitItem[]) || DEFAULTS.usageLimits);
      setDayData((result[todayKey] as Record<string, number>) || {});
    } catch { /* Extension not installed — expected in standalone mode */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteItem = async (index: number) => {
    const { setData } = await import("../../lib/extensionBridge");
    const updated = [...usageLimits];
    updated.splice(index, 1);
    await setData({ usageLimits: updated });
    setUsageLimits(updated);
  };

  const updateLimit = async (index: number, value: number) => {
    const { setData } = await import("../../lib/extensionBridge");
    const updated = [...usageLimits];
    updated[index] = { ...updated[index], limitMinutes: value };
    await setData({ usageLimits: updated });
    setUsageLimits(updated);
  };

  const minuteSteps = [5, 10, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const hourSteps: number[] = [];
  for (let h = 1.5; h <= 24; h += 0.5) hourSteps.push(h * 60);

  return (
    <section id="view-usage-limit" className="view-section active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Usage Limit</h1>
          <p className="page-desc">Set daily time limits for specific websites. Once you reach your limit, access will be blocked until the next day.</p>
        </div>
      </div>
      <div style={{ display: "flex", marginBottom: "24px" }}>
        <button className="btn btn-success" onClick={onOpenModal} style={{ padding: "10px 24px", fontSize: "14px", borderRadius: "6px" }}>
          <i className="fas fa-plus"></i> Add to Block List
        </button>
      </div>
      <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Tracked Items</h3>
      <div className="table-container">
        <div className="table-header">
          <div style={{ width: "40%" }}>Items</div>
          <div style={{ width: "20%", textAlign: "center" }}>Screen time</div>
          <div style={{ width: "20%", textAlign: "center" }}>Daily limit</div>
          <div style={{ width: "20%", textAlign: "right" }}>Actions</div>
        </div>
        <div id="usage-list-container">
          {usageLimits.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>No usage limits set. Add a site above!</div>
          ) : usageLimits.map((item, index) => {
            const secs = dayData[item.domain] || 0;
            const mins = Math.floor(secs / 60);
            return (
              <div className="table-row" key={`usage-${item.domain}-${index}`}>
                <div className="item-info" style={{ width: "40%" }}>
                  <div className="item-icon">
                    <img src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} alt="" />
                  </div>
                  <div className="item-details">
                    <span className="item-domain">{item.domain}</span>
                    <span className="item-type">Website</span>
                  </div>
                </div>
                <div style={{ width: "20%", textAlign: "center" }}>{mins} minute{mins === 1 ? "" : "s"} used</div>
                <div style={{ width: "20%", textAlign: "center" }}>
                  <select value={item.limitMinutes} onChange={(e) => updateLimit(index, parseInt(e.target.value))} style={{ padding: "6px", borderRadius: "4px", border: "1px solid var(--border)", outline: "none", background: "white", width: "120px" }}>
                    <option value={0}>No Limit</option>
                    {minuteSteps.map((m) => <option key={m} value={m}>{m} minutes</option>)}
                    {hourSteps.map((m) => <option key={m} value={m}>{m / 60} hours</option>)}
                  </select>
                </div>
                <div style={{ width: "20%", textAlign: "right" }}>
                  <button className="delete-btn" onClick={() => deleteItem(index)}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
