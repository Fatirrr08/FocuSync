# FocuSync — AGENTS.md

> Source of truth: [PRD-FocuSync (v2.0)](PRD-FocuSync%20(1).md) — every decision must trace back to it.
> Task roadmap: [TaskList-FocuSync (14 Hari)](TaskList-FocuSync.md)

---

## Project Identity

**Slogan:** Lock Your Screen, Lock Your Phone, Unlock Your Potential.
**Target:** MVP untuk lomba — web-based, non-AI, real-time cross-device focus ecosystem.
**Stack:** Next.js 14 App Router + TypeScript + Tailwind CSS + Zustand + Supabase (Auth, Postgres, Realtime).
**Kode sumber aktif:** `/frontend/` — Next.js project (build verified ✅).

---

## Tech Stack & Constraints

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SPA + SSR, deploy Vercel 1-klik |
| Styling | Tailwind CSS + custom config | Dark mode design system, glassmorphism |
| State | Zustand | Ringan, cocok utk state machine sesi |
| Realtime | Supabase Realtime (Broadcast & Presence) | Gantikan WebSocket custom |
| Auth | Supabase Auth | Email/password, gratis |
| Database | Supabase Postgres + RLS | Skema relasional dari PRD |
| PDF | PDF.js (CDN, client-side) | Gratis, tanpa server |
| QR | qrcode.react | Generate QR di Chamber |
| Heatmap | SVG manual | Tanpa dependensi berat |

**Frontend only constraint:** BroadcastChannel API untuk cross-tab sync (fallback bila Supabase tidak aktif).

---

## Design System

### Colors (`tailwind.config.ts`)
```
deeper:    #060814  (background utama)
surface:   #0d1117  (card/surface)
elevated:  #111827  (elevated surface)
violet:    #7C3AED  (aksen utama)
emerald:   #10B981  (aksen sukses/fokus)
crimson:   #EF4444  (error/strike)
glass:     rgba(255,255,255,0.04) + backdrop-blur
text:      #F1F5F9  (primary), 65% (secondary), 35% (muted)
```

### Fonts
- Body: Inter (300–800)
- Display: Space Grotesk (heading)
- Mono: JetBrains Mono / Fira Code

---

## Session State Machine

```
IDLE → PAIRING → READY → FOCUSING → STRIKE_WARN → SUCCESS
                                |             |
                                +-------------+→ FAILED
```

## Realtime Events (Supabase Broadcast)

| Event | Sender | Receiver |
|---|---|---|
| `MOBILE_JOINED` | Device Anchor | Chamber UI |
| `SESSION_FOCUSING` | Chamber UI | Device Anchor |
| `ANCHORED` | Device Anchor | Chamber UI |
| `PHONE_LIFTED` | Device Anchor | Chamber UI |
| `STRIKE_UPDATE` | Chamber UI | Device Anchor |
| `SESSION_ENDED` | Chamber UI | Device Anchor |

---

## Current Development State (Hari 1 progress)

### Completed (build verified ✅)
- [x] Project init (Next.js 14 + TS + Tailwind + ESLint)
- [x] Tailwind design system
- [x] Types, Zustand stores, sensor hooks
- [x] All UI + feature components
- [x] All 9 pages (landing, login, register, dashboard, chamber, anchor, allowlist, distraction-review)
- [x] Build zero-error

### Pending (from TaskList)
- [ ] Supabase Auth integration (.env.local needed)
- [ ] Real Supabase Realtime channels
- [ ] Seed default allowlist for new users
- [ ] Vercel deployment
- [ ] Testing sensor di 2+ device fisik

---

## Routing (Next.js App Router)

| Route | File | Description |
|---|---|---|
| `/` | `frontend/src/app/page.tsx` | Landing page |
| `/login` | `(auth)/login/page.tsx` | Login |
| `/register` | `(auth)/register/page.tsx` | Register |
| `/dashboard` | `dashboard/page.tsx` | Dashboard |
| `/session/[sessionId]` | `session/[sessionId]/page.tsx` | Chamber UI |
| `/anchor/[sessionToken]` | `anchor/[sessionToken]/page.tsx` | Device Anchor |
| `/settings/allowlist` | `settings/allowlist/page.tsx` | Allow-list |
| `/distraction-review` | `distraction-review/page.tsx` | Review catatan |

---

## Build & Lint (dari `frontend/`)

```bash
npm run dev      # Development
npm run build    # Build + type/lint check (WAJIB lolos sebelum commit)
npm run lint     # ESLint
```

---

## Rules for AI Agents

1. **PRD adalah hukum tertinggi.** Bila ragu antara TaskList dan PRD, ikuti PRD.
2. **Jangan tambah library baru** tanpa konfirmasi. Stack sudah fixed: Next.js 14, Tailwind, Zustand, Supabase, qrcode.react, PDF.js (CDN).
3. **Semua komponen "use client"** — belum ada server components.
4. **Path alias `@/`** → `frontend/src/`.
5. **Build harus lolos** sebelum menyelesaikan task.
