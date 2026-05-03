// Constants
const DEFAULTS = {
  blockedSites: ["youtube.com/shorts", "instagram.com/reels"],
};

// State
let currentDomain = "";
let timerInterval;

// DOM Elements
const navItems = document.querySelectorAll(".nav-item");
const tabContents = document.querySelectorAll(".tab-content");
const domainDisplay = document.getElementById("current-domain-display");
const btnBlockSite = document.getElementById("btn-block-site");
const btnEditList = document.getElementById("btn-edit-list");
const btnSettingsTop = document.getElementById("open-settings-top");
const closeBanner = document.getElementById("close-banner");
const upgradeBanner = document.getElementById("upgrade-banner");

// Auth Gate Elements
const loginGate = document.getElementById("login-gate");
const mainContent = document.querySelector(".main-content");
const bottomNav = document.querySelector(".bottom-nav");
const btnLogin = document.getElementById("btn-login");
const avatarImg = document.getElementById("avatar-img");

// Focus Mode Elements
const timerDisplay = document.getElementById("timer-display");
const timerProgress = document.querySelector(".timer-progress");
const btnTimerResume = document.getElementById("btn-timer-resume");
const btnTimerReset = document.getElementById("btn-timer-reset");
const focusStatusText = document.getElementById("focus-status-text");
const focusProgressBars = document.getElementById("focus-progress-bars");

// Insights Elements
const insightsEmptyState = document.getElementById("insights-empty-state");
const insightsDataState = document.getElementById("insights-data-state");

// Navigation Logic
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remove active class from all
    navItems.forEach((nav) => nav.classList.remove("active"));
    tabContents.forEach((tab) => tab.classList.remove("active"));

    // Add active class to clicked
    item.classList.add("active");
    const targetId = item.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");

    // Persist active tab across popup open/close
    chrome.storage.local.set({ popupActiveTab: targetId });
  });
});

// Settings & Edit Links
btnEditList.addEventListener("click", () => {
  chrome.tabs.create({ url: "https://focusshield.vercel.app/dashboard" });
});

btnSettingsTop.addEventListener("click", () => {
  chrome.tabs.create({ url: "https://focusshield.vercel.app/dashboard" });
});

closeBanner.addEventListener("click", () => {
  upgradeBanner.style.display = "none";
});

// Login Button
if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://focusshield.vercel.app/login" });
  });
}

// Block Sites Logic
async function initBlockSites() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      // Ignore chrome:// and extension pages
      if (url.protocol === "chrome:" || url.protocol === "chrome-extension:") {
        currentDomain = "Browser Page";
        domainDisplay.textContent = currentDomain;
        btnBlockSite.disabled = true;
        btnBlockSite.style.opacity = "0.5";
        btnBlockSite.textContent = "Cannot block this page";
        return;
      }

      let hostname = url.hostname.replace(/^www\./, "");
      currentDomain = hostname;
      domainDisplay.textContent = currentDomain;

      const iconWrapper = document.querySelector(".site-icon-wrapper");
      if (iconWrapper) {
        iconWrapper.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${hostname}&sz=64" style="width: 32px; height: 32px; border-radius: 8px;" onerror="this.src='icon.png'">`;
      }

      // Check if already blocked and enforce limits
      chrome.storage.local.get(["blockedSites", "authUser"], (result) => {
        const blocked = result.blockedSites || [];
        const user = result.authUser;
        const isPremium =
          user?.plan?.toLowerCase() === "unlimited" ||
          user?.plan?.toLowerCase() === "premium";
        const isBlocked = blocked.some((site) => currentDomain.includes(site));

        // Update Upgrade Banner
        const upgradeBanner = document.getElementById("upgrade-banner");
        if (upgradeBanner) {
          if (isPremium) {
            upgradeBanner.style.display = "none";
          } else {
            const remaining = Math.max(0, 3 - blocked.length);
            const title = upgradeBanner.querySelector(".upgrade-title");
            if (title) {
              title.textContent =
                remaining === 0
                  ? "You've reached your limit of 3 sites."
                  : `${remaining} site${remaining === 1 ? "" : "s"} left to add to your block list.`;
            }
            upgradeBanner.style.display = "block";
          }
        }

        if (isBlocked) {
          btnBlockSite.textContent = "Site is Blocked";
          btnBlockSite.style.backgroundColor = "var(--text-dim)";
          btnBlockSite.disabled = true;
          btnBlockSite.style.opacity = "0.7";
          btnBlockSite.onclick = null;
        } else {
          const limitReached = !isPremium && blocked.length >= 3;

          if (limitReached) {
            btnBlockSite.textContent = "Limit Reached (3/3)";
            btnBlockSite.style.backgroundColor = "var(--text-dim)";
            btnBlockSite.disabled = true;
            btnBlockSite.style.opacity = "0.5";
          } else {
            btnBlockSite.textContent = "Block this site";
            btnBlockSite.style.backgroundColor = "var(--primary)";
            btnBlockSite.disabled = false;
            btnBlockSite.style.opacity = "1";
            btnBlockSite.onclick = () => blockSite(currentDomain, blocked);
          }
        }
      });
    }
  } catch (err) {
    console.error("Error getting active tab:", err);
    domainDisplay.textContent = "Unable to get URL";
  }
}

