-- Enable UUID extension (optional, good practice)
create extension if not exists "uuid-ossp";

-- 1. Table: notes
-- Stores the note objects. 'id' matches the local UUID.
create table public.notes (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Table: app_data
-- Stores Key-Value pairs for Profile, Settings, etc.
create table public.app_data (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- 3. Row Level Security (RLS)
-- Enable RLS to prepare for future Auth integration
alter table public.notes enable row level security;
alter table public.app_data enable row level security;

-- 4. Access Policies (Open Access for Prototype)
-- WARNING: These policies allow ANYONE with your Anon Key to read/write/delete data.
-- TODO: Update these when you implement Supabase Auth (e.g., using auth.uid()).
-- [SECURITY NOTE] For production, you MUST restrict these policies to authenticated users or specific IDs.
-- Current "Open Access" is for prototyping/personal use only where Anon Key is kept secret (which is hard in client-side apps).

create policy "Public Access to Notes"
on public.notes
for all
using (true)
with check (true);

create policy "Public Access to App Data"
on public.app_data
for all
using (true)
with check (true);

-- 5. Realtime Subscription (Optional)
-- Allows clients to listen to changes
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.app_data;
