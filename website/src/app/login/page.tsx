"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";
import AuthCarousel from "../../components/auth/AuthCarousel";
import AuthForm from "../../components/auth/AuthForm";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-['Outfit']">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <AuthCarousel />
      <AuthForm />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
