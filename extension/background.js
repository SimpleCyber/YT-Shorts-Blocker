chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: "http://localhost:3000/dashboard"
    });
  }
});

// Proxy for website dashboard
// Message handler for both internal (content script bridge) and external
const handleMessage = function(request, sender, sendResponse) {
    if (request.action === "getData") {
        chrome.storage.local.get(request.keys || null, (result) => {
            sendResponse(result);
        });
        return true;
    } else if (request.action === "setData") {
        chrome.storage.local.set(request.data, () => {
            sendResponse({ success: true });
        });
        return true;
    } else if (request.action === "syncAuth") {
        // Website user logged in — store auth info
        chrome.storage.local.set({ authUser: request.user }, () => {
            sendResponse({ success: true });
        });
        return true;
    } else if (request.action === "signOut") {
        // Website user signed out — clear auth info
        chrome.storage.local.remove("authUser", () => {
            sendResponse({ success: true });
        });
        return true;
    } else if (request.action === "REFRESH_FROM_CLOUD") {
        refreshFromCloud().then((result) => {
            sendResponse(result);
        }).catch(() => {
            sendResponse({ success: false });
        });
        return true;
    } else if (request.action === "START_FOCUS") {
        startFocusMode(request.duration);
        sendResponse({ success: true });
        return true;
    } else if (request.action === "PAUSE_FOCUS") {
        pauseFocusMode();
        sendResponse({ success: true });
        return true;
    } else if (request.action === "RESET_FOCUS") {
        resetFocusMode();
        sendResponse({ success: true });
        return true;
    } else if (request.action === "CHECK_INCOGNITO") {
        chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
            sendResponse({ isAllowed });
        });
        return true;
    } else if (request.action === "OPEN_EXT_SETTINGS") {
        chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
        sendResponse({ success: true });
        return true;
    }
};

chrome.runtime.onMessageExternal.addListener(handleMessage);
chrome.runtime.onMessage.addListener(handleMessage);

// Time Tracking Logic for Insights
// These in-memory variables are backed by chrome.storage.local to survive MV3 service worker restarts
let activeDomain = null;
let lastSwitchTime = Date.now();
let isIdle = false;

// Increased from 60s to 300s (5 minutes) so that watching videos, reading articles,
// or any passive browsing is properly tracked as active time
chrome.idle.setDetectionInterval(300);

// Restore tracking state from storage on service worker startup
chrome.storage.local.get(['_trackingState'], (result) => {
    const state = result._trackingState;
    if (state) {
        activeDomain = state.activeDomain || null;
        lastSwitchTime = state.lastSwitchTime || Date.now();
        isIdle = state.isIdle || false;
    }
    // Always re-query the active tab on startup to ensure we're tracking
    handleTabSwitch();
});

function saveTrackingState() {
    chrome.storage.local.set({
        _trackingState: { activeDomain, lastSwitchTime, isIdle }
    });
}

function getTodayKey() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `insights_${year}-${month}-${day}`;
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

// Max seconds to record in a single interval.
// Prevents inflated values when the service worker was asleep for a long time.
const MAX_RECORD_INTERVAL_SECS = 60;

async function recordTime() {
    if (!activeDomain || isIdle) return;
    
    const now = Date.now();
    let timeSpentSecs = Math.floor((now - lastSwitchTime) / 1000);
    
    // Cap at MAX_RECORD_INTERVAL_SECS to avoid counting service worker sleep time
    timeSpentSecs = Math.min(timeSpentSecs, MAX_RECORD_INTERVAL_SECS);
    
    if (timeSpentSecs > 0) {
        const key = getTodayKey();
        const data = await chrome.storage.local.get([key]);
        const dayData = data[key] || {};
        
        dayData[activeDomain] = (dayData[activeDomain] || 0) + timeSpentSecs;
        
        await chrome.storage.local.set({ [key]: dayData });
    }
    
    lastSwitchTime = now;
    saveTrackingState();
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
    saveTrackingState();
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
            saveTrackingState();
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
        saveTrackingState();
    }
});

// Periodic save every 10 seconds
chrome.alarms.create("saveTimeAlarm", { periodInMinutes: 0.2 });
// Periodic cloud sync every 30 seconds to keep extension data fresh
chrome.alarms.create("cloudSyncAlarm", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "saveTimeAlarm") {
        // Re-query the active tab on every tick to recover from service worker restarts
        // where activeDomain might have been lost despite storage persistence
        if (!activeDomain && !isIdle) {
            handleTabSwitch();
        } else {
            recordTime();
        }
    }
    if (alarm.name === "cloudSyncAlarm") refreshFromCloud();
});

