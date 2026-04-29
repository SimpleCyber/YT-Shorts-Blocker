// Constants
const DEFAULTS = {
    blockedSites: ["youtube.com/shorts", "instagram.com/reels"]
};

// State
let currentDomain = "";
let timerInterval;

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const domainDisplay = document.getElementById('current-domain-display');
const btnBlockSite = document.getElementById('btn-block-site');
const btnEditList = document.getElementById('btn-edit-list');
const btnSettingsTop = document.getElementById('open-settings-top');
const closeBanner = document.getElementById('close-banner');
const upgradeBanner = document.getElementById('upgrade-banner');

// Focus Mode Elements
const timerDisplay = document.getElementById('timer-display');
const timerProgress = document.querySelector('.timer-progress');
const btnTimerResume = document.getElementById('btn-timer-resume');
const btnTimerReset = document.getElementById('btn-timer-reset');

// Insights Elements
const insightsEmptyState = document.getElementById('insights-empty-state');
const insightsDataState = document.getElementById('insights-data-state');

// Navigation Logic
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to clicked
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// Settings & Edit Links
btnEditList.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

btnSettingsTop.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

closeBanner.addEventListener('click', () => {
    upgradeBanner.style.display = 'none';
});

// Block Sites Logic
async function initBlockSites() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            const url = new URL(tab.url);
            // Ignore chrome:// and extension pages
            if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') {
                currentDomain = "Browser Page";
                domainDisplay.textContent = currentDomain;
                btnBlockSite.disabled = true;
                btnBlockSite.style.opacity = '0.5';
                btnBlockSite.textContent = "Cannot block this page";
                return;
            }
            
            let hostname = url.hostname.replace(/^www\./, '');
            currentDomain = hostname;
            domainDisplay.textContent = currentDomain;

            const iconWrapper = document.querySelector('.site-icon-wrapper');
            if (iconWrapper) {
                iconWrapper.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${hostname}&sz=64" style="width: 32px; height: 32px; border-radius: 8px;" onerror="this.src='icon.png'">`;
            }

            // Check if already blocked
            chrome.storage.local.get(DEFAULTS, (result) => {
                const blocked = result.blockedSites || [];
                const isBlocked = blocked.some(site => currentDomain.includes(site));
                
                if (isBlocked) {
                    btnBlockSite.textContent = "Site is Blocked";
                    btnBlockSite.style.backgroundColor = "var(--danger)";
                    btnBlockSite.onclick = () => unblockSite(currentDomain, blocked);
                } else {
                    btnBlockSite.textContent = "Block this site";
                    btnBlockSite.style.backgroundColor = "var(--primary)";
                    btnBlockSite.onclick = () => blockSite(currentDomain, blocked);
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
    const updated = [...currentList, domain];
    chrome.storage.local.set({ blockedSites: updated }, () => {
        initBlockSites(); // Refresh UI
    });
}

function unblockSite(domain, currentList) {
    if (!domain) return;
    const updated = currentList.filter(s => !domain.includes(s));
    chrome.storage.local.set({ blockedSites: updated }, () => {
        initBlockSites(); // Refresh UI
    });
}

// Focus Mode Logic (Simple localized timer for mockup purposes)
// In a real app, this should sync with background.js to survive popup closing
let focusTimeLeft = 5 * 60; // 5 minutes in seconds
let isTimerRunning = false;
const TIMER_FULL_DASH = 251.2;

function updateTimerDisplay() {
    const hrs = Math.floor(focusTimeLeft / 3600);
    const mins = Math.floor((focusTimeLeft % 3600) / 60);
    const secs = focusTimeLeft % 60;
    
    timerDisplay.textContent = 
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
    // Update SVG circle
    const progress = focusTimeLeft / (5 * 60);
    const dashoffset = TIMER_FULL_DASH - (progress * TIMER_FULL_DASH);
    timerProgress.style.strokeDashoffset = dashoffset;
}

btnTimerResume.addEventListener('click', () => {
    isTimerRunning = !isTimerRunning;
    if (isTimerRunning) {
        btnTimerResume.textContent = "Pause";
        btnTimerResume.style.backgroundColor = "var(--danger)";
        timerInterval = setInterval(() => {
            if (focusTimeLeft > 0) {
                focusTimeLeft--;
                updateTimerDisplay();
                // Optionally save state to storage
                chrome.storage.local.set({ focusTimerState: focusTimeLeft });
            } else {
                clearInterval(timerInterval);
                isTimerRunning = false;
                btnTimerResume.textContent = "Resume";
                btnTimerResume.style.backgroundColor = "var(--primary)";
            }
        }, 1000);
    } else {
        btnTimerResume.textContent = "Resume";
        btnTimerResume.style.backgroundColor = "var(--primary)";
        clearInterval(timerInterval);
    }
});

btnTimerReset.addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    focusTimeLeft = 5 * 60;
    btnTimerResume.textContent = "Resume";
    btnTimerResume.style.backgroundColor = "var(--primary)";
    updateTimerDisplay();
});

// Insights Logic
function initInsights() {
    const today = new Date().toISOString().split('T')[0];
    const key = `insights_${today}`;
    
    chrome.storage.local.get([key], (result) => {
        const data = result[key] || {};
        const domains = Object.keys(data);
        
        if (domains.length === 0) {
            insightsEmptyState.style.display = 'block';
            insightsDataState.style.display = 'none';
        } else {
            insightsEmptyState.style.display = 'none';
            insightsDataState.style.display = 'flex';
            
            // Sort domains by time spent
            domains.sort((a, b) => data[b] - data[a]);
            
            // Generate HTML
            insightsDataState.innerHTML = domains.slice(0, 4).map(domain => {
                const seconds = data[domain];
                let timeStr = "";
                if (seconds < 60) timeStr = `${seconds}s`;
                else if (seconds < 3600) timeStr = `${Math.floor(seconds/60)}m`;
                else timeStr = `${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m`;
                
                return `
                    <div class="insight-item">
                        <div class="insight-domain">
                            <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" style="width: 16px; height: 16px; border-radius: 4px;" onerror="this.style.display='none'">
                            ${domain}
                        </div>
                        <div class="insight-time">${timeStr}</div>
                    </div>
                `;
            }).join('');
        }
    });
}

// Initialize Popup
document.addEventListener('DOMContentLoaded', () => {
    initBlockSites();
    updateTimerDisplay();
    initInsights();
    
    // Check if there was a running timer state
    chrome.storage.local.get(['focusTimerState'], (result) => {
        if (result.focusTimerState !== undefined) {
            // Note: In a fully functional app, we'd compare timestamps to account for time passed while popup was closed.
            // For simplicity here we just restore the visual state.
            focusTimeLeft = result.focusTimerState;
            updateTimerDisplay();
        }
    });
});
