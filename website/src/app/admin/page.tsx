"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.email !== adminEmail) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, adminEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.email !== adminEmail) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-['Outfit'] p-8">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Admin Control Center
            </h1>
            <p className="text-slate-400 mt-2">Welcome back, {user.displayName || "Admin"}</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-xl">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold">1,284</p>
            <div className="mt-4 flex items-center text-emerald-400 text-sm">
              <i className="fas fa-arrow-up mr-1"></i>
              <span>12% from last month</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-xl">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Active Blocks</h3>
            <p className="text-3xl font-bold">45,902</p>
            <div className="mt-4 flex items-center text-emerald-400 text-sm">
              <i className="fas fa-arrow-up mr-1"></i>
              <span>8% from last month</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-xl">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Revenue</h3>
            <p className="text-3xl font-bold">$12,450</p>
            <div className="mt-4 flex items-center text-indigo-400 text-sm">
              <i className="fas fa-chart-line mr-1"></i>
              <span>Stable</span>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>
          <div className="p-8 text-center text-slate-500">
            <i className="fas fa-lock text-4xl mb-4 opacity-20"></i>
            <p>Admin functionality is currently locked. Additional instructions needed.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background-color: #0f172a;
        }
      `}</style>
    </div>
  );
}
