// Constants & State
const DEFAULTS = {
    blockedSites: ["youtube.com/shorts", "instagram.com/reels"],
    blockedCategories: [],
    blockedKeywords: [],
    focusDuration: 25 * 60, // 25 mins in seconds
    isBlockingEnabled: true,
    isWhitelistMode: false,
    usageLimits: [] // Array of {domain: string, limitMinutes: number}
};

const ADULT_KEYWORDS = ['porn', 'nsfw', 'xvideos', 'xnxx', 'sex', 'xxx', 'adult', 'onlyfans', 'poker', 'casino', 'gambling'];
const FREE_LIMIT = 3;

let isAdminUnlocked = false;

// DOM Elements
const navItems = document.querySelectorAll('.nav-menu .nav-item[data-target]');
const viewSections = document.querySelectorAll('.view-section');

// Block Sites Elements
const btnOpenBlockModal = document.getElementById('btn-open-block-modal');
const blockListContainer = document.getElementById('block-list-container');
const whitelistToggle = document.getElementById('whitelist-toggle');
const masterToggle = document.getElementById('master-toggle');

// Usage Limits Elements
const btnOpenUsageModal = document.getElementById('btn-open-usage-modal');
const usageListContainer = document.getElementById('usage-list-container');

// Modal State
let modalMode = 'block'; // 'block' or 'usage'

// Admin Elements
const adminBtn = document.getElementById('admin-unlock-btn');
const premiumElements = document.querySelectorAll('.premium-element');
const lockedFeatures = document.querySelectorAll('.locked-feature');
const lockedBadges = document.querySelectorAll('.badge-locked');

// --- ADMIN LOGIC ---
adminBtn.addEventListener('click', () => {
    isAdminUnlocked = !isAdminUnlocked;
    
    if (isAdminUnlocked) {
        adminBtn.textContent = "Admin (Unlocked)";
        adminBtn.style.backgroundColor = "var(--danger)";
        adminBtn.style.color = "white";
        
        // Hide premium upgrade banners
        premiumElements.forEach(el => el.style.display = 'none');
        
        // Unlock locked features in sidebar
        lockedFeatures.forEach(el => {
            el.style.opacity = '1';
            el.style.cursor = 'pointer';
        });
        lockedBadges.forEach(el => el.style.display = 'none');
    } else {
        adminBtn.textContent = "Admin";
        adminBtn.style.backgroundColor = "transparent";
        adminBtn.style.color = "var(--danger)";
        
        premiumElements.forEach(el => el.style.display = '');
        
        lockedFeatures.forEach(el => {
            el.style.opacity = '0.7';
            el.style.cursor = 'not-allowed';
            // Force navigate away if on a locked section
            if (el.classList.contains('active')) {
                document.querySelector('.nav-item[data-target="view-block-sites"]').click();
            }
        });
        lockedBadges.forEach(el => el.style.display = '');
    }
});

// --- NAVIGATION LOGIC ---
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Prevent clicking if locked and admin not unlocked
        if (item.classList.contains('locked-feature') && !isAdminUnlocked) {
            return;
        }

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

// --- GENERAL TOGGLES ---
chrome.storage.local.get(DEFAULTS, (result) => {
    masterToggle.checked = result.isBlockingEnabled !== false;
    whitelistToggle.checked = result.isWhitelistMode === true;
});

masterToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ isBlockingEnabled: e.target.checked });
});

whitelistToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ isWhitelistMode: e.target.checked });
});

