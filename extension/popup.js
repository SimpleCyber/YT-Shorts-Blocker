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

// Auth Gate Elements
const loginGate = document.getElementById('login-gate');
const mainContent = document.querySelector('.main-content');
const bottomNav = document.querySelector('.bottom-nav');
const btnLogin = document.getElementById('btn-login');
const avatarImg = document.getElementById('avatar-img');

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
    chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
});

btnSettingsTop.addEventListener('click', () => {
    chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
});

closeBanner.addEventListener('click', () => {
    upgradeBanner.style.display = 'none';
});

// Login Button
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        chrome.tabs.create({ url: "http://localhost:3000/login" });
    });
}

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
    // Check Auth State First
    chrome.storage.local.get(['authUser'], (result) => {
        if (result.authUser) {
            // User is logged in — show main app
            if (loginGate) loginGate.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            if (bottomNav) bottomNav.style.display = 'flex';

            // Update user avatar
            if (avatarImg) {
                const photo = result.authUser.photoBase64 || result.authUser.photoURL;
                if (photo) {
                    avatarImg.src = photo;
                }
            }

            // Init App
            initBlockSites();
            updateTimerDisplay();
            initInsights();

            // Handle Feature Visibility from Admin
            chrome.storage.local.get(['ext_blockSites', 'ext_focusMode', 'ext_insights'], (flags) => {
                const navBlock = document.querySelector('[data-target="tab-block"]');
                const navFocus = document.querySelector('[data-target="tab-focus"]');
                const navInsights = document.querySelector('[data-target="tab-insights"]');

                if (flags.ext_blockSites === false) {
                    if (navBlock) navBlock.style.display = 'none';
                    // If active tab is hidden, switch to next available
                    if (navBlock?.classList.contains('active')) navFocus?.click();
                }
                if (flags.ext_focusMode === false) {
                    if (navFocus) navFocus.style.display = 'none';
                    if (navFocus?.classList.contains('active')) navInsights?.click();
                }
                if (flags.ext_insights === false) {
                    if (navInsights) navInsights.style.display = 'none';
                    if (navInsights?.classList.contains('active')) navBlock?.click();
                }
            });
            
            // Check if there was a running timer state
            chrome.storage.local.get(['focusTimerState'], (timerResult) => {
                if (timerResult.focusTimerState !== undefined) {
                    focusTimeLeft = timerResult.focusTimerState;
                    updateTimerDisplay();
                }
            });
        } else {
            // User not logged in — show gate
            if (mainContent) mainContent.style.display = 'none';
            if (bottomNav) bottomNav.style.display = 'none';
            if (loginGate) loginGate.style.display = 'block';
        }
    });
});
