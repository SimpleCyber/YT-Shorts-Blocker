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

function CustomSelect({ value, onChange, options }: { value: number; onChange: (val: number) => void; options: { value: number; label: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.value === value) || options[0];

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Scroll selected item into view when dropdown opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    }
  }, [isOpen]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', width: '156px', userSelect: 'none', fontFamily: "'Outfit', -apple-system, sans-serif" }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '10px 14px',
          background: 'var(--bg-card)',
          border: `1.5px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-main)',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : 'none',
          outline: 'none',
        }}
        onMouseEnter={(e) => { if (!isOpen) { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = 'var(--bg-hover)'; } }}
        onMouseLeave={(e) => { if (!isOpen) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; } }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedOption.label}</span>
        <i
          className="fas fa-chevron-down"
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        ></i>
      </button>

      {/* Dropdown panel */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: '50%',
          transform: `translateX(-50%) ${isOpen ? 'translateY(0)' : 'translateY(-8px)'}`,
          width: '180px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12), 0 4px 8px rgba(15, 23, 42, 0.06)',
          zIndex: 9990,
          padding: '6px',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Scrollable list — shows 5 items (5 × 40px = 200px) */}
        <div
          ref={listRef}
          className="custom-select-scrollbar"
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                type="button"
                key={opt.value}
                data-selected={isSelected ? 'true' : undefined}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <i className="fas fa-check" style={{ fontSize: '11px', color: 'var(--primary)' }}></i>
                  )}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-select-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-select-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        .custom-select-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 20px;
        }
        .custom-select-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
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
            <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "12px" }}>
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
                        boxShadow: isNearLimit ? "0 0 10px rgba(141, 121, 87, 0.3)" : "none"
                      }} 
                    />
                  </div>
                </div>

                <div style={{ width: "20%", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <CustomSelect 
                    value={item.limitMinutes} 
                    onChange={(val) => updateLimit(index, val)}
                    options={[
                      { value: 0, label: "No Limit" },
                      ...minuteSteps.map(m => ({ value: m, label: `${m} minutes` })),
                      ...hourSteps.map(m => ({ value: m, label: `${m / 60} hours` }))
                    ]}
                  />
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