// --- BLOCK SITES LOGIC ---
function renderBlockList() {
    chrome.storage.local.get(DEFAULTS, (result) => {
        const blockedSites = result.blockedSites || [];
        const blockedCategories = result.blockedCategories || [];
        const blockedKeywords = result.blockedKeywords || [];
        
        const totalItems = blockedSites.length + blockedCategories.length + (blockedKeywords.length > 0 ? 1 : 0);

        // Update banner
        const bannerText = document.querySelector('.banner-upgrade .banner-text');
        if (bannerText) {
            if (isAdminUnlocked) {
                bannerText.innerHTML = `<strong>Unlimited sites</strong> in your block list. <span style="color: var(--text-muted);">Admin mode active.</span>`;
            } else {
                const left = FREE_LIMIT - totalItems;
                bannerText.innerHTML = `<strong>${left > 0 ? left : 0} place${left === 1 ? '' : 's'} left</strong> to add to your block list. <span style="color: var(--text-muted);">Click here to upgrade and enjoy an unlimited block list.</span>`;
            }
        }

        if (totalItems === 0) {
            blockListContainer.innerHTML = `
                <div style="padding: 30px; text-align: center; color: var(--text-muted);">
                    Your list is empty. Add sites above!
                </div>
            `;
            return;
        }

        let html = '';

        // Sites
        blockedSites.forEach(site => {
            html += `
            <div class="table-row">
                <div class="item-info">
                    <div class="item-icon"><img src="https://www.google.com/s2/favicons?domain=${site}&sz=32" onerror="this.style.display='none'"></div>
                    <div class="item-details"><span class="item-domain">${site}</span><span class="item-type">Website</span></div>
                </div>
                <button class="delete-btn block-site-del" data-site="${site}"><i class="fas fa-trash"></i></button>
            </div>`;
        });

        // Categories
        blockedCategories.forEach(catId => {
            const cat = MODAL_CATEGORIES.find(c => c.id === catId);
            html += `
            <div class="table-row">
                <div class="item-info">
                    <div class="item-icon"><i class="fas ${cat ? cat.icon : 'fa-folder'}" style="color: ${cat ? cat.color : 'var(--primary)'}"></i></div>
                    <div class="item-details"><span class="item-domain">${cat ? cat.name : catId} Category</span><span class="item-type">Category</span></div>
                </div>
                <button class="delete-btn block-cat-del" data-cat="${catId}"><i class="fas fa-trash"></i></button>
            </div>`;
        });

        // Keywords
        if (blockedKeywords.length > 0) {
            const isAdult = ADULT_KEYWORDS.every(kw => blockedKeywords.includes(kw));
            html += `
            <div class="table-row">
                <div class="item-info">
                    <div class="item-icon"><i class="fas fa-key" style="color: #f59e0b"></i></div>
                    <div class="item-details"><span class="item-domain">${isAdult ? 'Adult (Keywords)' : 'Custom Keywords'}</span><span class="item-type">Keyword List</span></div>
                </div>
                <button class="delete-btn block-kw-del"><i class="fas fa-trash"></i></button>
            </div>`;
        }

        blockListContainer.innerHTML = html;

        document.querySelectorAll('.block-site-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const siteToRemove = btn.getAttribute('data-site');
                const updatedList = blockedSites.filter(s => s !== siteToRemove);
                chrome.storage.local.set({ blockedSites: updatedList }, renderBlockList);
            });
        });
        document.querySelectorAll('.block-cat-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const catToRemove = btn.getAttribute('data-cat');
                const updatedList = blockedCategories.filter(c => c !== catToRemove);
                chrome.storage.local.set({ blockedCategories: updatedList }, renderBlockList);
            });
        });
        document.querySelectorAll('.block-kw-del').forEach(btn => {
            btn.addEventListener('click', () => {
                chrome.storage.local.set({ blockedKeywords: [] }, renderBlockList);
            });
        });
    });
}

// --- MODAL LOGIC ---
const addBlockModal = document.getElementById('add-block-modal');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const btnModalDone = document.getElementById('btn-modal-done');
const modalSearchInput = document.getElementById('modal-search-input');
const modalSuggestionsList = document.getElementById('modal-suggestions-list');
const modalCategoriesList = document.getElementById('modal-categories-list');
const btnModalSeeMore = document.getElementById('btn-modal-see-more');

