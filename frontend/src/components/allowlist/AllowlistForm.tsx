"use client";

import React, { useState } from "react";

interface AllowlistFormProps {
  onAdd: (name: string, type: "website" | "app", allowed: boolean) => void;
}

export default function AllowlistForm({ onAdd }: AllowlistFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"website" | "app">("website");
  const [allowed, setAllowed] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nama item harus diisi");
      return;
    }
    if (type === "website" && /\s/.test(trimmed)) {
      setError("Nama website tidak boleh mengandung spasi");
      return;
    }

    onAdd(trimmed, type, allowed);
    setName("");
    setType("website");
    setAllowed(true);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md">
      <h3 className="text-text-primary font-display font-semibold text-sm mb-4">Tambah Item Baru</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="item-name" className="block text-text-secondary text-xs font-medium mb-1.5">
            Nama Item
          </label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder={type === "website" ? "example.com" : "Nama Aplikasi"}
            className="w-full px-4 py-2.5 rounded-lg bg-surface border border-glass-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet/50 transition-all duration-200"
          />
          {error && <p className="text-crimson-light text-xs mt-1.5">{error}</p>}
        </div>

        <div>
          <label htmlFor="item-type" className="block text-text-secondary text-xs font-medium mb-1.5">
            Tipe
          </label>
          <select
            id="item-type"
            value={type}
            onChange={(e) => setType(e.target.value as "website" | "app")}
            className="w-full px-4 py-2.5 rounded-lg bg-surface border border-glass-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet/50 transition-all duration-200 appearance-none"
          >
            <option value="website">Website</option>
            <option value="app">Aplikasi</option>
          </select>
        </div>

        <div>
          <label htmlFor="item-status" className="block text-text-secondary text-xs font-medium mb-1.5">
            Status
          </label>
          <select
            id="item-status"
            value={allowed ? "allowed" : "blocked"}
            onChange={(e) => setAllowed(e.target.value === "allowed")}
            className="w-full px-4 py-2.5 rounded-lg bg-surface border border-glass-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet/50 transition-all duration-200 appearance-none"
          >
            <option value="allowed">Diizinkan</option>
            <option value="blocked">Diblokir</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet to-purple-700 text-white font-semibold text-sm shadow-glow-v hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all duration-300 active:scale-[0.98]"
        >
          + Tambahkan
        </button>
      </div>
    </form>
  );
}
