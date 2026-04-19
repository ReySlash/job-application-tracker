-- Fresh install schema for private, authenticated job application data.
-- This app uses Supabase Auth and Row Level Security for per-user records.

create extension if not exists pgcrypto with schema extensions;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'applied'
    check (status in ('applied', 'interview', 'offer', 'rejected')),
  applied_at date not null,
  location text not null,
  job_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_idx
on public.applications (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_applications_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

alter table public.applications enable row level security;

create policy "Allow users to read own applications"
on public.applications
for select
to authenticated
using (auth.uid() = user_id);

create policy "Allow users to insert own applications"
on public.applications
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Allow users to update own applications"
on public.applications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Allow users to delete own applications"
on public.applications
for delete
to authenticated
using (auth.uid() = user_id);
