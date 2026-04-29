"use client";

import React, { useState } from "react";
import { MODAL_CATEGORIES, SUGGESTED_SITES, ADULT_KEYWORDS, FREE_LIMIT } from "../../lib/extensionBridge";
import { useFocusData } from "../../lib/FocusDataContext";
import LimitModal from "./LimitModal";

interface AddBlockModalProps {
  isOpen: boolean;
  mode: "block" | "usage";
  isAdminUnlocked: boolean;
  onClose: () => void;
  onDone: () => void;
}

export default function AddBlockModal({ isOpen, mode, isAdminUnlocked, onClose, onDone }: AddBlockModalProps) {
  const { data, updateData } = useFocusData();
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState("");
  const [showAllWebsites, setShowAllWebsites] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "websites" | "keywords" | "categories">("all");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalData, setLimitModalData] = useState({ title: "", message: "" });

  const toggleSite = (site: string) => {
    setSelectedSites((prev) => {
      const next = new Set(prev);
      if (next.has(site)) next.delete(site); else next.add(site);
      return next;
    });
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      let text = searchText.trim().toLowerCase();
      if (!text) return;

      if (activeTab === "keywords") {
        setSelectedKeywords((prev) => new Set(prev).add(text));
        setSearchText("");
      } else {
        const site = text.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");
        if (site) {
          setSelectedSites((prev) => new Set(prev).add(site));
          setSearchText("");
        }
      }
    }
  };

  const handleDone = async () => {
    if (selectedSites.size === 0 && selectedCategories.size === 0 && selectedKeywords.size === 0) return;

    const currentTotal = mode === "block" 
      ? (data.blockedSites.length + data.blockedCategories.length + (data.blockedKeywords.length > 0 ? 1 : 0))
      : data.usageLimits.length;
    
    const newItemsCount = selectedSites.size + selectedCategories.size + (selectedKeywords.size > 0 ? 1 : 0);

    if (!isAdminUnlocked && (currentTotal + newItemsCount) > FREE_LIMIT) {
      setLimitModalData({
        title: "Limit Reached!",
        message: `Your free plan allows only ${FREE_LIMIT} ${mode === "block" ? "blocked items" : "usage limits"}. Upgrade now to add unlimited sites and take full control of your focus.`
      });
      setShowLimitModal(true);
      return;
    }

    try {
      const updatedBlockedSites = [...data.blockedSites];
      const updatedBlockedCategories = [...data.blockedCategories];
      const updatedBlockedKeywords = [...data.blockedKeywords];
      const updatedUsageLimits = [...data.usageLimits];

      if (mode === "block") {
        selectedSites.forEach((site) => {
          if (!updatedBlockedSites.includes(site)) updatedBlockedSites.push(site);
        });
        selectedCategories.forEach((catId) => {
          if (catId === "adult") {
            ADULT_KEYWORDS.forEach((kw) => {
              if (!updatedBlockedKeywords.includes(kw)) updatedBlockedKeywords.push(kw);
            });
          } else {
            if (!updatedBlockedCategories.includes(catId)) updatedBlockedCategories.push(catId);
          }
        });
        selectedKeywords.forEach((kw) => {
          if (!updatedBlockedKeywords.includes(kw)) updatedBlockedKeywords.push(kw);
        });

        updateData({ 
          blockedSites: updatedBlockedSites, 
          blockedCategories: updatedBlockedCategories, 
          blockedKeywords: updatedBlockedKeywords 
        });
      } else {
        const updatedUsageLimits = [...data.usageLimits];
        const sitesToAdd = new Set(selectedSites);
        selectedCategories.forEach((catId) => {
          const cat = MODAL_CATEGORIES.find((c) => c.id === catId);
          if (cat) cat.sites.forEach((s) => sitesToAdd.add(s));
        });
        
        sitesToAdd.forEach((site) => {
          if (!updatedUsageLimits.find((u) => u.domain === site)) {
            updatedUsageLimits.push({ domain: site, limitMinutes: 30 });
          }
        });
        
        updateData({ usageLimits: updatedUsageLimits });
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }

    // Reset and close
    setSelectedSites(new Set());
    setSelectedCategories(new Set());
    setSelectedKeywords(new Set());
    setSearchText("");
    setShowAllWebsites(false);
    setActiveTab("all");
    onDone();
  };

  const handleClose = () => {
    setSelectedSites(new Set());
    setSelectedCategories(new Set());
    setSelectedKeywords(new Set());
    setSearchText("");
    setShowAllWebsites(false);
    setActiveTab("all");
    onClose();
  };


  const filter = searchText.trim().toLowerCase();
  const filteredCategories = MODAL_CATEGORIES.filter(
    (cat) => cat.name.toLowerCase().includes(filter) || cat.sites.some((s) => s.includes(filter))
  );
  
  let displaySites = SUGGESTED_SITES.filter((s) => s.name.includes(filter));
  
  // Add custom suggestion from search text
  if (filter && !displaySites.find(s => s.name === filter)) {
    // Basic domain extraction for display
    const customSite = filter.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");
    if (customSite) {
      displaySites = [{ name: customSite, icon: customSite }, ...displaySites];
    }
  }

  if (!showAllWebsites && filter === "" && activeTab === "all") displaySites = displaySites.slice(0, 4);

  const isAlreadyAdded = (type: "site" | "category" | "keyword", value: string) => {
    if (mode === "block") {
      if (type === "site") return data.blockedSites.includes(value);
      if (type === "category") return data.blockedCategories.includes(value);
      if (type === "keyword") return data.blockedKeywords.includes(value);
    } else {
      if (type === "site") return data.usageLimits.some(u => u.domain === value);
      if (type === "category") return false; // Usage limits are domain-based
    }
    return false;
  };

  const totalSelected = selectedSites.size + selectedCategories.size + selectedKeywords.size;

  return (
    <div
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="add-modal">
        <div className="modal-header">
          <h2 className="modal-title">{mode === "block" ? "Add to Block List" : "Add Usage Limit"}</h2>
          <div className="modal-subtitle">Choose which to {mode === "block" ? "block" : "limit"}</div>
        </div>

        <div className="modal-search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            className="modal-search-input"
            placeholder="Type here website, category or keyword (Press Enter to add custom)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchEnter}
          />
        </div>

        <div className="modal-tabs">
          <div className={`modal-tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All</div>
          <div className={`modal-tab ${activeTab === "websites" ? "active" : ""}`} onClick={() => setActiveTab("websites")}>Websites</div>
          <div className={`modal-tab ${activeTab === "keywords" ? "active" : ""}`} onClick={() => setActiveTab("keywords")}>Keywords</div>
          <div className={`modal-tab ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>Categories</div>
        </div>

        <div className="modal-body">
          {(activeTab === "all" || activeTab === "categories") && (
            <>
              <div className="modal-section-header">
                <div className="modal-section-title">Categories to Block</div>
              </div>
              <div className="grid-2col" style={{ marginBottom: activeTab === "all" ? "20px" : "0" }}>
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategories.has(cat.id);
                  return (
                    <div className="suggestion-card" key={cat.id} style={{ cursor: isAlreadyAdded("category", cat.id) ? "default" : "pointer" }} onClick={() => !isAlreadyAdded("category", cat.id) && toggleCategory(cat.id)}>
                      <div className="suggestion-info">
                        <div className="suggestion-icon"><i className={`fas ${cat.icon}`} style={{ color: cat.color }}></i></div>
                        <span className="suggestion-name">{cat.name}</span>
                      </div>
                      {isAlreadyAdded("category", cat.id) ? (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginRight: "10px" }}>Already blocked</span>
                      ) : (
                        <button className={`btn-add-item ${isSelected ? "selected" : ""}`} style={{ pointerEvents: "none" }}>
                          <i className={`fas ${isSelected ? "fa-check" : "fa-plus"}`}></i>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {(activeTab === "all" || activeTab === "websites") && (
            <>
              <div className="modal-section-header">
                <div className="modal-section-title">Websites to Block</div>
                {activeTab === "all" && (
                  <div className="modal-section-link" onClick={() => setShowAllWebsites(!showAllWebsites)}>
                    {showAllWebsites ? "See less" : "See more"}
                  </div>
                )}
              </div>
              <div className="grid-2col">
                {displaySites.map((site) => {
                  const isSelected = selectedSites.has(site.name);
                  return (
                    <div className="suggestion-card" key={site.name}>
                      <div className="suggestion-info">
                        <div className="suggestion-icon">
                          <img src={`https://www.google.com/s2/favicons?domain=${site.icon}&sz=32`} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} alt="" />
                        </div>
                        <span className="suggestion-name">{site.name}</span>
                      </div>
                      {isAlreadyAdded("site", site.name) ? (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginRight: "10px" }}>Already blocked</span>
                      ) : (
                        <button className={`btn-add-item ${isSelected ? "selected" : ""}`} onClick={() => toggleSite(site.name)}>
                          <i className={`fas ${isSelected ? "fa-check" : "fa-plus"}`}></i>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "keywords" && (
            <div style={{ padding: "10px" }}>
              <div style={{ marginBottom: "15px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                Type a keyword in the search bar above and press <strong>Enter</strong> to add it.
              </div>
              
              {selectedKeywords.size > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                  {Array.from(selectedKeywords).map((kw) => (
                    <div 
                      key={kw} 
                      className={`badge-active ${isAlreadyAdded("keyword", kw) ? "blocked" : ""}`}
                      style={{ 
                        padding: "6px 12px", 
                        borderRadius: "20px", 
                        fontSize: "13px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        cursor: isAlreadyAdded("keyword", kw) ? "default" : "pointer",
                        opacity: isAlreadyAdded("keyword", kw) ? 0.7 : 1
                      }}
                      onClick={() => {
                        if (isAlreadyAdded("keyword", kw)) return;
                        const next = new Set(selectedKeywords);
                        next.delete(kw);
                        setSelectedKeywords(next);
                      }}
                    >
                      {kw} {isAlreadyAdded("keyword", kw) ? "(Blocked)" : <i className="fas fa-times" style={{ fontSize: "10px" }}></i>}
                    </div>
                  ))}
                </div>
              )}

              {selectedKeywords.size === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <i className="fas fa-key" style={{ fontSize: "32px", marginBottom: "12px", display: "block" }}></i>
                  <p>No keywords added yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="modal-footer-text">
            {totalSelected > 0 ? `${totalSelected} items selected` : "Select Items to Start"}
          </div>
          <div className="modal-actions">
            <button className="btn btn-modal-cancel" onClick={handleClose}>Cancel</button>
            <button className={`btn btn-modal-done ${totalSelected > 0 ? "active" : ""}`} onClick={handleDone}>Done</button>
          </div>
        </div>
      </div>

      <LimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)}
        title={limitModalData.title}
        message={limitModalData.message}
        limit={FREE_LIMIT}
      />
    </div>
  );
}
