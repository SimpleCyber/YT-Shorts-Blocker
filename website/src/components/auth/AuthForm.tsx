"use client";

import React, { useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import Link from "next/link";

export default function AuthForm() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignUp) {
        if (!name.trim()) { setError("Please enter your name"); setSubmitting(false); return; }
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === "auth/user-not-found") setError("No account found with this email");
      else if (firebaseErr.code === "auth/wrong-password") setError("Incorrect password");
      else if (firebaseErr.code === "auth/invalid-credential") setError("Invalid email or password");
      else if (firebaseErr.code === "auth/email-already-in-use") setError("Email already in use");
      else if (firebaseErr.code === "auth/weak-password") setError("Password must be at least 6 characters");
      else setError(firebaseErr.message || "Something went wrong");
    }
    setSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    try { await signInWithGoogle(); } catch (err: unknown) {
      setError((err as { message?: string }).message || "Google sign-in failed");
    }
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
      <div className="absolute top-8 left-8 lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600">
          <i className="fas fa-shield-alt text-2xl"></i>
          <span className="text-xl font-bold text-slate-900">FocusShield</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{isSignUp ? "Create an account" : "Welcome back"}</h2>
          <p className="text-slate-500">{isSignUp ? "Join FocusShield to sync your settings across devices." : "Enter your details to access your dashboard."}</p>
        </div>

        <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-semibold text-slate-700 text-sm mb-6 shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200"></div><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or sign in with email</span><div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200" />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              {!isSignUp && <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</a>}
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200" />
          </div>

          {error && <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100"><i className="fas fa-exclamation-circle mt-0.5"></i><span>{error}</span></div>}

          <button type="submit" disabled={submitting} className="w-full py-3.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center">
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="ml-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              {isSignUp ? "Sign in instead" : "Create an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