function blockSite(domain, currentList) {
  if (!domain) return;

  // Safety check for limits
  chrome.storage.local.get(["authUser"], (result) => {
    const user = result.authUser;
    const isPremium =
      user?.plan?.toLowerCase() === "unlimited" ||
      user?.plan?.toLowerCase() === "premium";

    if (!isPremium && currentList.length >= 3) {
      alert("You've reached the limit of 3 blocked sites for the free plan.");
      return;
    }

    const updated = [...currentList, domain];
    chrome.storage.local.set({ blockedSites: updated }, () => {
      initBlockSites(); // Refresh UI
    });
  });
}

function unblockSite(domain, currentList) {
  if (!domain) return;
  const updated = currentList.filter((s) => !domain.includes(s));
  chrome.storage.local.set({ blockedSites: updated }, () => {
    initBlockSites(); // Refresh UI
  });
}

// Focus Mode Logic (Sync with background.js)
const TIMER_FULL_DASH = 251.2;

async function updateTimerDisplay() {
  const data = await chrome.storage.local.get(["focusSession"]);
  const session = data.focusSession || {
    active: false,
    paused: false,
    duration: 25 * 60,
    timeLeft: 25 * 60,
    type: "focus",
  };

  const timeLeft = session.timeLeft;
  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  timerDisplay.textContent = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // Update SVG circle
  const progress = timeLeft / session.duration;
  const dashoffset = TIMER_FULL_DASH - progress * TIMER_FULL_DASH;
  timerProgress.style.strokeDashoffset = dashoffset;

  // Update buttons
  if (session.active) {
    btnTimerResume.textContent = session.paused ? "Resume" : "Pause";
    btnTimerResume.style.backgroundColor = session.paused
      ? "var(--success)"
      : "var(--danger)";
    btnTimerReset.disabled = false;
    btnTimerReset.style.opacity = "1";
    focusStatusText.textContent = session.paused
      ? "Session Paused"
      : "Focusing...";
  } else {
    btnTimerResume.textContent = "Start Focus";
    btnTimerResume.style.backgroundColor = "var(--success)";
    btnTimerReset.disabled = true;
    btnTimerReset.style.opacity = "0.5";
    focusStatusText.textContent = "Ready to focus?";
  }
}

btnTimerResume.addEventListener("click", async () => {
  const data = await chrome.storage.local.get(["focusSession"]);
  const session = data.focusSession || { active: false, duration: 25 * 60 };

  if (!session.active) {
    chrome.runtime.sendMessage({
      action: "START_FOCUS",
      duration: session.duration,
    });
  } else {
    chrome.runtime.sendMessage({ action: "PAUSE_FOCUS" });
  }
});

btnTimerReset.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "RESET_FOCUS" });
});

