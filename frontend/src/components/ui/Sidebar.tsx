"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSessionStore } from "@/lib/state/sessionStore";
import { useToast } from "@/components/ui/Toast";

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="7" rx="1" />
        <rect x="11" y="2" width="7" height="7" rx="1" />
        <rect x="2" y="11" width="7" height="7" rx="1" />
        <rect x="11" y="11" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Sesi Baru",
    href: "/session/new",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" />
        <path d="M10 6v4l3 2" />
      </svg>
    ),
  },
  {
    label: "Study Chamber",
    href: "/session/new",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18V6l7-4l7 4v12" />
        <path d="M7 18v-4h6v4" />
        <rect x="8" y="10" width="4" height="4" rx="0.5" />
      </svg>
    ),
  },
  {
    label: "Distraction Review",
    href: "/distraction-review",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h12M4 10h8M4 14h6" />
      </svg>
    ),
  },
  {
    label: "Focus Allow-list",
    href: "/settings/allowlist",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 10l3 3l7-7" />
        <rect x="2" y="2" width="16" height="16" rx="3" />
      </svg>
    ),
  },
];

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  // Prevent ESLint unused variable warning
  if (currentPage) {
    // no-op
  }
  const { isOpen, close } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();
  
  const [userEmail, setUserEmail] = useState('demo@focusync.com');
  
  // Zustand States for session status and routing
  const sessionId = useSessionStore((state) => state.sessionId);
  const status = useSessionStore((state) => state.status);
  const setStatus = useSessionStore((state) => state.setStatus);
  const setSessionId = useSessionStore((state) => state.setSessionId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 1. Konfigurasi Sesi Baru (Button memicu createSession)
  const handleCreateSession = () => {
    const newSessionId = 'fs-sess-' + Math.random().toString(36).substring(2, 11);
    setSessionId(newSessionId);
    setStatus('PAIRING');
    addToast('success', 'Sesi baru berhasil diinisialisasi! Memulai proses pairing...');
    router.push(`/session/${newSessionId}`);
  };

  // 2. Konfigurasi Study Chamber (Deteksi sesi aktif di Zustand)
  const handleStudyChamberClick = () => {
    const hasActiveSession = status !== 'IDLE' && status !== 'FAILED' && status !== 'SUCCESS';
    if (!hasActiveSession) {
      addToast('error', 'Silakan mulai sesi baru terlebih dahulu untuk mengakses Study Chamber.');
    } else {
      router.push(`/session/${sessionId}`);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-deeper border-r border-glass-border
          flex flex-col transition-transform duration-300 lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-glass-border shrink-0">
          <img src="/FocuSync.svg" alt="FocuSync" className="h-8 w-auto" />
          <span className="font-display font-bold text-lg text-text-primary">FocuSync</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isSesiBaru = item.label === "Sesi Baru";
            const isChamber = item.label === "Study Chamber";

            // Determine if active menu styling is active
            let active = false;
            let targetHref = item.href;

            if (isChamber) {
              targetHref = `/session/${sessionId}`;
              active = pathname.startsWith("/session") && status !== 'IDLE' && status !== 'FAILED' && status !== 'SUCCESS';
            } else if (!isSesiBaru) {
              active = pathname === item.href;
            }

            const buttonStyle = `
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group text-left border border-transparent
              ${
                active
                  ? "bg-violet-pale text-violet-light border border-violet/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-glass-hover"
              }
            `;

            const iconSpan = (
              <span className={active ? "text-violet" : "text-text-muted group-hover:text-text-secondary transition-colors"}>
                {item.icon}
              </span>
            );

            if (isSesiBaru) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    close();
                    handleCreateSession();
                  }}
                  className={buttonStyle}
                >
                  {iconSpan}
                  {item.label}
                </button>
              );
            }

            if (isChamber) {
              const hasActiveSession = status !== 'IDLE' && status !== 'FAILED' && status !== 'SUCCESS';
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    close();
                    handleStudyChamberClick();
                  }}
                  className={`${buttonStyle} ${!hasActiveSession ? 'opacity-50 hover:bg-transparent hover:text-text-secondary cursor-not-allowed' : ''}`}
                >
                  {iconSpan}
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={targetHref}
                onClick={close}
                className={buttonStyle}
              >
                {iconSpan}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-glass-border shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-violet/50 flex items-center justify-center text-white text-xs font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">Pengguna Aktif</p>
              <p className="text-xs text-text-muted truncate">{userEmail}</p>
            </div>
            <button
              aria-label="Logout"
              onClick={handleLogout}
              title="Keluar"
              className="text-text-muted hover:text-crimson transition-colors p-1 rounded-lg hover:bg-glass-hover"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4" />
                <polyline points="10 15 15 10 10 5" />
                <line x1="1" y1="10" x2="15" y2="10" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
