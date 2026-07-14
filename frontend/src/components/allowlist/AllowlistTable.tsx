"use client";

import React from "react";
import type { AllowlistItem } from "@/types";
import Toggle from "@/components/ui/Toggle";

interface AllowlistTableProps {
  items: AllowlistItem[];
  onToggle: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

const typeBadge: Record<string, string> = {
  website: "bg-violet-pale text-violet-light border-violet/30",
  app: "bg-emerald-pale text-emerald-light border-emerald/30",
};

export default function AllowlistTable({ items, onToggle, onDelete }: AllowlistTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-glass border border-glass-border rounded-xl p-10 shadow-glass backdrop-blur-md">
        <div className="flex flex-col items-center justify-center text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(241,245,249,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <p className="text-text-primary text-sm font-medium">Tidak ada item ditemukan</p>
          <p className="text-text-muted text-xs mt-1">Tambahkan item baru untuk mulai mengelola allowlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-glass border border-glass-border rounded-xl shadow-glass backdrop-blur-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="text-left text-text-muted text-[10px] uppercase tracking-wider font-semibold px-5 py-3">Item</th>
              <th className="text-left text-text-muted text-[10px] uppercase tracking-wider font-semibold px-5 py-3">Tipe</th>
              <th className="text-center text-text-muted text-[10px] uppercase tracking-wider font-semibold px-5 py-3">Akses</th>
              <th className="text-left text-text-muted text-[10px] uppercase tracking-wider font-semibold px-5 py-3">Status</th>
              <th className="text-right text-text-muted text-[10px] uppercase tracking-wider font-semibold px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-glass-border last:border-b-0 hover:bg-glass-hover transition-colors duration-150"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${item.type === "website" ? "bg-violet-pale" : "bg-emerald-pale"}`}>
                      {item.type === "website" ? "🌐" : "📱"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary text-sm font-medium">{item.name}</span>
                        {item.isDefault && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-glass border border-glass-border text-text-muted">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeBadge[item.type] || typeBadge.website}`}>
                    {item.type === "website" ? "Website" : "Aplikasi"}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <Toggle checked={item.allowed} onChange={() => onToggle(item.id)} />
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium ${item.allowed ? "text-emerald-light" : "text-crimson-light"}`}>
                    {item.allowed ? "Diizinkan" : "Diblokir"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 rounded-lg text-text-muted hover:text-crimson-light hover:bg-crimson-pale transition-all duration-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
