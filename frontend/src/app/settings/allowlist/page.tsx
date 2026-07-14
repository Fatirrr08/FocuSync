'use client';

import { useEffect, useState } from 'react';
import Sidebar, { SidebarProvider, useSidebar } from '@/components/ui/Sidebar';
import AllowlistForm from '@/components/allowlist/AllowlistForm';
import AllowlistTable from '@/components/allowlist/AllowlistTable';
import { useAllowlistStore } from '@/lib/state/allowlistStore';
import { supabase } from '@/lib/supabase/client';

const PRESETS = {
  coding: [
    { name: "github.com", type: "website" as const, allowed: true },
    { name: "stackoverflow.com", type: "website" as const, allowed: true },
    { name: "chatgpt.com", type: "website" as const, allowed: true },
    { name: "localhost", type: "website" as const, allowed: true },
    { name: "Visual Studio Code", type: "app" as const, allowed: true },
  ],
  research: [
    { name: "scholar.google.com", type: "website" as const, allowed: true },
    { name: "arxiv.org", type: "website" as const, allowed: true },
    { name: "wikipedia.org", type: "website" as const, allowed: true },
    { name: "Zotero / Mendeley", type: "app" as const, allowed: true },
  ],
  writing: [
    { name: "notion.so", type: "website" as const, allowed: true },
    { name: "docs.google.com", type: "website" as const, allowed: true },
    { name: "canva.com", type: "website" as const, allowed: true },
    { name: "Notion Desktop", type: "app" as const, allowed: true },
  ]
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const { toggle } = useSidebar();

  return (
    <div className="min-h-screen">
      <Sidebar currentPage="Focus Allow-list" />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 h-16 border-b border-glass-border bg-deeper/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-all">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 5h14M3 10h14M3 15h10" /></svg>
            </button>
            <h1 className="text-text-primary font-display font-bold text-lg">Focus Allow-list</h1>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AllowlistInner() {
  const items = useAllowlistStore((s) => s.items);
  const activeTab = useAllowlistStore((s) => s.activeTab);
  const searchQuery = useAllowlistStore((s) => s.searchQuery);
  const setActiveTab = useAllowlistStore((s) => s.setActiveTab);
  const setSearchQuery = useAllowlistStore((s) => s.setSearchQuery);
  const toggleAllowed = useAllowlistStore((s) => s.toggleAllowed);
  const deleteItem = useAllowlistStore((s) => s.deleteItem);
  const addItem = useAllowlistStore((s) => s.addItem);
  const resetToDefault = useAllowlistStore((s) => s.resetToDefault);
  const loadFromStorage = useAllowlistStore((s) => s.loadFromStorage);
  const loadFromSupabase = useAllowlistStore((s) => s.loadFromSupabase);

  const [confirmReset, setConfirmReset] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUserAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadFromSupabase(user.id);
      } else {
        loadFromStorage();
      }
      setMounted(true);
    };
    fetchUserAndLoad();
  }, [loadFromSupabase, loadFromStorage]);

  const handleAddItem = (name: string, type: 'website' | 'app', allowed: boolean) => {
    addItem(name, type, allowed, userId);
  };

  const handleApplyPreset = (presetType: 'coding' | 'research' | 'writing') => {
    const itemsToInsert = PRESETS[presetType];
    itemsToInsert.forEach((item) => {
      const exists = items.some(i => i.name.toLowerCase() === item.name.toLowerCase() && i.type === item.type);
      if (!exists) {
        addItem(item.name, item.type, item.allowed, userId);
      }
    });
  };

  const handleResetToDefault = () => {
    resetToDefault(userId);
    setConfirmReset(false);
  };

  const filteredItems = items.filter((item) => {
    if (item.type !== activeTab) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const websiteCount = items.filter((i) => i.type === 'website').length;
  const appCount = items.filter((i) => i.type === 'app').length;

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary">Atur Allow-list</h2>
          <p className="text-text-secondary text-xs mt-1">Tentukan website & aplikasi yang boleh diakses selama sesi fokus.</p>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          className="px-4 py-2 rounded-xl bg-crimson-pale border border-crimson/30 text-crimson-light text-sm font-medium hover:bg-crimson/20 transition-all duration-200 active:scale-[0.97]"
        >
          Reset ke Default
        </button>
      </div>

      {confirmReset && (
        <div className="bg-crimson-pale border border-crimson/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up">
          <div>
            <p className="text-crimson-light text-sm font-medium">Reset semua item ke pengaturan default?</p>
            <p className="text-text-secondary text-xs mt-0.5">Aksi ini tidak bisa dibatalkan.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToDefault}
              className="px-4 py-2 rounded-xl bg-crimson text-white text-sm font-medium hover:bg-crimson/80 transition-all"
            >
              Ya, Reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-4 py-2 rounded-xl bg-glass border border-glass-border text-text-secondary text-sm font-medium hover:bg-glass-hover transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-1 bg-surface border border-glass-border rounded-xl p-1">
              <button
                onClick={() => setActiveTab('website')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'website' ? 'bg-glass text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Website
                <span className="ml-1.5 text-xs text-text-muted">({websiteCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('app')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'app' ? 'bg-glass text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Aplikasi
                <span className="ml-1.5 text-xs text-text-muted">({appCount})</span>
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(241,245,249,0.35)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari item..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-glass-border text-text-primary text-sm placeholder-text-muted outline-none focus:border-violet/50 transition-all duration-200"
              />
            </div>
          </div>

          <AllowlistTable items={filteredItems} onToggle={toggleAllowed} onDelete={deleteItem} />
        </div>

        <div className="space-y-6">
          <AllowlistForm onAdd={handleAddItem} />

          <div className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md">
            <h3 className="text-text-primary font-display font-semibold text-sm mb-3">⚡ Quick Presets</h3>
            <p className="text-text-muted text-[10px] leading-relaxed mb-4">Tambahkan sekumpulan website & aplikasi penunjang fokus untuk jenis aktivitas belajar tertentu secara otomatis.</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleApplyPreset('coding')}
                className="w-full px-4 py-2.5 rounded-lg border border-violet/20 bg-violet-pale/10 hover:bg-violet-pale/25 text-violet-light text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span>💻 Coding Mode Preset</span>
                <span className="text-[10px] opacity-75">GitHub, VSCode...</span>
              </button>
              <button
                onClick={() => handleApplyPreset('research')}
                className="w-full px-4 py-2.5 rounded-lg border border-emerald/20 bg-emerald-pale/10 hover:bg-emerald-pale/25 text-emerald-light text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span>📚 Research Mode Preset</span>
                <span className="text-[10px] opacity-75">Scholar, Zotero...</span>
              </button>
              <button
                onClick={() => handleApplyPreset('writing')}
                className="w-full px-4 py-2.5 rounded-lg border border-amber/20 bg-amber-pale/10 hover:bg-amber-pale/25 text-amber text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span>✍️ Writing Mode Preset</span>
                <span className="text-[10px] opacity-75">Notion, Docs...</span>
              </button>
            </div>
          </div>

          <div className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md">
            <h3 className="text-text-primary font-display font-semibold text-sm mb-3">Info</h3>
            <div className="space-y-2 text-text-secondary text-xs leading-relaxed">
              <p>Item <strong className="text-text-primary">Default</strong> adalah preset bawaan FocuSync yang direkomendasikan untuk sesi fokus yang optimal.</p>
              <p>Kamu bisa mengubah akses setiap item kapan saja menggunakan toggle.</p>
              <p>Item yang <strong className="text-crimson-light">Diblokir</strong> tidak akan bisa diakses selama sesi fokus berlangsung.</p>
              <p className="text-text-muted pt-2">* Perubahan membutuhkan sesi baru untuk diterapkan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AllowlistPage() {
  return (
    <SidebarProvider>
      <AppLayout>
        <AllowlistInner />
      </AppLayout>
    </SidebarProvider>
  );
}
