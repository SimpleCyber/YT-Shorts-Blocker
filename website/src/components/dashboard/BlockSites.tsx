"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getData, setData, DEFAULTS, MODAL_CATEGORIES, ADULT_KEYWORDS, FREE_LIMIT } from "../../lib/extensionBridge";
import { useFocusData } from "../../lib/FocusDataContext";
import { usePasswordPrompt } from "../../lib/PasswordPromptContext";
import ScheduleModal from "./ScheduleModal";

interface BlockSitesProps {
  isAdminUnlocked: boolean;
  showUpgrade: boolean;
  onOpenModal: () => void;
}

export default function BlockSites({ isAdminUnlocked, showUpgrade, onOpenModal }: BlockSitesProps) {
  const { data, updateData } = useFocusData();
  const { blockedSites, blockedCategories, blockedKeywords, isWhitelistMode } = data;
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const { requirePassword } = usePasswordPrompt();

  const deleteSite = (site: string) => {
    requirePassword(() => {
      updateData({ blockedSites: blockedSites.filter((s) => s !== site) });
    });
  };

  const deleteCategory = (catId: string) => {
    requirePassword(() => {
      updateData({ blockedCategories: blockedCategories.filter((c) => c !== catId) });
    });
  };

  const deleteKeywords = () => {
    requirePassword(() => {
      updateData({ blockedKeywords: [] });
    });
  };

  const toggleWhitelist = (checked: boolean) => {
    requirePassword(() => {
      updateData({ isWhitelistMode: checked });
    });
  };

  const totalItems = blockedSites.length + blockedCategories.length + (blockedKeywords.length > 0 ? 1 : 0);
  const remaining = FREE_LIMIT - totalItems;

  // Check if keywords are mostly adult-related
  const adultKeywordsInList = blockedKeywords.filter((kw) => ADULT_KEYWORDS.includes(kw));
  const isAdultCategory = adultKeywordsInList.length >= 5;

  return (
    <section id="view-block-sites" className="view-section active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Block List</h1>
          <p className="page-desc">Block sites permanently or by schedule</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="tooltip-container">
            <i className="fas fa-question-circle tooltip-icon" style={{ fontSize: "16px" }}></i>
            <div className="tooltip-content schedule-tooltip">
              <b>What is the schedule about?</b>
              This schedule defines your "Free Hours". Select days and time intervals when you want to browse freely. Outside of these hours, your block list will be strictly enforced.<br /><br />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Free: 1 interval • Premium: Multiple</span>
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => setIsScheduleModalOpen(true)}>
            <i className="far fa-clock"></i> Schedule
          </button>
        </div>
      </div>

      <style jsx>{`
        .schedule-tooltip {
          top: 100% !important;
          bottom: auto !important;
          right: 0 !important;
          left: auto !important;
          transform: translateY(10px) !important;
          background: #1e293b !important;
          border: 1px solid var(--border) !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
          padding: 16px !important;
          width: 280px !important;
        }
        .schedule-tooltip::after {
          top: auto !important;
          bottom: 100% !important;
          left: auto !important;
          right: 20px !important;
          border-color: transparent transparent #1e293b transparent !important;
        }
        .tooltip-container:hover .schedule-tooltip {
          visibility: visible !important;
          opacity: 1 !important;
          transform: translateY(10px) !important;
        }
      `}</style>

      <div style={{ display: "flex", marginBottom: "24px" }}>
        <button
          className="btn btn-success"
          onClick={onOpenModal}
          style={{ padding: "10px 24px", fontSize: "14px", borderRadius: "6px" }}
        >
          <i className="fas fa-plus"></i> Add to Block List
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "16px" }}>Blocked Items</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
          <input
            type="checkbox"
            id="whitelist-toggle"
            checked={isWhitelistMode}
            onChange={(e) => toggleWhitelist(e.target.checked)}
          />
          <label htmlFor="whitelist-toggle">Whitelist mode</label>
          <i
            className="fas fa-question-circle"
            style={{ color: "var(--text-muted)" }}
            title="If enabled, ONLY these sites will be allowed. Everything else is blocked."
          ></i>
        </div>
      </div>

      <div className="table-container" id="block-list-container">
        {totalItems === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
            Your list is empty. Add sites above!
          </div>
        ) : (
          <>
            {blockedSites.map((site) => (
              <div className="table-row" key={`site-${site}`}>
                <div className="item-info">
                  <div className="item-icon">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${site}&sz=32`}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      alt=""
                    />
                  </div>
                  <div className="item-details">
                    <span className="item-domain">{site}</span>
                    <span className="item-type">Website</span>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => deleteSite(site)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
            {blockedCategories.map((catId) => {
              const cat = MODAL_CATEGORIES.find((c) => c.id === catId);
              return (
                <div className="table-row" key={`cat-${catId}`}>
                  <div className="item-info">
                    <div className="item-icon">
                      <i
                        className={`fas ${cat ? cat.icon : "fa-folder"}`}
                        style={{ color: cat ? cat.color : "var(--primary)" }}
                      ></i>
                    </div>
                    <div className="item-details">
                      <span className="item-domain">{cat ? cat.name : catId} Category</span>
                      <span className="item-type">Category</span>
                    </div>
                  </div>
                  <button className="delete-btn" onClick={() => deleteCategory(catId)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              );
            })}
            {blockedKeywords.length > 0 && (
              <div className="table-row">
                <div className="item-info">
                  <div className="item-icon">
                    <i className="fas fa-key" style={{ color: "#f59e0b" }}></i>
                  </div>
                  <div className="item-details">
                    <span className="item-domain">
                      {isAdultCategory ? "Adult (Keywords)" : "Custom Keywords"}
                    </span>
                    <span className="item-type">{blockedKeywords.length} terms</span>
                  </div>
                </div>
                <button className="delete-btn" onClick={deleteKeywords}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {(!isAdminUnlocked && showUpgrade) && (
        <div className="banner-upgrade premium-element">
          <div className="banner-text">
            {remaining > 0 ? (
              <>
                <strong>{remaining} place{remaining === 1 ? "" : "s"} left</strong> to add to your block list.{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  Click here to upgrade and enjoy an unlimited block list.
                </span>
              </>
            ) : (
              <>
                <strong>Limit reached!</strong> If you want to add more, you have to upgrade.{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  Block unlimited sites with FocusShield Unlimited.
                </span>
              </>
            )}
          </div>
          <button className="btn-premium" style={{ width: "auto" }}>Go Unlimited</button>
        </div>
      )}

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        isAdminUnlocked={isAdminUnlocked}
        showUpgrade={showUpgrade}
      />
    </section>
  );
}
