// Constants & State
const DEFAULTS = {
    blockedSites: ["youtube.com/shorts", "instagram.com/reels"],
    focusDuration: 25 * 60, // 25 mins in seconds
    isBlockingEnabled: true
};

// DOM Elements - Navigation
const navItems = document.querySelectorAll('.nav-menu .nav-item[data-target]');
const viewSections = document.querySelectorAll('.view-section');

// DOM Elements - Block Sites
const addSiteInput = document.getElementById('add-site-input');
const btnAddSite = document.getElementById('btn-add-site');
const blockListContainer = document.getElementById('block-list-container');
const masterToggle = document.getElementById('master-toggle');

// Navigation Logic
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class
        navItems.forEach(nav => nav.classList.remove('active'));
        viewSections.forEach(view => view.classList.remove('active'));
        
        // Add active class
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        if (targetId) {
            document.getElementById(targetId).classList.add('active');
        }
    });
});

// Master Blocking Toggle
chrome.storage.local.get(DEFAULTS, (result) => {
    masterToggle.checked = result.isBlockingEnabled !== false; // Default true
});

masterToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ isBlockingEnabled: e.target.checked });
});

// Block Sites Logic
function renderBlockList() {
    chrome.storage.local.get(DEFAULTS, (result) => {
        const blockedSites = result.blockedSites || [];
        
        if (blockedSites.length === 0) {
            blockListContainer.innerHTML = `
                <div style="padding: 30px; text-align: center; color: var(--text-muted);">
                    Your block list is empty. Add sites above to start blocking!
                </div>
            `;
            return;
        }

        blockListContainer.innerHTML = blockedSites.map(site => `
            <div class="table-row">
                <div class="item-info">
                    <div class="item-icon">
                        <img src="https://www.google.com/s2/favicons?domain=${site}&sz=32" onerror="this.style.display='none'">
                    </div>
                    <div class="item-details">
                        <span class="item-domain">${site}</span>
                        <span class="item-type">Website</span>
                    </div>
                </div>
                <button class="delete-btn" data-site="${site}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Attach delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const siteToRemove = btn.getAttribute('data-site');
                const updatedList = blockedSites.filter(s => s !== siteToRemove);
                chrome.storage.local.set({ blockedSites: updatedList }, renderBlockList);
            });
        });
    });
}

// Add Site Handler
function addSite() {
    let site = addSiteInput.value.trim().toLowerCase();
    site = site.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, '');
    
    if (!site) return;

    chrome.storage.local.get(DEFAULTS, (result) => {
        const blockedSites = result.blockedSites || [];
        if (!blockedSites.includes(site)) {
            blockedSites.push(site);
            chrome.storage.local.set({ blockedSites }, () => {
                addSiteInput.value = '';
                renderBlockList();
            });
        } else {
            alert('Site is already in your block list!');
        }
    });
}

btnAddSite.addEventListener('click', addSite);
addSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSite();
});

// Focus Mode Logic (Visual Mockup for Options)
const optTimerDisplay = document.getElementById('options-timer-display');
const optTimerProgress = document.querySelector('.focus-timer-progress');
const optBtnResume = document.getElementById('opt-btn-resume');
const optBtnReset = document.getElementById('opt-btn-reset');

let optFocusTimeLeft = DEFAULTS.focusDuration;
let optTimerInterval;
let optIsRunning = false;
const OPT_TIMER_FULL_DASH = 251.2;

function updateOptTimerDisplay() {
    const mins = Math.floor(optFocusTimeLeft / 60);
    const secs = optFocusTimeLeft % 60;
    optTimerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const progress = optFocusTimeLeft / DEFAULTS.focusDuration;
    const dashoffset = OPT_TIMER_FULL_DASH - (progress * OPT_TIMER_FULL_DASH);
    optTimerProgress.style.strokeDashoffset = dashoffset;
}

optBtnResume.addEventListener('click', () => {
    optIsRunning = !optIsRunning;
    if (optIsRunning) {
        optBtnResume.textContent = "Pause";
        optBtnResume.className = "btn btn-outline"; // Make it look paused
        optBtnResume.style.background = "#fff";
        optTimerInterval = setInterval(() => {
            if (optFocusTimeLeft > 0) {
                optFocusTimeLeft--;
                updateOptTimerDisplay();
            } else {
                clearInterval(optTimerInterval);
                optIsRunning = false;
                optBtnResume.textContent = "Start";
                optBtnResume.className = "btn btn-success";
            }
        }, 1000);
    } else {
        optBtnResume.textContent = "Start";
        optBtnResume.className = "btn btn-success";
        clearInterval(optTimerInterval);
    }
});

optBtnReset.addEventListener('click', () => {
    clearInterval(optTimerInterval);
    optIsRunning = false;
    optFocusTimeLeft = DEFAULTS.focusDuration;
    optBtnResume.textContent = "Start";
    optBtnResume.className = "btn btn-success";
    updateOptTimerDisplay();
});


// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderBlockList();
    updateOptTimerDisplay();
});
