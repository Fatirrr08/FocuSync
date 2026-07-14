import { create } from "zustand";
import type { AllowlistItem } from "@/types";
import {
  fetchAllowlist,
  addAllowlistItem,
  deleteAllowlistItem,
  toggleAllowlistItem,
  resetAllowlistToDefault
} from "@/lib/supabase/allowlist";

const DEFAULT_ALLOWLIST: AllowlistItem[] = [
  { id: 1, type: "website", name: "github.com", allowed: true, isDefault: true },
  { id: 2, type: "website", name: "docs.google.com", allowed: true, isDefault: true },
  { id: 3, type: "website", name: "scholar.google.com", allowed: true, isDefault: true },
  { id: 4, type: "website", name: "developer.mozilla.org", allowed: true, isDefault: true },
  { id: 5, type: "website", name: "notion.so", allowed: true, isDefault: true },
  { id: 6, type: "website", name: "youtube.com", allowed: false, isDefault: true },
  { id: 7, type: "website", name: "instagram.com", allowed: false, isDefault: true },
  { id: 8, type: "website", name: "tiktok.com", allowed: false, isDefault: true },
  { id: 9, type: "website", name: "twitter.com / x.com", allowed: false, isDefault: true },
  { id: 10, type: "app", name: "Visual Studio Code", allowed: true, isDefault: true },
  { id: 11, type: "app", name: "Notion Desktop", allowed: true, isDefault: true },
  { id: 12, type: "app", name: "Zotero / Mendeley", allowed: true, isDefault: true },
  { id: 13, type: "app", name: "Game launcher (Steam)", allowed: false, isDefault: true },
  { id: 14, type: "app", name: "App chat non-esensial", allowed: false, isDefault: true },
];

interface AllowlistState {
  items: AllowlistItem[];
  activeTab: "website" | "app";
  searchQuery: string;
  setActiveTab: (tab: "website" | "app") => void;
  setSearchQuery: (q: string) => void;
  toggleAllowed: (id: string | number) => void;
  deleteItem: (id: string | number) => void;
  addItem: (name: string, type: "website" | "app", allowed: boolean, userId?: string) => void;
  resetToDefault: (userId?: string) => void;
  loadFromStorage: () => void;
  loadFromSupabase: (userId: string) => Promise<void>;
}

export const useAllowlistStore = create<AllowlistState>((set) => ({
  items: [],
  activeTab: "website",
  searchQuery: "",
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleAllowed: (id) => set((s) => {
    const updated = s.items.map(i => {
      if (i.id === id) {
        // Trigger async Supabase write
        toggleAllowlistItem(id, !i.allowed);
        return { ...i, allowed: !i.allowed };
      }
      return i;
    });
    // Save to local storage as fallback
    localStorage.setItem("focusync_allowlist", JSON.stringify(updated));
    return { items: updated };
  }),
  deleteItem: (id) => set((s) => {
    // Trigger async Supabase write
    deleteAllowlistItem(id);
    const updated = s.items.filter(i => i.id !== id);
    localStorage.setItem("focusync_allowlist", JSON.stringify(updated));
    return { items: updated };
  }),
  addItem: (name, type, allowed, userId) => {
    if (userId) {
      addAllowlistItem(userId, name, type, allowed).then(() => {
        fetchAllowlist(userId).then(items => {
          set({ items });
          localStorage.setItem("focusync_allowlist", JSON.stringify(items));
        });
      });
    } else {
      set((s) => {
        const nextId = s.items.length > 0 ? Math.max(...s.items.map(i => typeof i.id === "number" ? i.id : 0), 0) + 1 : 1;
        const updated = [...s.items, { id: nextId, type, name, allowed, isDefault: false }];
        localStorage.setItem("focusync_allowlist", JSON.stringify(updated));
        return { items: updated };
      });
    }
  },
  resetToDefault: (userId) => {
    if (userId) {
      resetAllowlistToDefault(userId).then(() => {
        fetchAllowlist(userId).then(items => {
          set({ items });
          localStorage.setItem("focusync_allowlist", JSON.stringify(items));
        });
      });
    } else {
      const updated = DEFAULT_ALLOWLIST.map(i => ({ ...i }));
      localStorage.setItem("focusync_allowlist", JSON.stringify(updated));
      set({ items: updated });
    }
  },
  loadFromStorage: () => {
    const saved = localStorage.getItem("focusync_allowlist");
    if (saved) {
      try { set({ items: JSON.parse(saved) }); return; } catch {}
    }
    set({ items: DEFAULT_ALLOWLIST.map(i => ({ ...i })) });
  },
  loadFromSupabase: async (userId) => {
    const items = await fetchAllowlist(userId);
    if (items && items.length > 0) {
      set({ items });
      localStorage.setItem("focusync_allowlist", JSON.stringify(items));
    } else {
      // Seeding occurs in AuthGuard, but fallback just in case
      set({ items: DEFAULT_ALLOWLIST.map(i => ({ ...i })) });
    }
  },
}));
