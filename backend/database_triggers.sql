-- =========================================================================
-- FocuSync Database Triggers — Automated Sign-up Seeding
-- Target: Supabase PostgreSQL (auth.users events)
-- =========================================================================

-- Clean up existing triggers and functions if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop trigger if exists on_public_user_created_seed_allowlist on public.users;
drop function if exists public.seed_default_allowlist();

-- =========================================================================
-- 1. Trigger Function to Create Public User Profile
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, created_at)
  values (
    new.id, 
    new.email, 
    coalesce(
      new.raw_user_meta_data->>'display_name', 
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1)
    ), 
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- 2. Trigger Function to Seed Default Focus Allowlist
-- =========================================================================
create or replace function public.seed_default_allowlist()
returns trigger as $$
begin
  insert into public.focus_allowlist (user_id, type, name, is_allowed, is_default, created_at)
  values
    -- Allowed Resources
    (new.id, 'website', 'github.com', true, true, now()),
    (new.id, 'website', 'docs.google.com', true, true, now()),
    (new.id, 'website', 'notion.so', true, true, now()),
    (new.id, 'app', 'Visual Studio Code', true, true, now()),
    
    -- Blocked / Distracting Resources
    (new.id, 'website', 'youtube.com', false, true, now()),
    (new.id, 'website', 'instagram.com', false, true, now()),
    (new.id, 'website', 'tiktok.com', false, true, now());
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to public.users table (ensures foreign key constraints are met)
create trigger on_public_user_created_seed_allowlist
  after insert on public.users
  for each row execute procedure public.seed_default_allowlist();