const MODAL_CATEGORIES = [
    { name: 'Adult', id: 'adult', icon: 'fa-ban', color: '#ef4444', sites: ['pornhub.com', 'xvideos.com', 'xnxx.com'] },
    { name: 'Social', id: 'social', icon: 'fa-comments', color: '#8b5cf6', sites: ['facebook.com', 'instagram.com', 'x.com', 'tiktok.com', 'snapchat.com'] },
    { name: 'News', id: 'news', icon: 'fa-newspaper', color: '#64748b', sites: ['cnn.com', 'foxnews.com', 'nytimes.com', 'bbc.com', 'buzzfeed.com'] },
    { name: 'Sports', id: 'sports', icon: 'fa-basketball-ball', color: '#f97316', sites: ['espn.com', 'nba.com', 'nfl.com', 'skysports.com'] },
    { name: 'Shopping', id: 'shopping', icon: 'fa-shopping-cart', color: '#3b82f6', sites: ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'aliexpress.com'] }
];

const SUGGESTED_SITES = [
    { name: 'youtube.com', icon: 'youtube.com' },
    { name: 'netflix.com', icon: 'netflix.com' },
    { name: 'facebook.com', icon: 'facebook.com' },
    { name: 'instagram.com', icon: 'instagram.com' },
    { name: 'x.com', icon: 'x.com' },
    { name: 'reddit.com', icon: 'reddit.com' },
    { name: 'tiktok.com', icon: 'tiktok.com' },
    { name: 'amazon.com', icon: 'amazon.com' },
    { name: 'buzzfeed.com', icon: 'buzzfeed.com' },
    { name: 'pinterest.com', icon: 'pinterest.com' },
    { name: 'twitch.tv', icon: 'twitch.tv' },
    { name: 'discord.com', icon: 'discord.com' },
    { name: 'hulu.com', icon: 'hulu.com' },
    { name: 'hbomax.com', icon: 'hbomax.com' }
];

let selectedModalSites = new Set();
let selectedModalCategories = new Set();
let showAllWebsites = false;

function openModal() {
    selectedModalSites.clear();
    selectedModalCategories.clear();
    modalSearchInput.value = '';
    showAllWebsites = false;
    if(btnModalSeeMore) btnModalSeeMore.textContent = "See more";
    renderModalSuggestions();
    updateModalDoneState();
    addBlockModal.classList.add('active');
}

function closeModal() {
    addBlockModal.classList.remove('active');
}

function updateModalDoneState() {
    const totalSelected = selectedModalSites.size + selectedModalCategories.size;
    const footerText = document.querySelector('.modal-footer-text');
    
    if (totalSelected > 0) {
        btnModalDone.classList.add('active');
        chrome.storage.local.get(DEFAULTS, (result) => {
            const currentTotal = (result.blockedSites?.length || 0) + (result.blockedCategories?.length || 0);
            if (isAdminUnlocked) {
                footerText.textContent = `${totalSelected} items selected`;
            } else {
                const remaining = FREE_LIMIT - currentTotal - totalSelected;
                footerText.textContent = remaining > 0 ? `${remaining} places left` : `No places left`;
                if (remaining < 0) {
                    btnModalDone.classList.remove('active');
                    footerText.style.color = 'var(--danger)';
                } else {
                    footerText.style.color = 'var(--text-muted)';
                }
            }
        });
    } else {
        btnModalDone.classList.remove('active');
        footerText.textContent = "Select Items to Start";
        footerText.style.color = 'var(--text-muted)';
    }
}

