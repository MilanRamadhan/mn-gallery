create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text not null,
  content text not null,
  event_date date not null,
  location text,
  quote text,
  cover_image_url text not null,
  cover_storage_path text,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_images (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  caption text,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null default 'Our Story',
  person_one text not null default 'Milan',
  person_two text not null default '[PARTNER_NAME]',
  relationship_start_date date not null,
  tagline text not null,
  description text not null,
  hero_image_url text,
  hero_storage_path text,
  couple_image_url text,
  couple_storage_path text,
  about_content text,
  quote text,
  accent_color text default '#8f6659',
  is_public boolean not null default true,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

create index if not exists stories_slug_idx on public.stories(slug);
create index if not exists stories_event_date_idx on public.stories(event_date desc);
create index if not exists stories_status_idx on public.stories(status);
create index if not exists stories_category_idx on public.stories(category_id);
create index if not exists stories_featured_idx on public.stories(is_featured) where is_featured = true;
create index if not exists story_images_story_idx on public.story_images(story_id, display_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
drop trigger if exists stories_set_updated_at on public.stories;
create trigger stories_set_updated_at before update on public.stories
for each row execute function public.set_updated_at();
drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', 'Site owner'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.stories enable row level security;
alter table public.story_images enable row level security;
alter table public.site_settings enable row level security;

create policy "Profiles are visible to their owner" on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy "Profiles are editable by their owner" on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Public can read categories" on public.categories
for select to anon, authenticated using (true);
create policy "Authenticated admins can create categories" on public.categories
for insert to authenticated with check (true);
create policy "Authenticated admins can update categories" on public.categories
for update to authenticated using (true) with check (true);
create policy "Authenticated admins can delete categories" on public.categories
for delete to authenticated using (true);

create policy "Public can read published stories" on public.stories
for select to anon, authenticated
using (status = 'published' or (select auth.role()) = 'authenticated');
create policy "Authenticated admins can create stories" on public.stories
for insert to authenticated with check (true);
create policy "Authenticated admins can update stories" on public.stories
for update to authenticated using (true) with check (true);
create policy "Authenticated admins can delete stories" on public.stories
for delete to authenticated using (true);

create policy "Public can read images for published stories" on public.story_images
for select to anon, authenticated
using (
  exists (
    select 1 from public.stories
    where stories.id = story_images.story_id
      and (stories.status = 'published' or (select auth.role()) = 'authenticated')
  )
);
create policy "Authenticated admins can create story images" on public.story_images
for insert to authenticated with check (true);
create policy "Authenticated admins can update story images" on public.story_images
for update to authenticated using (true) with check (true);
create policy "Authenticated admins can delete story images" on public.story_images
for delete to authenticated using (true);

create policy "Public can read site settings" on public.site_settings
for select to anon, authenticated using (true);
create policy "Authenticated admins can create site settings" on public.site_settings
for insert to authenticated with check (true);
create policy "Authenticated admins can update site settings" on public.site_settings
for update to authenticated using (true) with check (true);
create policy "Authenticated admins can delete site settings" on public.site_settings
for delete to authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'relationship-media',
  'relationship-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view relationship media" on storage.objects
for select to anon, authenticated using (bucket_id = 'relationship-media');
create policy "Authenticated admins can upload relationship media" on storage.objects
for insert to authenticated with check (bucket_id = 'relationship-media');
create policy "Authenticated admins can update relationship media" on storage.objects
for update to authenticated using (bucket_id = 'relationship-media')
with check (bucket_id = 'relationship-media');
create policy "Authenticated admins can delete relationship media" on storage.objects
for delete to authenticated using (bucket_id = 'relationship-media');
