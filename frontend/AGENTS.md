# FocuSync — AGENTS.md

> Source of truth: [PRD-FocuSync (v2.0)](../PRD-FocuSync%20(1).md) — every decision must trace back to it.
> Task roadmap: [TaskList-FocuSync (14 Hari)](../TaskList-FocuSync.md)

---

## Project Identity

**Slogan:** Lock Your Screen, Lock Your Phone, Unlock Your Potential.
**Target:** MVP untuk lomba — web-based, non-AI, real-time cross-device focus ecosystem.
**Stack:** Next.js 14 App Router + TypeScript + Tailwind CSS + Zustand + Supabase (Auth, Postgres, Realtime).

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

**Frontend only (MVP constraint):**
- BroadcastChannel API untuk cross-tab sync
- localStorage untuk data persistence (fallback)
- Supabase hanya dipakai bila env vars tersedia

---

## Design System

### Colors (tailwind.config.ts)
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

### Radius
- sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px

### Glassmorphism
```css
.glass {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
```

---

## Folder Structure

```
src/
├─ app/
│  ├─ (auth)/login/         # Halaman login
│  ├─ (auth)/register/      # Halaman register
│  ├─ dashboard/            # Dashboard utama
│  ├─ session/[sessionId]/  # Chamber UI (desktop, sesi fokus)
│  ├─ anchor/[sessionToken]/# Device Anchor (mobile, sensor HP)
│  ├─ settings/allowlist/   # Allow-list CRUD
│  ├─ distraction-review/   # Review catatan distraksi pasca-sesi
│  ├─ api/auth/             # Route handler auth callback
│  ├─ globals.css           # Global styles + glass utilities
│  ├─ layout.tsx            # Root layout (ToastProvider, scene-bg)
│  └─ page.tsx              # Landing page
├─ components/
│  ├─ ui/                   # Button, Card, Badge, Modal, Toast, Toggle, Sidebar, PageTransition
│  ├─ chamber/              # StrikeEngine, TaskChunker, PDFViewer, ZenEditor, DistractionInbox, WarningOverlay
│  ├─ dashboard/            # StatsGrid, ContributionHeatmap, SessionHistory
│  ├─ anchor/               # AnchorStatus
│  ├─ allowlist/            # AllowlistTable, AllowlistForm
│  ├─ editor/               # (cadangan)
│  └─ heatmap/              # (cadangan)
├─ lib/
│  ├─ state/                # sessionStore.ts, allowlistStore.ts (Zustand)
│  ├─ sensors/              # orientation.ts, lightSensor.ts (hooks)
│  └─ supabase/             # client.ts (Supabase client)
├─ types/
│  └─ index.ts              # Semua interface (User, Session, TaskChunk, AllowlistItem, dll)
└─ hooks/                   # (kosong, siap digunakan)
```

---

## Session State Machine

```
IDLE → PAIRING → READY → FOCUSING → STRIKE_WARN → SUCCESS
                                |             |
                                +-------------+→ FAILED
```

| Transition | Trigger |
|---|---|
| IDLE → PAIRING | Buka halaman sesi baru, `session_token` dibuat |
| PAIRING → READY | Device Anchor subscribe ke channel yang sama |
| READY → FOCUSING | Klik "Mulai Sesi" + HP dalam posisi ANCHORED |
| FOCUSING → STRIKE_WARN | Pelanggaran ke-1 atau ke-2 |
| STRIKE_WARN → FOCUSING | Kembali fokus tanpa pelanggaran baru > 10 detik |
| STRIKE_WARN → FAILED | Pelanggaran ke-3 |
| FOCUSING/STRIKE_WARN → SUCCESS | Klik "Selesaikan Sesi" |

---

## Realtime Events (Supabase Broadcast)