function renderModalSuggestions() {
    const filterText = modalSearchInput.value.trim().toLowerCase();
    
    // Render Categories
    if (modalCategoriesList) {
        const filteredCategories = MODAL_CATEGORIES.filter(cat => cat.name.toLowerCase().includes(filterText) || cat.sites.some(s => s.includes(filterText)));
        
        modalCategoriesList.innerHTML = filteredCategories.map(cat => {
            const isSelected = selectedModalCategories.has(cat.id);
            return `
            <div class="suggestion-card" style="cursor: pointer;" data-cat="${cat.id}">
                <div class="suggestion-info">
                    <div class="suggestion-icon"><i class="fas ${cat.icon}" style="color: ${cat.color};"></i></div>
                    <span class="suggestion-name">${cat.name}</span>
                </div>
                <button class="btn-add-item ${isSelected ? 'selected' : ''}" style="pointer-events: none;">
                    <i class="fas ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
                </button>
            </div>
            `;
        }).join('');

        modalCategoriesList.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', () => {
                const catId = card.getAttribute('data-cat');
                if (selectedModalCategories.has(catId)) {
                    selectedModalCategories.delete(catId);
                } else {
                    selectedModalCategories.add(catId);
                }
                renderModalSuggestions();
                updateModalDoneState();
            });
        });
    }
    
    // Render Websites
    let displaySites = SUGGESTED_SITES.filter(site => site.name.includes(filterText));
    if (!showAllWebsites && filterText === '') {
        displaySites = displaySites.slice(0, 4); // show only 4 by default
    }
    
    modalSuggestionsList.innerHTML = displaySites.map(site => {
        const isSelected = selectedModalSites.has(site.name);
        return `
        <div class="suggestion-card">
            <div class="suggestion-info">
                <div class="suggestion-icon">
                    <img src="https://www.google.com/s2/favicons?domain=${site.icon}&sz=32" onerror="this.style.display='none'">
                </div>
                <span class="suggestion-name">${site.name}</span>
            </div>
            <button class="btn-add-item ${isSelected ? 'selected' : ''}" data-site="${site.name}">
                <i class="fas ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
            </button>
        </div>
        `;
    }).join('');

    modalSuggestionsList.querySelectorAll('.btn-add-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const site = btn.getAttribute('data-site');
            if (selectedModalSites.has(site)) {
                selectedModalSites.delete(site);
            } else {
                selectedModalSites.add(site);
            }
            renderModalSuggestions();
            updateModalDoneState();
        });
    });
}

if (btnModalSeeMore) {
    btnModalSeeMore.addEventListener('click', () => {
        showAllWebsites = !showAllWebsites;
        btnModalSeeMore.textContent = showAllWebsites ? "See less" : "See more";
        renderModalSuggestions();
    });
}

btnOpenBlockModal.addEventListener('click', () => { modalMode = 'block'; openModal(); });
btnOpenUsageModal.addEventListener('click', () => { modalMode = 'usage'; openModal(); });
btnModalCancel.addEventListener('click', closeModal);

// Allow closing by clicking outside
addBlockModal.addEventListener('click', (e) => {
    if (e.target === addBlockModal) closeModal();
});

// Search filter
modalSearchInput.addEventListener('input', renderModalSuggestions);

// Enter to add custom
modalSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        let site = modalSearchInput.value.trim().toLowerCase();
        site = site.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, '');
        if (site) {
            selectedModalSites.add(site);
            modalSearchInput.value = '';
            renderModalSuggestions();
            updateModalDoneState();
        }
    }
});

