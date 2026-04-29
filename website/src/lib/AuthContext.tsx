"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";



interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  photoBase64: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function convertImageToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/convert-image?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.base64 || null;
  } catch {
    return null;
  }
}

async function saveUserToFirestore(user: User, photoBase64: string | null) {
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);

  const name = user.displayName || "User";
  const email = user.email || "";
  const username = email.split("@")[0] || "user_" + user.uid.substring(0, 5);

  const userData: Record<string, unknown> = {
    uid: user.uid,
    email: email,
    name: name,
    displayName: name,
    username: username,
    photoURL: user.photoURL || null,
    photoBase64: photoBase64,
    lastLogin: serverTimestamp(),
  };

  if (!existing.exists()) {
    userData.createdAt = serverTimestamp();
    userData.plan = "free";
  }

  await setDoc(userRef, userData, { merge: true });
}

function syncAuthToExtension(authUser: AuthUser | null) {
  if (typeof window !== "undefined") {
    try {
      window.postMessage({
        type: "FOCUS_SHIELD_SYNC",
        payload: authUser
          ? { action: "syncAuth", user: authUser }
          : { action: "signOut" }
      }, "*");
    } catch {
      // Ignore errors
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let photoBase64: string | null = null;
        if (firebaseUser.photoURL) {
          // Try to get cached base64 from Firestore first
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists() && userDoc.data().photoBase64) {
              photoBase64 = userDoc.data().photoBase64;
            } else {
              photoBase64 = await convertImageToBase64(firebaseUser.photoURL);
            }
          } catch {
            photoBase64 = await convertImageToBase64(firebaseUser.photoURL);
          }
        }

        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          photoBase64,
        };

        setUser(authUser);
        syncAuthToExtension(authUser);
      } else {
        setUser(null);
        syncAuthToExtension(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    let photoBase64: string | null = null;
    if (result.user.photoURL) {
      photoBase64 = await convertImageToBase64(result.user.photoURL);
    }
    await saveUserToFirestore(result.user, photoBase64);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(result.user, null);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await saveUserToFirestore(result.user, null);
  };

  const signOutUser = async () => {
    syncAuthToExtension(null);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