| Event | Sender | Receiver | Payload |
|---|---|---|---|
| `MOBILE_JOINED` | Device Anchor | Chamber UI | `{ role: 'mobile' }` |
| `SESSION_FOCUSING` | Chamber UI | Device Anchor | `{ status: 'FOCUSING' }` |
| `ANCHORED` | Device Anchor | Chamber UI | `{ orientation: {...} }` |
| `PHONE_LIFTED` | Device Anchor | Chamber UI | `{ timestamp }` |
| `STRIKE_UPDATE` | Chamber UI | Device Anchor | `{ strike_count }` |
| `SESSION_ENDED` | Chamber UI | Device Anchor | `{ status: 'SUCCESS'\|'FAILED' }` |

---

## Current Development State

### Completed (Build ✓)
- [x] Next.js 14 init + TypeScript + Tailwind + ESLint
- [x] Tailwind design system (colors, fonts, animations, shadows)
- [x] Types definitions (`types/index.ts`)
- [x] Zustand stores (`sessionStore`, `allowlistStore`)
- [x] Sensor hooks (`orientation.ts`, `lightSensor.ts`)
- [x] Supabase client (`lib/supabase/client.ts`)
- [x] UI components (Button, Card, Badge, Modal, Toast, Toggle, Sidebar, PageTransition)
- [x] Chamber components (StrikeEngine, TaskChunker, PDFViewer, ZenEditor, DistractionInbox, WarningOverlay)
- [x] Dashboard components (StatsGrid, ContributionHeatmap, SessionHistory)
- [x] Anchor component (AnchorStatus)
- [x] Allowlist components (AllowlistTable, AllowlistForm)
- [x] All 9 pages: landing, login, register, dashboard, chamber, anchor, allowlist, distraction-review
- [x] Build lulus (zero type/ESLint errors)

### Pending (dari TaskList)
- [ ] Supabase Auth integration (login/register need env vars)
- [ ] Real Supabase Realtime (BroadcastChannel API sebagai fallback)
- [ ] `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Seed default allowlist for new users
- [ ] Vercel deployment

---

## Key Architectural Decisions

1. **Frontend-only MVP**: Supabase calls are wrapped; if env vars missing, use BroadcastChannel API + localStorage as fallback
2. **CDN-loaded libraries**: PDF.js and `marked` loaded via CDN scripts (not bundled), typed via inline interfaces
3. **QR codes**: `qrcode.react` generates QR with URL `/anchor/{sessionToken}`
4. **Sensor fallback chain**: `DeviceOrientationEvent` → `AmbientLightSensor` → Manual Anchor (button tap on HP)
5. **No AI**: All logic is event-driven state machine
6. **No Electron/Tauri companion**: App detection relies on browser API + self-report

---

## Routing Conventions

| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Landing page (Hero, Features, CTA) |
| `/login` | `(auth)/login/page.tsx` | Login form |
| `/register` | `(auth)/register/page.tsx` | Register form |
| `/dashboard` | `dashboard/page.tsx` | User dashboard (stats, heatmap, history) |
| `/session/[sessionId]` | `session/[sessionId]/page.tsx` | Chamber UI (sesi fokus) |
| `/anchor/[sessionToken]` | `anchor/[sessionToken]/page.tsx` | Device Anchor (sensor HP) |
| `/settings/allowlist` | `settings/allowlist/page.tsx` | Allow-list management |
| `/distraction-review` | `distraction-review/page.tsx` | Pasca-sesi review catatan |

---

## Naming & Code Conventions

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` with `use` prefix
- Stores: `camelCaseStore.ts` (Zustand)
- Types: PascalCase interfaces in `types/index.ts`
- CSS: Tailwind utility classes; global utilities in `globals.css`
- Path aliases: `@/` maps to `src/`
- All components are `"use client"` (no server components yet)
- No JSDoc comments — code is self-documenting

---

## Import Patterns

```typescript
// UI components
import Button from '@/components/ui/Button';

// Zustand store
import { useSessionStore } from '@/lib/state/sessionStore';

// Types
import type { Session, TaskChunk } from '@/types';

// Sensors
import { useOrientationSensor } from '@/lib/sensors/orientation';
```

---

## Build & Lint

```bash
npm run dev      # Development server
npm run build    # Production build + type/lint check
npm run lint     # ESLint check
```

**Build must pass before any commit.** Current config: `next/core-web-vitals` + `next/typescript`.