btnModalDone.addEventListener('click', () => {
    if (selectedModalSites.size === 0 && selectedModalCategories.size === 0) return;
    
    chrome.storage.local.get(DEFAULTS, (result) => {
        let blockedSites = result.blockedSites || [];
        let blockedCategories = result.blockedCategories || [];
        let blockedKeywords = result.blockedKeywords || [];
        let usageLimits = result.usageLimits || [];
        let updated = false;

        if (modalMode === 'block') {
            // Add sites
            selectedModalSites.forEach(site => {
                if (!blockedSites.includes(site)) {
                    blockedSites.push(site);
                    updated = true;
                }
            });
            // Add categories
            selectedModalCategories.forEach(catId => {
                if (catId === 'adult') {
                    // Adult is special: add keywords
                    ADULT_KEYWORDS.forEach(kw => {
                        if (!blockedKeywords.includes(kw)) {
                            blockedKeywords.push(kw);
                            updated = true;
                        }
                    });
                } else {
                    if (!blockedCategories.includes(catId)) {
                        blockedCategories.push(catId);
                        updated = true;
                    }
                }
            });
            
            if (updated) {
                chrome.storage.local.set({ blockedSites, blockedCategories, blockedKeywords }, () => {
                    renderBlockList();
                    closeModal();
                });
            } else {
                closeModal();
            }
        } else if (modalMode === 'usage') {
            // For usage limits, we only add sites
            let sitesToAdd = new Set(selectedModalSites);
            selectedModalCategories.forEach(catId => {
                const cat = MODAL_CATEGORIES.find(c => c.id === catId);
                if (cat) cat.sites.forEach(s => sitesToAdd.add(s));
            });

            sitesToAdd.forEach(site => {
                const exists = usageLimits.find(u => u.domain === site);
                if (!exists) {
                    usageLimits.push({ domain: site, limitMinutes: 30 });
                    updated = true;
                }
            });
            if (updated) {
                chrome.storage.local.set({ usageLimits }, () => {
                    renderUsageList();
                    closeModal();
                });
            } else {
                closeModal();
            }
        }
    });
});

