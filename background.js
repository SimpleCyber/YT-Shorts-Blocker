chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: "options.html"
    });
  }
});

// Time Tracking Logic for Insights
let activeDomain = null;
let lastSwitchTime = Date.now();
let isIdle = false;

// Initialize tracking
chrome.idle.setDetectionInterval(60); // 60 seconds of inactivity triggers idle

function getTodayKey() {
    const today = new Date().toISOString().split('T')[0];
    return `insights_${today}`;
}

function extractDomain(urlStr) {
    try {
        const url = new URL(urlStr);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        return url.hostname.replace(/^www\./, '');
    } catch (e) {
        return null;
    }
}

async function recordTime() {
    if (!activeDomain || isIdle) return;
    
    const now = Date.now();
    const timeSpentSecs = Math.floor((now - lastSwitchTime) / 1000);
    
    if (timeSpentSecs > 0) {
        const key = getTodayKey();
        const data = await chrome.storage.local.get([key]);
        const dayData = data[key] || {};
        
        dayData[activeDomain] = (dayData[activeDomain] || 0) + timeSpentSecs;
        
        await chrome.storage.local.set({ [key]: dayData });
    }
    
    lastSwitchTime = now;
}

async function handleTabSwitch() {
    await recordTime();
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tab && tab.url) {
            activeDomain = extractDomain(tab.url);
        } else {
            activeDomain = null;
        }
    } catch (e) {
        activeDomain = null;
    }
    
    lastSwitchTime = Date.now();
}

// Listeners for active tab changes
chrome.tabs.onActivated.addListener(handleTabSwitch);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.url) {
        handleTabSwitch();
    }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Lost focus completely
        recordTime().then(() => {
            activeDomain = null;
        });
    } else {
        handleTabSwitch();
    }
});

chrome.idle.onStateChanged.addListener((newState) => {
    if (newState === 'active') {
        isIdle = false;
        lastSwitchTime = Date.now(); // Reset time so we don't count the idle period
        handleTabSwitch();
    } else {
        recordTime();
        isIdle = true;
    }
});

// Periodic save every 10 seconds just in case Chrome closes abruptly
chrome.alarms.create("saveTimeAlarm", { periodInMinutes: 0.2 }); // ~12 seconds
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "saveTimeAlarm") {
        recordTime();
    }
});
