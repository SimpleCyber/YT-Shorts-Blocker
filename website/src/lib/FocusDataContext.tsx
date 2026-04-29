"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot, DocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import { DEFAULTS, isExtensionAvailable, setData as setExtensionData, getData as getExtensionData } from "./extensionBridge";

export interface FocusData {
  blockedSites: string[];
  blockedCategories: string[];
  blockedKeywords: string[];
  isWhitelistMode: boolean;
  isBlockingEnabled: boolean;
  usageLimits: { domain: string; limitMinutes: number }[];
  schedule: {
    enabled: boolean;
    intervals: { id: string; start: string; end: string }[];
    days: string[];
  };
  settings: Record<string, any>;
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
const SYNC_INTERVAL = 10000; // 10 seconds debounce for auto-sync

export function FocusDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setDataState] = useState<FocusData>({
    blockedSites: DEFAULTS.blockedSites,
    blockedCategories: [],
    blockedKeywords: [],
    isWhitelistMode: false,
    isBlockingEnabled: true,
    usageLimits: [],
    schedule: DEFAULTS.schedule,
    settings: {},
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

  const syncToRemote = useCallback(async (currentData: FocusData) => {
    if (!user) return;
    try {
      // Sync to Firestore
      await setDoc(doc(db, "users", user.uid), { 
        config: { ...currentData, lastSynced: Date.now() } 
      }, { merge: true });
      
      // Sync to Extension
      if (isExtensionAvailable()) {
        await setExtensionData(currentData);
      }
      
      console.log("Data synced successfully");
    } catch (e) {
      console.error("Sync failed", e);
    }
  }, [user]);

  const updateData = useCallback((newData: Partial<FocusData>) => {
    if (!user) return;

    setDataState((prev) => {
      const updated = { ...prev, ...newData };
      
      // Save to Local Storage immediately
      localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(updated));

      // Debounce Sync to Remote
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncToRemote(updated);
      }, SYNC_INTERVAL);

      return updated;
    });
  }, [user, syncToRemote]);

  const syncNow = async () => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    await syncToRemote(data);
  };

  return (
    <FocusDataContext.Provider value={{ data, loading, updateData, syncNow }}>
      {children}
    </FocusDataContext.Provider>
  );
}
