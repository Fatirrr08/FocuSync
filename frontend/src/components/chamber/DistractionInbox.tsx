import React, { useState, useEffect, useCallback, useRef } from "react";

interface DistractionInboxProps {
  sessionId: string;
}

export default function DistractionInbox({ sessionId }: DistractionInboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Programmatic focus on open for robust Fullscreen support
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSave = useCallback(() => {
    if (!content.trim()) return;
    const key = `distraction_inbox_${sessionId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ id: Date.now(), content: content.trim(), created_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));
    setContent("");
    setIsOpen(false);

    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, [content, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-[100] pointer-events-none animate-toast-in">
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald/40 bg-emerald-pale backdrop-blur-lg text-emerald-light font-medium text-sm shadow-[0_0_30px_rgba(16,185,129,0.2)] min-w-[280px] max-w-[400px]">
            <span>💭 Pikiran dicatat, fokus kembali!</span>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="bg-glass border border-glass-border rounded-2xl p-6 shadow-glass backdrop-blur-xl w-full max-w-lg transition-all duration-300 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Catat Distraksi
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-glass-hover"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            <p className="text-text-muted text-xs mb-3">
              Catat pikiran yang mengganggu. Catatan akan terkunci sampai sesi berakhir.
            </p>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Apa yang mengganggu fokusmu?"
              className="w-full h-28 bg-deeper border border-glass-border rounded-xl p-4 text-text-primary text-sm placeholder-text-muted resize-none outline-none focus:border-violet/50 focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-300 font-mono"
            />

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-text-secondary text-sm font-medium hover:bg-glass-hover transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet to-purple-700 text-white text-sm font-medium shadow-glow-v hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
