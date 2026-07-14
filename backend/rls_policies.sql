-- =========================================================================
-- FocuSync Row-Level Security (RLS) Policies
-- Target: Supabase PostgreSQL
-- =========================================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table sessions enable row level security;
alter table distraction_notes enable row level security;
alter table tasks enable row level security;
alter table focus_allowlist enable row level security;
alter table allowlist_violations enable row level security;
alter table notes enable row level security;
alter table heatmap_logs enable row level security;

-- =========================================================================
-- 1. Users Table Policies
-- =========================================================================
create policy "Users can read their own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =========================================================================
-- 2. Sessions Table Policies
-- =========================================================================
create policy "Users can read their own sessions"
  on sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================================
-- 3. Distraction Notes Table Policies (Via Session Joins)
-- =========================================================================
create policy "Users can read distraction notes from their own sessions"
  on distraction_notes for select
  using (
    exists (
      select 1 from sessions
      where sessions.id = distraction_notes.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert distraction notes to their own sessions"
  on distraction_notes for insert
  with check (
    exists (
      select 1 from sessions
      where sessions.id = distraction_notes.session_id
      and sessions.user_id = auth.uid()
    )
  );

-- =========================================================================
-- 4. Tasks Table Policies (Via Session Joins)
-- =========================================================================
create policy "Users can read tasks from their own sessions"
  on tasks for select
  using (
    exists (
      select 1 from sessions
      where sessions.id = tasks.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can create tasks in their own sessions"
  on tasks for insert
  with check (
    exists (
      select 1 from sessions
      where sessions.id = tasks.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can update tasks in their own sessions"
  on tasks for update
  using (
    exists (
      select 1 from sessions
      where sessions.id = tasks.session_id
      and sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from sessions
      where sessions.id = tasks.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete tasks from their own sessions"
  on tasks for delete
  using (
    exists (
      select 1 from sessions
      where sessions.id = tasks.session_id
      and sessions.user_id = auth.uid()
    )
  );

-- =========================================================================
-- 5. Focus Allowlist Table Policies
-- =========================================================================
create policy "Users can read their own allowlist items"
  on focus_allowlist for select
  using (auth.uid() = user_id);

create policy "Users can create their own allowlist items"
  on focus_allowlist for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own allowlist items"
  on focus_allowlist for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own allowlist items"
  on focus_allowlist for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- 6. Allowlist Violations Table Policies (Via Session Joins)
-- =========================================================================
create policy "Users can read violations from their own sessions"
  on allowlist_violations for select
  using (
    exists (
      select 1 from sessions
      where sessions.id = allowlist_violations.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can log violations in their own sessions"
  on allowlist_violations for insert
  with check (
    exists (
      select 1 from sessions
      where sessions.id = allowlist_violations.session_id
      and sessions.user_id = auth.uid()
    )
  );

-- =========================================================================
-- 7. Notes Table Policies (Via Session Joins)
-- =========================================================================
create policy "Users can read notes from their own sessions"
  on notes for select
  using (
    exists (
      select 1 from sessions
      where sessions.id = notes.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert/update notes in their own sessions"
  on notes for insert
  with check (
    exists (
      select 1 from sessions
      where sessions.id = notes.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can update notes in their own sessions"
  on notes for update
  using (
    exists (
      select 1 from sessions
      where sessions.id = notes.session_id
      and sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from sessions
      where sessions.id = notes.session_id
      and sessions.user_id = auth.uid()
    )
  );

-- =========================================================================
-- 8. Heatmap Logs Table Policies
-- =========================================================================
create policy "Users can read their own heatmap logs"
  on heatmap_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own heatmap logs"
  on heatmap_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own heatmap logs"
  on heatmap_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);