// --- USAGE LIMITS LOGIC ---
function renderUsageList() {
    chrome.storage.local.get(DEFAULTS, (result) => {
        const usageLimits = result.usageLimits || [];
        
        if (usageLimits.length === 0) {
            usageListContainer.innerHTML = `
                <div style="padding: 30px; text-align: center; color: var(--text-muted);">
                    No usage limits set. Add a site above!
                </div>
            `;
            return;
        }

        usageListContainer.innerHTML = usageLimits.map((item, index) => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const insightKey = `insights_${year}-${month}-${day}`;
            
            // Generate dropdown options
            let optionsHtml = `<option value="0" ${item.limitMinutes === 0 ? 'selected' : ''}>No Limit</option>`;
            const minuteSteps = [5, 10, 20, 25, 30, 35, 40, 45, 50, 55, 60];
            minuteSteps.forEach(m => {
                optionsHtml += `<option value="${m}" ${item.limitMinutes === m ? 'selected' : ''}>${m} minutes</option>`;
            });
            // Half hour increments from 1.5 to 24 hours
            for (let h = 1.5; h <= 24; h += 0.5) {
                const mins = h * 60;
                optionsHtml += `<option value="${mins}" ${item.limitMinutes === mins ? 'selected' : ''}>${h} hours</option>`;
            }

            return `
            <div class="table-row">
                <div class="item-info" style="width: 40%;">
                    <div class="item-icon">
                        <img src="https://www.google.com/s2/favicons?domain=${item.domain}&sz=32" onerror="this.style.display='none'">
                    </div>
                    <div class="item-details">
                        <span class="item-domain">${item.domain}</span>
                        <span class="item-type">Website</span>
                    </div>
                </div>
                <div style="width: 20%; text-align: center; color: var(--text-main);" id="usage-tracked-${index}">Calculating...</div>
                <div style="width: 20%; text-align: center;">
                    <select class="usage-limit-select" data-index="${index}" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); outline: none; background: white; width: 120px;">
                        ${optionsHtml}
                    </select>
                </div>
                <div style="width: 20%; text-align: right;">
                    <button class="delete-btn usage-limit-del" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            `;
        }).join('');

        // Update real usage time
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const insightKey = `insights_${year}-${month}-${day}`;
        
        chrome.storage.local.get([insightKey], (res) => {
            const dayData = res[insightKey] || {};
            usageLimits.forEach((item, index) => {
                const secs = dayData[item.domain] || 0;
                const mins = Math.floor(secs / 60);
                const el = document.getElementById(`usage-tracked-${index}`);
                if (el) el.textContent = `${mins} minute${mins === 1 ? '' : 's'} used`;
            });
        });

        document.querySelectorAll('.usage-limit-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                usageLimits[idx].limitMinutes = parseInt(e.target.value);
                chrome.storage.local.set({ usageLimits });
            });
        });

        document.querySelectorAll('.usage-limit-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                usageLimits.splice(idx, 1);
                chrome.storage.local.set({ usageLimits }, renderUsageList);
            });
        });
    });
}
// --- INSIGHTS LOGIC ---
function renderInsights() {
    const keys = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        keys.push(`insights_${year}-${month}-${day}`);
    }

    chrome.storage.local.get(keys, (result) => {
        let totalTimeSecs = 0;
        let daysWithData = 0;
        let topDayVal = 0;
        let topDayDate = 'No Data';
        
        let domainTotals = {};

        keys.forEach(key => {
            if (result[key]) {
                daysWithData++;
                let dayTotal = 0;
                for (const [domain, time] of Object.entries(result[key])) {
                    dayTotal += time;
                    domainTotals[domain] = (domainTotals[domain] || 0) + time;
                }
                totalTimeSecs += dayTotal;
                
                if (dayTotal > topDayVal) {
                    topDayVal = dayTotal;
                    // Format date nicely
                    const datePart = key.replace('insights_', '');
                    const dObj = new Date(datePart);
                    topDayDate = dObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                }
            }
        });

        const avgTimeSecs = daysWithData > 0 ? totalTimeSecs / daysWithData : 0;
        
        function formatTime(secs) {
            if (secs === 0) return '0m';
            const h = Math.floor(secs / 3600);
            const m = Math.floor((secs % 3600) / 60);
            if (h > 0) return `${h}h ${m}m`;
            return `${m}m`;
        }

        document.getElementById('insight-avg-time').textContent = daysWithData > 0 ? formatTime(avgTimeSecs) : 'No Data';
        document.getElementById('insight-top-day').textContent = topDayDate;
        
        // Sort domains for Top Distractions
        const sortedDomains = Object.entries(domainTotals).sort((a, b) => b[1] - a[1]);
        
        const distContainer = document.getElementById('insight-distractions-container');
        if (sortedDomains.length > 0) {
            let html = `
                <div class="chart-header" style="align-self: flex-start; margin-bottom: 24px; width: 100%;">
                    <span class="chart-title"><i class="fas fa-chart-pie"></i> Top Distractions</span>
                    <span class="chart-date">Last 7 Days</span>
                </div>
                <div style="width: 100%; display: flex; flex-direction: column; gap: 16px;">
            `;
            
            // Show top 4
            sortedDomains.slice(0, 4).forEach(([domain, time]) => {
                const perc = Math.round((time / totalTimeSecs) * 100);
                html += `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" style="width: 24px; height: 24px; border-radius: 4px;" onerror="this.style.display='none'">
                            <span style="font-weight: 600; color: var(--text-main);">${domain}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <span style="font-weight: 600;">${formatTime(time)}</span>
                            <div style="width: 100px; height: 6px; background: var(--bg-hover); border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${perc}%; background: var(--primary); border-radius: 3px;"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            distContainer.innerHTML = html;
            distContainer.style.alignItems = 'flex-start';
            distContainer.style.justifyContent = 'flex-start';
        }
    });
}



// --- FOCUS MODE LOGIC (Visual) ---
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

    // Update active blocks count
    chrome.storage.local.get(DEFAULTS, (res) => {
        const total = (res.blockedSites?.length || 0) + (res.blockedCategories?.length || 0) + (res.blockedKeywords?.length > 0 ? 1 : 0);
        const blockText = document.querySelector('#view-focus-mode p');
        if (blockText) {
            blockText.textContent = `${total} items in block list active`;
        }
    });
}

optBtnResume.addEventListener('click', () => {
    optIsRunning = !optIsRunning;
    if (optIsRunning) {
        optBtnResume.textContent = "Pause";
        optBtnResume.className = "btn btn-outline"; 
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


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderBlockList();
    renderUsageList();
    renderInsights();
    updateOptTimerDisplay();
});
