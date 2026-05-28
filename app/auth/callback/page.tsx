"use client";
 
import { useEffect, Suspense } from "react";
import { getSupabase, isSupabaseConfigured } from "../../utils/supabase";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  useEffect(() => {
    const handleCallback = async () => {
      const client = isSupabaseConfigured ? getSupabase() : null;
      if (client) {
        try {
          // Exchange the PKCE authorization code for a session
          const searchParams = new URLSearchParams(window.location.search);
          const code = searchParams.get("code");
          if (code) {
            await client.auth.exchangeCodeForSession(code);
          }
        } catch (e) {
          console.error("Error exchanging code for session:", e);
        }

        // Retrieve the current user from Supabase session
        const { data: { user }, error } = await client.auth.getUser();

        if (user) {
          const profile = {
            name: user.user_metadata?.full_name || user.user_metadata?.name || "구글 사용자",
            email: user.email || "",
            avatar: user.user_metadata?.avatar_url || "/Mascot.png",
          };

          // Save user to localStorage so other pages can sync
          localStorage.setItem("user", JSON.stringify(profile));

          // Post message back to opener window
          if (typeof window !== "undefined") {
            window.opener?.postMessage(
              { type: "AUTH_SUCCESS", user: profile },
              window.location.origin
            );
            window.close();
          }
        } else {
          // If no user found immediately, check if session is active
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            const profile = {
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "구글 사용자",
              email: session.user.email || "",
              avatar: session.user.user_metadata?.avatar_url || "/Mascot.png",
            };
            localStorage.setItem("user", JSON.stringify(profile));
            if (typeof window !== "undefined") {
              window.opener?.postMessage(
                { type: "AUTH_SUCCESS", user: profile },
                window.location.origin
              );
              window.close();
            }
          } else if (error) {
            console.error("Auth callback error:", error);
            if (typeof window !== "undefined") window.close();
          }
        }
      } else {
        // Fallback for mock mode (should not normally hit callback unless manually visited)
        if (typeof window !== "undefined") window.close();
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
      <Loader2 size={36} className="animate-spin text-[#4285F4]" />
      <h2 className="text-sm font-semibold text-[#111]">인증을 처리하고 있습니다...</h2>
      <p className="text-xs text-gray-500">잠시만 기다려 주세요.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 size={36} className="animate-spin text-[#4285F4]" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
