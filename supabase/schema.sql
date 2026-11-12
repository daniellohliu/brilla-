-- Brilla: base de datos para perfiles y diseños privados.
-- Ejecuta este archivo en Supabase > SQL Editor después de crear el proyecto.

create table if not exists public.designs (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Diseño sin título',
  document jsonb not null default '{}'::jsonb,
  favorite boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists designs_owner_updated_idx
  on public.designs (owner_id, updated_at desc);

alter table public.designs enable row level security;
revoke all on public.designs from anon;
grant select, insert, update, delete on public.designs to authenticated;

drop policy if exists "Users can read own designs" on public.designs;
create policy "Users can read own designs"
  on public.designs for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Users can create own designs" on public.designs;
create policy "Users can create own designs"
  on public.designs for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can update own designs" on public.designs;
create policy "Users can update own designs"
  on public.designs for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can delete own designs" on public.designs;
create policy "Users can delete own designs"
  on public.designs for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- Archivos de imagen en un bucket privado; cada persona usa su carpeta de UID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'design-assets',
  'design-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own design assets" on storage.objects;
create policy "Users can read own design assets"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'design-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can upload own design assets" on storage.objects;
create policy "Users can upload own design assets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'design-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update own design assets" on storage.objects;
create policy "Users can update own design assets"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'design-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'design-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete own design assets" on storage.objects;
create policy "Users can delete own design assets"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'design-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
