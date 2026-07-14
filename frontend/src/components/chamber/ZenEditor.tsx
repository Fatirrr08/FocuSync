"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSessionStore } from "@/lib/state/sessionStore";
import { saveSessionNotes, fetchSessionNotes } from "@/lib/supabase/notes";

interface MarkedLib {
  parse: (text: string) => string;
}

function loadMarked(): Promise<MarkedLib> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { marked?: MarkedLib };
    if (w.marked) { resolve(w.marked); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    script.onload = () => {
      if (w.marked) resolve(w.marked);
      else reject(new Error("marked not found"));
    };
    script.onerror = () => reject(new Error("Failed to load marked"));
    document.head.appendChild(script);
  });
}

export default function ZenEditor() {
  const sessionId = useSessionStore((s) => s.sessionId);
  const zenMode = useSessionStore((s) => s.zenMode);
  const toggleZenMode = useSessionStore((s) => s.toggleZenMode);

  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [saved, setSaved] = useState(true);
  const [markedReady, setMarkedReady] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLengthRef = useRef(0);

  const storageKey = `zen_editor_${sessionId}`;

  // Load notes on mount from Supabase with LocalStorage fallback
  useEffect(() => {
    let active = true;
    const loadContent = async () => {
      if (!sessionId) return;
      try {
        const dbContent = await fetchSessionNotes(sessionId);
        if (active) {
          if (dbContent) {
            setContent(dbContent);
          } else {
            const savedContent = localStorage.getItem(storageKey);
            if (savedContent) {
              setContent(savedContent);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load notes content:", err);
      }
    };

    loadContent();

    return () => {
      active = false;
    };
  }, [storageKey, sessionId]);

  useEffect(() => {
    if (zenMode) {
      document.body.classList.add("zen-active");
    } else {
      document.body.classList.remove("zen-active");
    }
    return () => {
      document.body.classList.remove("zen-active");
    };
  }, [zenMode]);

  useEffect(() => {
    loadMarked()
      .then(() => setMarkedReady(true))
      .catch(() => {});
  }, []);

  const doSave = useCallback(
    async (text: string) => {
      localStorage.setItem(storageKey, text);
      if (sessionId) {
        await saveSessionNotes(sessionId, text);
      }
      setSaved(true);
    },
    [storageKey, sessionId]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setContent(text);
      setSaved(false);

      const lenDiff = Math.abs(text.length - lastLengthRef.current);
      lastLengthRef.current = text.length;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      if (lenDiff >= 200) {
        doSave(text);
      } else {
        saveTimerRef.current = setTimeout(() => {
          doSave(text);
        }, 5000);
      }
    },
    [doSave]
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!saved) {
        localStorage.setItem(storageKey, content);
        if (sessionId) {
          saveSessionNotes(sessionId, content);
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saved, content, storageKey, sessionId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const togglePreview = useCallback(async () => {
    if (!preview) {
      if (markedReady) {
        const marked = (window as unknown as { marked?: MarkedLib }).marked!;
        const html = marked.parse(content) as string;
        setPreviewHtml(html);
      }
      setPreview(true);
    } else {
      setPreview(false);
    }
  }, [preview, content, markedReady]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-text-primary font-display font-bold text-base">Zen Markdown Editor</h3>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                saved ? "bg-emerald shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-amber shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              }`}
            />
            <span className="text-text-muted text-xs">{saved ? "Tersimpan" : "Menyimpan..."}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {markedReady && (
            <button
              onClick={togglePreview}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                preview
                  ? "bg-violet-pale border border-violet/30 text-violet-light"
                  : "bg-glass border border-glass-border text-text-secondary hover:bg-glass-hover"
              }`}
            >
              {preview ? "Edit" : "Preview"}
            </button>
          )}
          <button
            onClick={toggleZenMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              zenMode
                ? "bg-violet-pale border border-violet/30 text-violet-light"
                : "bg-glass border border-glass-border text-text-secondary hover:bg-glass-hover"
            }`}
          >
            {zenMode ? "Exit Zen" : "Zen Mode"}
          </button>
        </div>
      </div>

      {preview ? (
        <div
          className="flex-1 bg-deeper border border-glass-border rounded-xl p-4 overflow-y-auto text-text-primary text-sm prose prose-invert max-w-none font-body"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Tulis catatan atau markdown di sini..."
          className="flex-1 bg-deeper border border-glass-border rounded-xl p-4 text-text-primary text-sm placeholder-text-muted resize-none outline-none focus:border-violet/50 focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-300 font-mono leading-relaxed"
        />
      )}
    </div>
  );
}