// Broadcast changes to Website Dashboard
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    // Relevant keys for the dashboard
    const syncKeys = ['blockedSites', 'blockedCategories', 'blockedKeywords', 'usageLimits', 'isBlockingEnabled', 'isWhitelistMode', 'focusWhitelist', 'focusSession', 'settings', 'ext_blockSites', 'ext_focusMode', 'ext_insights'];
    const hasSyncChange = Object.keys(changes).some(key => syncKeys.includes(key));

    if (hasSyncChange) {
        chrome.storage.local.get([...syncKeys, 'authUser'], (data) => {
            const uid = data.authUser?.uid;
            
            // 1. Sync to Website Tabs (Local)
            chrome.tabs.query({ url: ["*://localhost/*", "*://focus-shield.vercel.app/*"] }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (payload) => {
                            window.postMessage({ type: "FOCUS_SHIELD_EXT_UPDATE", payload }, "*");
                        },
                        args: [data]
                    }).catch(() => {});
                });
            });

            // 2. Sync to Firestore (Cloud) via Next.js API
            if (uid) {
                const config = {};
                syncKeys.forEach(k => { if (data[k] !== undefined) config[k] = data[k]; });
                
                fetch('http://localhost:3000/api/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid, config })
                }).then(r => r.json())
                  .then(res => console.log('Cloud Sync Success:', res))
                  .catch(err => console.error('Cloud Sync Failed:', err));
            }
        });
    }
});

// Fetch latest config from Firestore via the website's sync API
async function refreshFromCloud() {
    try {
        const data = await chrome.storage.local.get(['authUser']);
        const uid = data.authUser?.uid;
        if (!uid) return { success: false, reason: 'no_user' };

        const response = await fetch(`http://localhost:3000/api/sync?uid=${encodeURIComponent(uid)}`);
        if (!response.ok) return { success: false, reason: 'api_error' };

        const result = await response.json();
        if (!result.config) return { success: false, reason: 'no_config' };

        const config = result.config;
        const syncKeys = ['blockedSites', 'blockedCategories', 'blockedKeywords', 'usageLimits', 'isBlockingEnabled', 'isWhitelistMode', 'focusWhitelist', 'focusSession', 'settings', 'schedule'];
        
        const toStore = {};
        syncKeys.forEach(key => {
            if (config[key] !== undefined) toStore[key] = config[key];
        });

        if (Object.keys(toStore).length > 0) {
            await chrome.storage.local.set(toStore);
            console.log('Cloud Sync: Updated local storage from Firestore', Object.keys(toStore));
        }

        return { success: true };
    } catch (err) {
        console.error('Cloud Sync: Refresh failed', err);
        return { success: false, reason: err.message };
    }
}

// Focus Mode Logic
let focusInterval = null;

async function startFocusMode(duration) {
    const session = {
        active: true,
        paused: false,
        startTime: Date.now(),
        endTime: Date.now() + (duration * 1000),
        duration: duration,
        timeLeft: duration,
        type: 'focus'
    };
    
    await chrome.storage.local.set({ focusSession: session });
    startFocusInterval();
}

async function pauseFocusMode() {
    const data = await chrome.storage.local.get(['focusSession']);
    if (data.focusSession && data.focusSession.active) {
        const session = data.focusSession;
        session.paused = !session.paused;
        if (session.paused) {
            stopFocusInterval();
        } else {
            session.endTime = Date.now() + (session.timeLeft * 1000);
            startFocusInterval();
        }
        await chrome.storage.local.set({ focusSession: session });
    }
}

async function resetFocusMode() {
    stopFocusInterval();
    const data = await chrome.storage.local.get(['focusSession']);
    const duration = data.focusSession?.duration || 25 * 60;
    const session = {
        active: false,
        paused: false,
        startTime: null,
        endTime: null,
        duration: duration,
        timeLeft: duration,
        type: 'focus'
    };
    await chrome.storage.local.set({ focusSession: session });
    chrome.action.setBadgeText({ text: '' });
}

function startFocusInterval() {
    if (focusInterval) clearInterval(focusInterval);
    focusInterval = setInterval(async () => {
        const data = await chrome.storage.local.get(['focusSession']);
        const session = data.focusSession;
        
        if (!session || !session.active || session.paused) {
            stopFocusInterval();
            return;
        }
        
        const now = Date.now();
        const timeLeft = Math.max(0, Math.round((session.endTime - now) / 1000));
        
        if (timeLeft !== session.timeLeft) {
            session.timeLeft = timeLeft;
            await chrome.storage.local.set({ focusSession: session });
            
            // Update Badge
            const mins = Math.ceil(timeLeft / 60);
            chrome.action.setBadgeText({ text: timeLeft > 0 ? `${mins}m` : 'Done' });
            chrome.action.setBadgeBackgroundColor({ color: timeLeft > 0 ? '#6366f1' : '#10b981' });
        }
        
        if (timeLeft <= 0) {
            stopFocusInterval();
            // Optional: Notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'Focus Session Complete!',
                message: 'Time to take a break.'
            });
        }
    }, 1000);
}

function stopFocusInterval() {
    if (focusInterval) {
        clearInterval(focusInterval);
        focusInterval = null;
    }
}

// Initialize timer on load if session is active
chrome.storage.local.get(['focusSession'], (data) => {
    if (data.focusSession && data.focusSession.active && !data.focusSession.paused) {
        startFocusInterval();
    }
});
