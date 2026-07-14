"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { checkAndSeedUserAllowlist } from "@/lib/supabase/allowlist";
import { Session } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Check if current route is public or anchor page
  const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/anchor/");

  const handleRedirection = useCallback((activeSession: Session | null) => {
    if (!activeSession && !isPublic) {
      router.push("/login");
    } else if (activeSession && (pathname === "/login" || pathname === "/register")) {
      router.push("/dashboard");
    }
  }, [isPublic, pathname, router]);

  useEffect(() => {
    let mounted = true;

    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(activeSession);
          setLoading(false);
          if (activeSession?.user?.id) {
            checkAndSeedUserAllowlist(activeSession.user.id);
          }
          handleRedirection(activeSession);
        }
      } catch (err) {
        console.error("Auth check session error:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, activeSession) => {
        if (mounted) {
          setSession(activeSession);
          if (activeSession?.user?.id) {
            checkAndSeedUserAllowlist(activeSession.user.id);
          }
          handleRedirection(activeSession);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [handleRedirection]);

  // If loading and accessing protected route, show futuristic loading orb
  if (loading && !isPublic) {
    return (
      <div
        data-testid="auth-loading"
        className="min-h-screen bg-deeper flex flex-col items-center justify-center relative p-6 overflow-hidden"
      >
        {/* Futuristic background */}
        <div className="scene-bg">
          <div className="orb w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,transparent_70%)] animate-pulse-dot" />
          <div className="grid-overlay" />
        </div>

        {/* Core glowing orb */}
        <div className="relative w-24 h-24 rounded-full flex items-center justify-center border border-violet/30 shadow-[0_0_50px_rgba(124,58,237,0.3)] bg-violet-pale/10 animate-breathe">
          <div className="w-10 h-10 rounded-full bg-violet animate-ping opacity-60" />
          <div className="absolute w-4 h-4 rounded-full bg-violet shadow-[0_0_15px_rgba(124,58,237,0.8)]" />
        </div>

        {/* Loading details */}
        <div className="mt-8 text-center">
          <h2 className="text-text-primary text-sm font-display font-semibold uppercase tracking-widest animate-pulse">
            Mengotentikasi Sesi
          </h2>
          <p className="text-text-muted text-[10px] font-mono mt-1 uppercase tracking-wider">
            Menyelaraskan data ekosistem fokus...
          </p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content before redirect
  if (!session && !isPublic) {
    return null;
  }

  // Prevent flash of auth pages when logged in before redirect
  if (session && (pathname === "/login" || pathname === "/register")) {
    return null;
  }

  return <>{children}</>;
}
