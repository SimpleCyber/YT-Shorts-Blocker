"use client";

import React, { useState } from "react";
import { getData, setData, DEFAULTS, MODAL_CATEGORIES, SUGGESTED_SITES, ADULT_KEYWORDS, FREE_LIMIT } from "../../lib/extensionBridge";

interface AddBlockModalProps {
  isOpen: boolean;
  mode: "block" | "usage";
  isAdminUnlocked: boolean;
  onClose: () => void;
  onDone: () => void;
}

export default function AddBlockModal({ isOpen, mode, isAdminUnlocked, onClose, onDone }: AddBlockModalProps) {
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState("");
  const [showAllWebsites, setShowAllWebsites] = useState(false);

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
      let site = searchText.trim().toLowerCase();
      site = site.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");
      if (site) {
        setSelectedSites((prev) => new Set(prev).add(site));
        setSearchText("");
      }
    }
  };

  const handleDone = async () => {
    if (selectedSites.size === 0 && selectedCategories.size === 0) return;

    try {
      const result = await getData(["blockedSites", "blockedCategories", "blockedKeywords", "usageLimits"]);
      const blockedSites = (result.blockedSites as string[]) || DEFAULTS.blockedSites;
      const blockedCategories = (result.blockedCategories as string[]) || [];
      const blockedKeywords = (result.blockedKeywords as string[]) || [];
      const usageLimits = (result.usageLimits as { domain: string; limitMinutes: number }[]) || [];

      if (mode === "block") {
        selectedSites.forEach((site) => {
          if (!blockedSites.includes(site)) blockedSites.push(site);
        });
        selectedCategories.forEach((catId) => {
          if (catId === "adult") {
            ADULT_KEYWORDS.forEach((kw) => {
              if (!blockedKeywords.includes(kw)) blockedKeywords.push(kw);
            });
          } else {
            if (!blockedCategories.includes(catId)) blockedCategories.push(catId);
          }
        });
        await setData({ blockedSites, blockedCategories, blockedKeywords });
      } else {
        const sitesToAdd = new Set(selectedSites);
        selectedCategories.forEach((catId) => {
          const cat = MODAL_CATEGORIES.find((c) => c.id === catId);
          if (cat) cat.sites.forEach((s) => sitesToAdd.add(s));
        });
        sitesToAdd.forEach((site) => {
          if (!usageLimits.find((u) => u.domain === site)) {
            usageLimits.push({ domain: site, limitMinutes: 30 });
          }
        });
        await setData({ usageLimits });
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }

    // Reset and close
    setSelectedSites(new Set());
    setSelectedCategories(new Set());
    setSearchText("");
    setShowAllWebsites(false);
    onDone();
  };

  const handleClose = () => {
    setSelectedSites(new Set());
    setSelectedCategories(new Set());
    setSearchText("");
    setShowAllWebsites(false);
    onClose();
  };

  const filter = searchText.trim().toLowerCase();
  const filteredCategories = MODAL_CATEGORIES.filter(
    (cat) => cat.name.toLowerCase().includes(filter) || cat.sites.some((s) => s.includes(filter))
  );
  let displaySites = SUGGESTED_SITES.filter((s) => s.name.includes(filter));
  if (!showAllWebsites && filter === "") displaySites = displaySites.slice(0, 4);

  const totalSelected = selectedSites.size + selectedCategories.size;

  return (
    <div
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="add-modal">
        <div className="modal-header">
          <h2 className="modal-title">Add to Block List</h2>
          <div className="modal-subtitle">Choose which to block</div>
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
          <div className="modal-tab active">All</div>
          <div className="modal-tab">Websites</div>
          <div className="modal-tab">Keywords</div>
          <div className="modal-tab">Categories</div>
        </div>

        <div className="modal-body">
          <div className="modal-section-header">
            <div className="modal-section-title">Categories to Block</div>
          </div>
          <div className="grid-2col">
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategories.has(cat.id);
              return (
                <div className="suggestion-card" key={cat.id} style={{ cursor: "pointer" }} onClick={() => toggleCategory(cat.id)}>
                  <div className="suggestion-info">
                    <div className="suggestion-icon"><i className={`fas ${cat.icon}`} style={{ color: cat.color }}></i></div>
                    <span className="suggestion-name">{cat.name}</span>
                  </div>
                  <button className={`btn-add-item ${isSelected ? "selected" : ""}`} style={{ pointerEvents: "none" }}>
                    <i className={`fas ${isSelected ? "fa-check" : "fa-plus"}`}></i>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="modal-section-header">
            <div className="modal-section-title">Websites to Block</div>
            <div className="modal-section-link" onClick={() => setShowAllWebsites(!showAllWebsites)}>
              {showAllWebsites ? "See less" : "See more"}
            </div>
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
                  <button className={`btn-add-item ${isSelected ? "selected" : ""}`} onClick={() => toggleSite(site.name)}>
                    <i className={`fas ${isSelected ? "fa-check" : "fa-plus"}`}></i>
                  </button>
                </div>
              );
            })}
          </div>
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
    </div>
  );
}
