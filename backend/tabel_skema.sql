-- =========================================================================
-- FocuSync Database Schema — DDL & Indexes
-- Target: Supabase PostgreSQL
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Public Users Table (Linked to Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);

-- 2. Sessions Table (Focus session state machine tracking)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_token uuid unique not null default gen_random_uuid(),
  status text not null default 'IDLE'
    check (status in ('IDLE','PAIRING','READY','FOCUSING','STRIKE_WARN','SUCCESS','FAILED')),
  strike_count int not null default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- 3. Distraction Notes Table (Logs self-reported distraction text)
create table distraction_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  unlocked_at timestamptz
);

-- 4. Tasks Table (Task chunk manager)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  title text not null,
  planned_duration_minutes int not null default 15,
  actual_duration_minutes int,
  is_done boolean default false,
  points_awarded int default 0,
  created_at timestamptz default now()
);

-- 5. Focus Allowlist Table (Allowed apps & domains configuration)
create table focus_allowlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null check (type in ('app','website')),
  name text not null,
  is_allowed boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz default now()
);

-- 6. Allowlist Violations Table (Unallowed app/website opening logs)
create table allowlist_violations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  detected_name text,
  type text check (type in ('app','website')),
  is_self_reported boolean default false,
  created_at timestamptz default now()
);

-- 7. Notes Table (Autosaved Zen editor documents)
create table notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  content_markdown text,
  updated_at timestamptz default now()
);

-- 8. Heatmap Logs Table (Daily accumulated statistics)
create table heatmap_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  log_date date not null,
  sessions_success int not null default 0,
  sessions_failed int not null default 0,
  total_points int not null default 0,
  unique (user_id, log_date)
);

-- =========================================================================
-- Relational Query Index Optimization
-- =========================================================================

-- Indexing foreign keys for rapid join lookups
create index idx_sessions_user_id on sessions(user_id);
create index idx_sessions_session_token on sessions(session_token);
create index idx_distraction_notes_session_id on distraction_notes(session_id);
create index idx_tasks_session_id on tasks(session_id);
create index idx_focus_allowlist_user_id on focus_allowlist(user_id);
create index idx_allowlist_violations_session_id on allowlist_violations(session_id);
create index idx_notes_session_id on notes(session_id);

-- Composite index for fast contribution dashboard rendering
create index idx_heatmap_logs_user_date on heatmap_logs(user_id, log_date);