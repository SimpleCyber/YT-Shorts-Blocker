"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getData } from "../../lib/extensionBridge";

interface InsightsProps {
  isAdminUnlocked: boolean;
}

export default function Insights({ isAdminUnlocked }: InsightsProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [avgTime, setAvgTime] = useState("No Data");
  const [topDay, setTopDay] = useState("No Data");
  const [topDistractions, setTopDistractions] = useState<{ domain: string; time: number; perc: number }[]>([]);
  const [totalTimeSecs, setTotalTimeSecs] = useState(0);
  const [blockedAttempts, setBlockedAttempts] = useState(0);
  const [timeSaved, setTimeSaved] = useState("0m");
  const [topCategory, setTopCategory] = useState("No Data");
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});

  function formatTime(secs: number) {
    if (secs === 0) return "0m";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  const loadData = useCallback(async () => {
    try {
      const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30;
      const keys: string[] = [];
      const statsKeys: string[] = [];
      
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        keys.push(`insights_${dateStr}`);
        statsKeys.push(`stats_${dateStr}`);
      }

      const result = await getData([...keys, ...statsKeys]);
      let total = 0, daysWithData = 0, topDayVal = 0, topDayDate = "No Data";
      let totalBlocked = 0;
      const domainTotals: Record<string, number> = {};
      const categoryTotals: Record<string, number> = {};

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

      statsKeys.forEach(key => {
        const stats = result[key] as any;
        if (stats) {
          if (stats.blockedAttempts) totalBlocked += stats.blockedAttempts;
          if (stats.blockedCategories) {
            for (const [cat, count] of Object.entries(stats.blockedCategories)) {
              categoryTotals[cat] = (categoryTotals[cat] as number || 0) + (count as number);
            }
          }
        }
      });

      setTotalTimeSecs(total);
      setBlockedAttempts(totalBlocked);
      // Rough estimate: Time saved is 2x blocked attempts in minutes
      setTimeSaved(`${totalBlocked * 2}m`);
      
      setAvgTime(daysWithData > 0 ? formatTime(total / daysWithData) : "No Data");
      setTopDay(topDayDate);

      // Find top category
      const topCatEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      setTopCategory(topCatEntry ? topCatEntry[0].charAt(0).toUpperCase() + topCatEntry[0].slice(1) : "No Data");
      setCategoryBreakdown(categoryTotals);

      const sorted = Object.entries(domainTotals).sort((a, b) => b[1] - a[1]);
      setTopDistractions(
        sorted.slice(0, 4).map(([domain, time]) => ({
          domain,
          time,
          perc: total > 0 ? Math.round((time / total) * 100) : 0,
        }))
      );
    } catch (e) {
      console.error("Failed to load insights", e);
    }
  }, [timeRange]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <section id="view-insights" className="view-section active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">Your Focus Insights</h1>
          <p className="page-desc">Track Your Focus and See How You Spend Time Online</p>
        </div>
        <div style={{ display: "flex", gap: "8px", background: "var(--bg-hover)", padding: "4px", borderRadius: "20px" }}>
          <button 
            className={`btn-toggle ${timeRange === "24h" ? "active" : ""}`}
            onClick={() => setTimeRange("24h")}
          >
            Today
          </button>
          <button 
            className={`btn-toggle ${timeRange === "7d" ? "active" : ""}`}
            onClick={() => setTimeRange("7d")}
          >
            Last 7 days
          </button>
          <button 
            className={`btn-toggle ${timeRange === "30d" ? "active" : ""} ${!isAdminUnlocked ? "locked" : ""}`}
            onClick={() => {
              if (isAdminUnlocked) {
                setTimeRange("30d");
              } else {
                // Optionally handle click for locked state (e.g., show upgrade modal)
                console.log("30-day range is a premium feature");
              }
            }}
          >
            Last 30 days {!isAdminUnlocked && <i className="fas fa-lock" style={{ fontSize: "10px", marginLeft: "4px" }}></i>}
          </button>
        </div>
      </div>

      <style jsx>{`
        .btn-toggle {
          background: transparent;
          border: none;
          padding: 6px 16px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-toggle.active {
          background: var(--bg-card);
          color: var(--primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .btn-toggle.locked {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-toggle.locked:hover {
          background: rgba(0,0,0,0.02);
        }
      `}</style>

      <div className="insights-top-stats">
        <div className="stat-card"><div className="stat-label">Average Focus Time</div><div className="stat-value">{avgTime}</div></div>
        <div className="stat-card"><div className="stat-label">Top Focus Day</div><div className="stat-value">{topDay}</div></div>
        <div className="stat-card"><div className="stat-label">Most Blocked Category</div><div className="stat-value">{topCategory}</div></div>
      </div>

      <div className="insights-charts">
        {/* Chart Cards */}
        {[
          { title: "Time Saved", icon: "far fa-clock", value: timeSaved, date: timeRange === "24h" ? "Today" : `Last ${timeRange === "7d" ? "7" : "30"} Days` },
          { title: "Blocked Attempts", icon: "fas fa-ban", value: blockedAttempts, date: timeRange === "24h" ? "Today" : `Last ${timeRange === "7d" ? "7" : "30"} Days` },
          { title: "Blocked Categories", icon: "fas fa-list", value: topCategory, date: timeRange === "24h" ? "Today" : `Last ${timeRange === "7d" ? "7" : "30"} Days`, isPie: true }
        ].map((chart, idx) => (
          <div className="chart-card" key={idx}>
            <div className="chart-header">
              <span className="chart-title"><i className={chart.icon}></i> {chart.title}</span>
              <span className="chart-date">{chart.date}</span>
            </div>
            <div className="chart-content" style={chart.isPie ? { flexDirection: "column", gap: "20px" } : {}}>
              {(timeRange === "30d" && !isAdminUnlocked) ? (
                <div style={{ textAlign: 'center', opacity: 0.6 }}>
                  <i className="fas fa-lock" style={{ fontSize: '24px', marginBottom: '12px' }}></i>
                  <p style={{ fontSize: '12px' }}>Premium Feature</p>
                </div>
              ) : (
                <>
                  {chart.isPie && <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "16px solid #f1f5f9" }}></div>}
                  <div style={{ fontSize: chart.isPie ? "14px" : "24px", fontWeight: 700, color: "var(--primary)" }}>
                    {chart.value === 0 || chart.value === "No Data" ? "Nothing to see" : chart.value}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <div className="chart-card" style={{ alignItems: "center", textAlign: "center", justifyContent: "center", minHeight: "200px" }}>
          {(timeRange === "30d" && !isAdminUnlocked) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <i className="fas fa-lock" style={{ fontSize: '32px', color: 'var(--text-muted)' }}></i>
              <h3>Premium Insights</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Upgrade to see your top distractions over the last 30 days.</p>
              <button className="btn-premium">Go Unlimited</button>
            </div>
          ) : topDistractions.length > 0 ? (
            <>
              <div className="chart-header" style={{ alignSelf: "flex-start", marginBottom: "24px", width: "100%" }}>
                <span className="chart-title"><i className="fas fa-chart-pie"></i> Top Distractions</span>
                <span className="chart-date">{timeRange === "24h" ? "Today" : `Last ${timeRange === "7d" ? "7" : "30"} Days`}</span>
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
