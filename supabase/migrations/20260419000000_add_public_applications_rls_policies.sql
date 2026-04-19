-- Public demo CRUD policies for the applications table.
-- This keeps RLS enabled while allowing the anon API key to manage demo data.

alter table public.applications enable row level security;

drop policy if exists "Allow public read applications" on public.applications;
drop policy if exists "Allow public insert applications" on public.applications;
drop policy if exists "Allow public update applications" on public.applications;
drop policy if exists "Allow public delete applications" on public.applications;

create policy "Allow public read applications"
on public.applications
for select
to anon
using (true);

create policy "Allow public insert applications"
on public.applications
for insert
to anon
with check (true);

create policy "Allow public update applications"
on public.applications
for update
to anon
using (true)
with check (true);

create policy "Allow public delete applications"
on public.applications
for delete
to anon
using (true);
