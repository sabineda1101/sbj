"use client";
 
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getSupabase } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { isSupabase } = useAuth();

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);

    const client = isSupabase ? getSupabase() : null;

    if (client) {
      try {
        // Trigger real Supabase OAuth with Google
        const { error } = await client.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      } catch (err) {
        console.error("Supabase OAuth error:", err);
        setIsSigningIn(false);
      }
    } else {
      // Fallback: Simulate authentication process for developer testing
      setTimeout(() => {
        const mockUser = {
          id: "mock-user-001",
          name: "김인우",
          email: "inu.kim@inu.ac.kr",
          avatar: "/Mascot.png",
        };

        // Save user profile to localStorage for session management
        localStorage.setItem("user", JSON.stringify(mockUser));

        // Post message to the opener window to notify successful authentication
        if (typeof window !== "undefined") {
          window.opener?.postMessage(
            { type: "AUTH_SUCCESS", user: mockUser },
            window.location.origin
          );
          // Close the popup window
          window.close();
        }
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] w-full">
      {/* Login Card */}
      <div className="bg-white/70 border border-white/50 backdrop-blur-md shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center space-y-6 relative transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        {/* Mascot PNG at the top */}
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Mascot.png"
            alt="INU Mascot"
            className="w-28 h-28 mx-auto object-contain rounded-2xl transform transition-transform duration-500 hover:rotate-6 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=150";
            }}
          />
        </div>

        {/* Title / Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-white/60 shadow-sm rounded-full text-xs font-semibold text-[#666] mb-1">
            INU 기초교육원
          </div>
          <h2 className="text-xl font-bold text-[#111] tracking-tight">구글 계정으로 로그인</h2>
          <p className="text-xs text-[#666] max-w-[260px] mx-auto leading-relaxed">
            인천대학교 기초교육원 교과목 조회 및 장바구니 연동을 위해 로그인해 주세요.
          </p>
          {!isSupabase && (
            <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-1.5 font-medium border border-amber-100">
              ⚠️ Supabase 미설정 (개발 테스트용 모의 로그인으로 동작)
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isSigningIn ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-[#666] shadow-sm select-none"
            >
              <Loader2 size={18} className="animate-spin text-[#4285F4]" />
              <span>구글 인증 진행 중...</span>
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl text-sm font-bold text-[#3c4043] shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Google 계정으로 계속하기</span>
            </button>
          )}
        </div>

        {/* Footer Notice */}
        <p className="text-[10px] text-gray-400">
          인천대학교 포털 계정(인하벤처 및 학번)의 구글 계정을 권장합니다.
        </p>
      </div>
    </div>
  );
}
