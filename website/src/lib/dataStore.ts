"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULTS, getData as getExtensionData, setData as setExtensionData, isExtensionAvailable } from "./extensionBridge";

const LOCAL_STORAGE_KEY = "focus_shield_data";
const SYNC_DELAY = 5000; // 5 seconds debounce

let syncTimeout: NodeJS.Timeout | null = null;

export interface FocusData {
  blockedSites: string[];
  usageLimits: { domain: string; limitMinutes: number }[];
  isBlockingEnabled: boolean;
  isWhitelistMode: boolean;
  focusWhitelist: string[];
  focusSession: any;
  schedule: {
    enabled: boolean;
  };
  settings: Record<string, any>;
  [key: string]: any;
}

/**
 * Load data from Local Storage, falling back to Firestore if empty.
 */
export async function loadData(uid: string): Promise<FocusData> {
  // 1. Try Local Storage
  const local = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${uid}`);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error("Error parsing local data", e);
    }
  }

  // 2. Try Firestore
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists() && userDoc.data().config) {
      const remoteData = userDoc.data().config as FocusData;
      // Save to local for next time
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${uid}`, JSON.stringify(remoteData));
      return remoteData;
    }
  } catch (e) {
    console.error("Error loading remote data", e);
  }

  // 3. Try Extension (if available) as last resort
  if (isExtensionAvailable()) {
    try {
      const extData = await getExtensionData() as any;
      if (extData && Object.keys(extData).length > 0) {
          const formattedData: FocusData = {
              blockedSites: extData.blockedSites || DEFAULTS.blockedSites,
              usageLimits: extData.usageLimits || DEFAULTS.usageLimits,
              isBlockingEnabled: extData.isBlockingEnabled !== false,
              isWhitelistMode: extData.isWhitelistMode || DEFAULTS.isWhitelistMode,
              focusWhitelist: extData.focusWhitelist || DEFAULTS.focusWhitelist,
              focusSession: extData.focusSession || DEFAULTS.focusSession,
              schedule: extData.schedule || DEFAULTS.schedule,
              settings: extData.settings || {},
          };
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_${uid}`, JSON.stringify(formattedData));
          return formattedData;
      }
    } catch (e) {
      /* ignore */
    }
  }

  // 4. Default values
  return {
    blockedSites: DEFAULTS.blockedSites,
    usageLimits: DEFAULTS.usageLimits,
    isBlockingEnabled: DEFAULTS.isBlockingEnabled,
    isWhitelistMode: DEFAULTS.isWhitelistMode,
    focusWhitelist: DEFAULTS.focusWhitelist,
    focusSession: DEFAULTS.focusSession,
    schedule: DEFAULTS.schedule,
    settings: {},
  };
}

/**
 * Save data to Local Storage and schedule a Firestore/Extension sync.
 */
export function saveData(uid: string, data: FocusData) {
  // Update Local Storage immediately
  localStorage.setItem(`${LOCAL_STORAGE_KEY}_${uid}`, JSON.stringify(data));

  // Schedule sync
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(async () => {
    try {
      // 1. Sync to Firestore
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { config: data }, { merge: true });
      console.log("Synced to Firestore");

      // 2. Sync to Extension if available
      if (isExtensionAvailable()) {
        await setExtensionData(data);
        console.log("Synced to Extension");
      }
    } catch (e) {
      console.error("Sync failed", e);
    }
  }, SYNC_DELAY);
}
