"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot, DocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import { DEFAULTS, isExtensionAvailable, setData as setExtensionData, getData as getExtensionData, FocusSession, CustomBlockPage } from "./extensionBridge";

export interface FocusData {
  blockedSites: string[];
  blockedCategories: string[];
  blockedKeywords: string[];
  isWhitelistMode: boolean;
  isBlockingEnabled: boolean;
  usageLimits: { domain: string; limitMinutes: number }[];
  focusWhitelist: string[];
  focusSession: FocusSession;
  schedule: {
    enabled: boolean;
    intervals: { id: string; start: string; end: string }[];
    days: string[];
  };
  passwordProtection: {
    enabled: boolean;
    passwordHash: string;
    lockUntil?: number | null;
  };
  customBlockPage: CustomBlockPage;
  settings: Record<string, any>;
  duration: number;
  lastSynced?: number;
  [key: string]: any;
}

interface FocusDataContextType {
  data: FocusData;
  loading: boolean;
  updateData: (newData: Partial<FocusData>) => void;
  syncNow: () => Promise<void>;
}

const FocusDataContext = createContext<FocusDataContextType | null>(null);

export function useFocusData() {
  const ctx = useContext(FocusDataContext);
  if (!ctx) throw new Error("useFocusData must be used within FocusDataProvider");
  return ctx;
}

const STORAGE_KEY = "focus_shield_local_data";
const FIRESTORE_SYNC_INTERVAL = 2000; // 2 seconds debounce for Firestore writes

export function FocusDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setDataState] = useState<FocusData>({
    blockedSites: DEFAULTS.blockedSites,
    blockedCategories: [],
    blockedKeywords: [],
    isWhitelistMode: false,
    isBlockingEnabled: true,
    usageLimits: [],
    focusWhitelist: [],
    focusSession: DEFAULTS.focusSession,
    schedule: DEFAULTS.schedule,
    settings: {},
    duration: 60,
    passwordProtection: DEFAULTS.passwordProtection,
    customBlockPage: DEFAULTS.customBlockPage,
  });
  const [loading, setLoading] = useState(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load and Firestore Real-time Listener
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Load from local storage first for immediate UI
    const local = localStorage.getItem(`${STORAGE_KEY}_${user.uid}`);
    if (local) {
      try { 
        const parsed = JSON.parse(local);
        setDataState(prev => ({ ...prev, ...parsed })); 
      } catch (e) {}
    }

    // Subscribe to Firestore changes
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap: DocumentSnapshot) => {
      if (docSnap.exists() && docSnap.data().config) {
        const remoteData = docSnap.data().config as FocusData;
        
        setDataState(prev => {
          const mergedData = { ...DEFAULTS, ...remoteData };
          if (JSON.stringify(prev) !== JSON.stringify(mergedData)) {
            localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(mergedData));
            
            // Push Firestore changes to Extension immediately
            if (isExtensionAvailable()) {
              setExtensionData(mergedData).catch(() => {});
            }
            
            return mergedData;
          }
          return prev;
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // 2. Listen for changes FROM the Extension
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data?.type === "FOCUS_SHIELD_EXT_UPDATE" && event.data.payload) {
        const extData = event.data.payload as Partial<FocusData>;
        updateData(extData);
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, [user]);

  // Sync to Firestore only (debounced)
  const syncToFirestore = useCallback(async (currentData: FocusData) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { 
        config: { ...currentData, lastSynced: Date.now() } 
      }, { merge: true });
      console.log("Firestore sync complete");
    } catch (e) {
      console.error("Firestore sync failed", e);
    }
  }, [user]);

  // Sync to Extension immediately (no debounce)
  const syncToExtension = useCallback(async (currentData: FocusData) => {
    if (!isExtensionAvailable()) return;
    try {
      await setExtensionData(currentData);
      console.log("Extension sync complete");
    } catch (e) {
      // Extension not available — silent fail
    }
  }, []);

  const updateData = useCallback((newData: Partial<FocusData>) => {
    if (!user) return;

    setDataState((prev) => {
      // Deep check for changes to avoid infinite sync loops
      const hasChanged = Object.entries(newData).some(([key, value]) => {
        return JSON.stringify(prev[key as keyof FocusData]) !== JSON.stringify(value);
      });

      if (!hasChanged) return prev;

      const updated = { ...prev, ...newData };
      
      // Save to Local Storage immediately
      localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(updated));

      // Sync to Extension IMMEDIATELY
      syncToExtension(updated);

      // Debounce Firestore sync (2s)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncToFirestore(updated);
      }, FIRESTORE_SYNC_INTERVAL);

      return updated;
    });
  }, [user, syncToFirestore, syncToExtension]);

  const syncNow = async () => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    await syncToFirestore(data);
    await syncToExtension(data);
  };

  return (
    <FocusDataContext.Provider value={{ data, loading, updateData, syncNow }}>
      {children}
    </FocusDataContext.Provider>
  );
}
