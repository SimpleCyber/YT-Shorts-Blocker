"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getData } from "../../lib/extensionBridge";

export default function Insights() {
  const [avgTime, setAvgTime] = useState("No Data");
  const [topDay, setTopDay] = useState("No Data");
  const [topDistractions, setTopDistractions] = useState<{ domain: string; time: number; perc: number }[]>([]);
  const [totalTimeSecs, setTotalTimeSecs] = useState(0);

  function formatTime(secs: number) {
    if (secs === 0) return "0m";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  const loadData = useCallback(async () => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        keys.push(`insights_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
      }

      const result = await getData(keys);
      let total = 0, daysWithData = 0, topDayVal = 0, topDayDate = "No Data";
      const domainTotals: Record<string, number> = {};

      keys.forEach((key) => {
        const dayData = result[key] as Record<string, number> | undefined;
        if (dayData) {
          daysWithData++;
          let dayTotal = 0;
          for (const [domain, time] of Object.entries(dayData)) {
            dayTotal += time;
            domainTotals[domain] = (domainTotals[domain] || 0) + time;
          }
          total += dayTotal;
          if (dayTotal > topDayVal) {
            topDayVal = dayTotal;
            const datePart = key.replace("insights_", "");
            const dObj = new Date(datePart);
            topDayDate = dObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          }
        }
      });

      setTotalTimeSecs(total);
      setAvgTime(daysWithData > 0 ? formatTime(total / daysWithData) : "No Data");
      setTopDay(topDayDate);

      const sorted = Object.entries(domainTotals).sort((a, b) => b[1] - a[1]);
      setTopDistractions(
        sorted.slice(0, 4).map(([domain, time]) => ({
          domain,
          time,
          perc: total > 0 ? Math.round((time / total) * 100) : 0,
        }))
      );
    } catch { /* Extension not installed — expected in standalone mode */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <section id="view-insights" className="view-section active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">Your Focus Insights</h1>
          <p className="page-desc">Track Your Focus and See How You Spend Time Online</p>
        </div>
        <div style={{ display: "flex", gap: "8px", background: "var(--bg-hover)", padding: "4px", borderRadius: "20px" }}>
          <button className="btn" style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "6px 16px" }}>Last 7 days</button>
          <button className="btn premium-element" style={{ background: "transparent", color: "var(--text-muted)", padding: "6px 16px" }}>Last 30 days <i className="fas fa-lock" style={{ fontSize: "10px" }}></i></button>
        </div>
      </div>

      <div className="insights-top-stats">
        <div className="stat-card"><div className="stat-label">Average Focus Time</div><div className="stat-value">{avgTime}</div></div>
        <div className="stat-card"><div className="stat-label">Top Focus Day</div><div className="stat-value">{topDay}</div></div>
        <div className="stat-card"><div className="stat-label">Most Blocked Category</div><div className="stat-value">No Data</div></div>
      </div>

      <div className="insights-charts">
        <div className="chart-card">
          <div className="chart-header"><span className="chart-title"><i className="far fa-clock"></i> Time Saved</span><span className="chart-date">Last 7 Days</span></div>
          <div className="chart-content">Nothing to see yet</div>
        </div>
        <div className="chart-card">
          <div className="chart-header"><span className="chart-title"><i className="fas fa-ban"></i> Blocked Attempts</span><span className="chart-date">Last 7 Days</span></div>
          <div className="chart-content">Nothing to see yet</div>
        </div>
        <div className="chart-card">
          <div className="chart-header"><span className="chart-title"><i className="fas fa-list"></i> Blocked Categories</span><span className="chart-date">Last 7 Days</span></div>
          <div className="chart-content" style={{ flexDirection: "column", gap: "20px" }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "20px solid #f1f5f9" }}></div>
            Nothing to see yet
          </div>
        </div>

        <div className="chart-card" style={{ alignItems: "center", textAlign: "center", justifyContent: "center", minHeight: "200px" }}>
          {topDistractions.length > 0 ? (
            <>
              <div className="chart-header" style={{ alignSelf: "flex-start", marginBottom: "24px", width: "100%" }}>
                <span className="chart-title"><i className="fas fa-chart-pie"></i> Top Distractions</span>
                <span className="chart-date">Last 7 Days</span>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                {topDistractions.map(({ domain, time, perc }) => (
                  <div key={domain} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} style={{ width: "24px", height: "24px", borderRadius: "4px" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} alt="" />
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{domain}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontWeight: 600 }}>{formatTime(time)}</span>
                      <div style={{ width: "100px", height: "6px", background: "var(--bg-hover)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${perc}%`, background: "var(--primary)", borderRadius: "3px" }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "16px", marginTop: "24px" }}><i className="fas fa-search" style={{ fontSize: "48px", color: "var(--primary)" }}></i></div>
              <h3 style={{ marginBottom: "8px" }}>Top Distractions</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>Browse more to see your top visited websites.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
