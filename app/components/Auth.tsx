"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Auth() {
  const { user, isSupabase, signOut, signInMock, refreshSession } = useAuth();
  const { cart } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Listen to message events from the auth popup
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "AUTH_SUCCESS") {
        try {
          if (isSupabase) {
            await refreshSession();
          } else {
            signInMock(event.data.user);
          }
          setToastMessage("Google 계정으로 로그인되었습니다.");
          
          // Force push to home page and refresh state
          router.push("/");
          router.refresh();
        } catch (e) {
          console.error("Error handling authentication message:", e);
        }
      }
    };
    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [router, isSupabase, signInMock, refreshSession]);

  const openLoginPopup = () => {
    const width = 450;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      "/auth",
      "INU_Google_Login",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no,location=no,resizable=no`
    );
  };

  const handleLogout = async () => {
    await signOut();
    setToastMessage("로그아웃되었습니다.");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative z-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#111] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce border border-white/10 backdrop-blur-md z-[9999]">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Auth Button/Link */}
      {user ? (
        <div 
          className="relative group flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href="/orders" className="ml-2 px-3 py-1 bg-white/70 hover:bg-white/90 border border-white/50 hover:border-[#111]/30 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-[#111] transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md flex items-center gap-1">
            <span>주문내역</span>
          </Link>
          <Link href="/cart" className="ml-2 px-3 py-1 bg-white/70 hover:bg-white/90 border border-white/50 hover:border-[#111]/30 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-[#111] transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md flex items-center gap-1">
            <span>장바구니</span>
            {cart.length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-600 text-white rounded-full leading-none animate-pulse">
                {cart.length}
              </span>
            )}
          </Link>
          {/* User Profile Avatar with sleek hover ring */}
          <button
            className="flex items-center gap-2 p-0.5 bg-white/80 hover:bg-white border border-white/60 hover:border-black/10 backdrop-blur-sm shadow-sm rounded-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md relative after:absolute after:inset-0 after:rounded-full after:border-2 after:border-transparent hover:after:border-blue-400/20 after:transition-all"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-9 h-9 rounded-full object-cover border border-black/10 bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100";
              }}
            />
          </button>

          {/* Premium Glassmorphic Hover Popover */}
          <div className="absolute left-0 top-full mt-2 w-64 opacity-0 translate-y-2 -translate-x-8 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 ease-out z-[999]">
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-3xl p-5 space-y-4 transform origin-top-right">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-11 h-11 rounded-full object-cover border border-black/5 bg-white shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100";
                  }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-[#111] text-sm truncate leading-tight">{user.name}</span>
                  <span className="text-[10px] text-[#666] truncate mt-0.5">{user.email}</span>
                </div>
              </div>
              
              <div className="border-t border-black/[0.06] my-1" />
              
              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-[#ef4444] bg-red-50/50 hover:bg-red-50 border border-red-100/30 hover:border-red-100 transition-all cursor-pointer group/btn"
              >
                <span>Sign Out</span>
                <LogOut size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          
            {/* Order Button */}
            <button onClick={openLoginPopup} className="px-3 py-1 bg-white/70 hover:bg-white/90 border border-white/50 hover:border-[#111]/30 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-[#111] transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md flex items-center gap-1">
              <span>주문내역</span>
            </button>
            {/* Cart Button */}
            <button onClick={openLoginPopup} className="px-3 py-1 bg-white/70 hover:bg-white/90 border border-white/50 hover:border-[#111]/30 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-[#111] transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md flex items-center gap-1">
              <span>장바구니</span>
              {cart.length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-600 text-white rounded-full leading-none animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>

          <button
            onClick={openLoginPopup}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/70 hover:bg-white/90 border border-white/50 hover:border-[#111]/30 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-[#111] transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md"
          >
            <User size={14} className="text-[#666]" />
            <span>로그인</span>
          </button>
        </div>
      )}
    </div>
  );
}
