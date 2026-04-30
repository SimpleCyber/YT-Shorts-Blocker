// Extension Bridge — communicates with the FocusShield extension via window.postMessage

export interface FocusSession {
  active: boolean;
  paused: boolean;
  startTime: number | null;
  endTime: number | null;
  duration: number;
  timeLeft: number;
  type: 'focus' | 'break';
}

/**
 * Check if the FocusShield extension is reachable.
 * With the postMessage bridge, we'll assume it's available if window exists,
 * but actual availability is determined by timeout on requests.
 */
export function isExtensionAvailable(): boolean {
  return typeof window !== "undefined";
}

/**
 * Read data from the extension's chrome.storage.local.
 * @param keys - Array of keys to read, or null for all data.
 */
export function getData(keys: string[] | null = null): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("No window"));
      return;
    }
    
    const actionType = "GET_DATA_" + Date.now() + Math.random();
    
    const listener = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data && event.data.type === "FOCUS_SHIELD_SYNC_RESPONSE" && event.data.actionType === actionType) {
        window.removeEventListener("message", listener);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else if (event.data.response) {
          resolve(event.data.response);
        } else {
          reject(new Error("No response from extension"));
        }
      }
    };
    
    window.addEventListener("message", listener);
    window.postMessage({ 
      type: "FOCUS_SHIELD_SYNC", 
      actionType,
      payload: { action: "getData", keys } 
    }, "*");
    
    // Timeout after 5 seconds (increased from 1s for better reliability in dev)
    setTimeout(() => {
      window.removeEventListener("message", listener);
      reject(new Error("Extension not available or timed out"));
    }, 5000);
  });
}

/**
 * Write data to the extension's chrome.storage.local.
 * @param data - Key-value pairs to store.
 */
export function setData(data: Record<string, unknown>): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("No window"));
      return;
    }

    const actionType = "SET_DATA_" + Date.now() + Math.random();

    const listener = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data && event.data.type === "FOCUS_SHIELD_SYNC_RESPONSE" && event.data.actionType === actionType) {
        window.removeEventListener("message", listener);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else if (event.data.response) {
          resolve(event.data.response as { success: boolean });
        } else {
          reject(new Error("No response from extension"));
        }
      }
    };
    
    window.addEventListener("message", listener);
    window.postMessage({ 
      type: "FOCUS_SHIELD_SYNC", 
      actionType,
      payload: { action: "setData", data } 
    }, "*");
    
    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener("message", listener);
      reject(new Error("Extension not available or timed out"));
    }, 5000);
  });
}

/**
 * Start a focus session.
 */
export function startFocus(duration: number): void {
  console.log("FocusShield: Starting focus session", duration);
  window.postMessage({ 
    type: "FOCUS_SHIELD_SYNC", 
    payload: { action: "START_FOCUS", duration } 
  }, "*");
}

export function pauseFocus(): void {
  console.log("FocusShield: Toggling pause/resume");
  window.postMessage({ 
    type: "FOCUS_SHIELD_SYNC", 
    payload: { action: "PAUSE_FOCUS" } 
  }, "*");
}

export function resetFocus(): void {
  console.log("FocusShield: Resetting focus session");
  window.postMessage({ 
    type: "FOCUS_SHIELD_SYNC", 
    payload: { action: "RESET_FOCUS" } 
  }, "*");
}

// Default values matching options.js
export const DEFAULTS = {
  blockedSites: ["youtube.com/shorts", "instagram.com/reels"],
  blockedCategories: [] as string[],
  blockedKeywords: [] as string[],
  focusDuration: 25 * 60,
  focusWhitelist: [] as string[],
  focusSession: {
    active: false,
    paused: false,
    startTime: null,
    endTime: null,
    duration: 25 * 60,
    timeLeft: 25 * 60,
    type: 'focus'
  } as FocusSession,
  isBlockingEnabled: true,
  isWhitelistMode: false,
  usageLimits: [] as { domain: string; limitMinutes: number }[],
  schedule: {
    enabled: false,
    intervals: [{ id: "1", start: "09:00", end: "17:00" }],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  },
};

export const ADULT_KEYWORDS = [
  "porn", "pron", "sexvideo", "sexvideos", "xxx", "adult", "sex",
  "pornhub", "xvideos", "xnxx", "redtube", "youporn", "tube8",
  "spankbang", "xhamster", "brazzers", "naughtyamerica",
  "p0rn", "pr0n", "xxxvideo", "sex-video", "sex-videos",
  "free-sex-videos", "bestpornsite", "nsfw", "onlyfans",
];

export const MODAL_CATEGORIES = [
  { name: "Adult", id: "adult", icon: "fa-ban", color: "#ef4444", sites: ["pornhub.com", "xvideos.com", "xnxx.com"] },
  { name: "Social", id: "social", icon: "fa-comments", color: "#8b5cf6", sites: ["facebook.com", "instagram.com", "x.com", "tiktok.com", "snapchat.com"] },
  { name: "News", id: "news", icon: "fa-newspaper", color: "#64748b", sites: ["cnn.com", "foxnews.com", "nytimes.com", "bbc.com", "buzzfeed.com"] },
  { name: "Sports", id: "sports", icon: "fa-basketball-ball", color: "#f97316", sites: ["espn.com", "nba.com", "nfl.com", "skysports.com"] },
  { name: "Shopping", id: "shopping", icon: "fa-shopping-cart", color: "#3b82f6", sites: ["amazon.com", "ebay.com", "walmart.com", "target.com", "aliexpress.com"] },
];

export const SUGGESTED_SITES = [
  { name: "youtube.com", icon: "youtube.com" },
  { name: "netflix.com", icon: "netflix.com" },
  { name: "facebook.com", icon: "facebook.com" },
  { name: "instagram.com", icon: "instagram.com" },
  { name: "x.com", icon: "x.com" },
  { name: "reddit.com", icon: "reddit.com" },
  { name: "tiktok.com", icon: "tiktok.com" },
  { name: "amazon.com", icon: "amazon.com" },
  { name: "buzzfeed.com", icon: "buzzfeed.com" },
  { name: "pinterest.com", icon: "pinterest.com" },
  { name: "twitch.tv", icon: "twitch.tv" },
  { name: "discord.com", icon: "discord.com" },
  { name: "hulu.com", icon: "hulu.com" },
  { name: "hbomax.com", icon: "hbomax.com" },
];

export const FREE_LIMIT = 3;