// Insights Logic
function updateInsightsDisplay() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const insightKey = `insights_${dateStr}`;
  const statsKey = `stats_${dateStr}`;

  chrome.storage.local.get([insightKey, statsKey], (result) => {
    const data = result[insightKey] || {};
    const stats = result[statsKey] || {};

    const insightsEmptyState = document.getElementById("insights-empty-state");
    const insightsDataState = document.getElementById("insights-data-state");
    const insightsStats = document.getElementById("insights-stats");

    const statTimeSaved = document.getElementById("stat-time-saved");
    const statBlockedAttempts = document.getElementById(
      "stat-blocked-attempts",
    );

    // Update Stats
    const blockedCount = stats.blockedAttempts || 0;
    if (statTimeSaved) statTimeSaved.textContent = `${blockedCount * 2}m`;
    if (statBlockedAttempts) statBlockedAttempts.textContent = blockedCount;

    const domains = Object.keys(data);

    if (domains.length === 0 && blockedCount === 0) {
      insightsEmptyState.style.display = "block";
      insightsDataState.style.display = "none";
      if (insightsStats) insightsStats.style.display = "none";
    } else {
      insightsEmptyState.style.display = "none";
      insightsDataState.style.display = "flex";
      if (insightsStats) insightsStats.style.display = "grid";

      // Sort domains by time spent
      domains.sort((a, b) => data[b] - data[a]);

      // Generate HTML
      insightsDataState.innerHTML = domains
        .slice(0, 4)
        .map((domain) => {
          const seconds = data[domain];
          let timeStr = "";
          if (seconds < 60) timeStr = `${seconds}s`;
          else if (seconds < 3600) timeStr = `${Math.floor(seconds / 60)}m`;
          else
            timeStr = `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;

          return `
                    <div class="insight-item">
                        <div class="insight-domain">
                            <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" style="width: 16px; height: 16px; border-radius: 4px;" onerror="this.style.display='none'">
                            ${domain}
                        </div>
                        <div class="insight-time">${timeStr}</div>
                    </div>
                `;
        })
        .join("");
    }
  });
}

// Initialize Popup
document.addEventListener("DOMContentLoaded", () => {
  // Check Auth State First
  chrome.storage.local.get(["authUser", "popupActiveTab"], (result) => {
    if (result.authUser) {
      // User is logged in — show main app
      if (loginGate) loginGate.style.display = "none";
      if (mainContent) mainContent.style.display = "block";
      if (bottomNav) bottomNav.style.display = "flex";

      // Restore persisted active tab
      const savedTab = result.popupActiveTab;
      if (savedTab) {
        const targetNav = document.querySelector(`[data-target="${savedTab}"]`);
        const targetContent = document.getElementById(savedTab);
        if (targetNav && targetContent) {
          navItems.forEach((n) => n.classList.remove("active"));
          tabContents.forEach((t) => t.classList.remove("active"));
          targetNav.classList.add("active");
          targetContent.classList.add("active");
        }
      }

      // Update user avatar
      if (avatarImg) {
        const photo = result.authUser.photoBase64 || result.authUser.photoURL;
        if (photo) {
          avatarImg.src = photo;
        }
      }

      initBlockSites();
      updateTimerDisplay();
      updateInsightsDisplay();

      // Request fresh data from Firestore via background script
      // This ensures the popup always has the latest data
      chrome.runtime.sendMessage(
        { action: "REFRESH_FROM_CLOUD" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "Cloud refresh failed:",
              chrome.runtime.lastError.message,
            );
            return;
          }
          // Data will arrive via chrome.storage.onChanged, which triggers re-render
          console.log("Cloud refresh result:", response);
        },
      );

      const btnEditList = document.getElementById("btn-edit-list");
      if (btnEditList) {
        btnEditList.addEventListener("click", () => {
          chrome.tabs.create({
            url: "https://focusshield.vercel.app/dashboard",
          });
        });
      }

      // Handle Feature Visibility from Admin
      chrome.storage.local.get(
        ["ext_blockSites", "ext_focusMode", "ext_insights"],
        (flags) => {
          const navBlock = document.querySelector('[data-target="tab-block"]');
          const navFocus = document.querySelector('[data-target="tab-focus"]');
          const navInsights = document.querySelector(
            '[data-target="tab-insights"]',
          );

          if (flags.ext_blockSites === false) {
            if (navBlock) navBlock.style.display = "none";
            // If active tab is hidden, switch to next available
            if (navBlock?.classList.contains("active")) navFocus?.click();
          }
          if (flags.ext_focusMode === false) {
            if (navFocus) navFocus.style.display = "none";
            if (navFocus?.classList.contains("active")) navInsights?.click();
          }
          if (flags.ext_insights === false) {
            if (navInsights) navInsights.style.display = "none";
            if (navInsights?.classList.contains("active")) navBlock?.click();
          }
        },
      );

      // Check if there was a running timer state
      updateTimerDisplay();

      // Listen for storage changes to update UI in real-time
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.focusSession || changes.authUser) {
          updateTimerDisplay();
        }
        // Re-render block sites UI when blockedSites or authUser changes
        if (changes.blockedSites || changes.authUser) {
          initBlockSites();
        }
      });
    } else {
      // User not logged in — show gate
      if (mainContent) mainContent.style.display = "none";
      if (bottomNav) bottomNav.style.display = "none";
      if (loginGate) loginGate.style.display = "block";
    }
  });
});
