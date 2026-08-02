-- MilaNora is intentionally isolated from the existing application's public schema.
-- This script is safe to run from the Supabase SQL Editor on the shared project.

create extension if not exists "pgcrypto";

create schema if not exists milanora authorization postgres;
revoke all on schema milanora from public;
grant usage on schema milanora to anon, authenticated, service_role;

create table if not exists milanora.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists milanora.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists milanora.stories (
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
  category_id uuid references milanora.categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists milanora.story_images (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references milanora.stories(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  caption text,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists milanora.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null default 'Our Story',
  person_one text not null default 'Milan',
  person_two text not null default 'Nora',
  relationship_start_date date not null,
  tagline text not null,
  description text not null,
  hero_image_url text,
  hero_storage_path text,
  couple_image_url text,
  couple_storage_path text,
  about_content text,
  quote text,
  accent_color text default '#f29abb',
  is_public boolean not null default true,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

create index if not exists milanora_stories_slug_idx on milanora.stories(slug);
create index if not exists milanora_stories_event_date_idx on milanora.stories(event_date desc);
create index if not exists milanora_stories_status_idx on milanora.stories(status);
create index if not exists milanora_stories_category_idx on milanora.stories(category_id);
create index if not exists milanora_stories_featured_idx on milanora.stories(is_featured)
  where is_featured = true;
create index if not exists milanora_story_images_story_idx
  on milanora.story_images(story_id, display_order);

create or replace function milanora.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists milanora_categories_set_updated_at on milanora.categories;
create trigger milanora_categories_set_updated_at
before update on milanora.categories
for each row execute function milanora.set_updated_at();

drop trigger if exists milanora_stories_set_updated_at on milanora.stories;
create trigger milanora_stories_set_updated_at
before update on milanora.stories
for each row execute function milanora.set_updated_at();

drop trigger if exists milanora_site_settings_set_updated_at on milanora.site_settings;
create trigger milanora_site_settings_set_updated_at
before update on milanora.site_settings
for each row execute function milanora.set_updated_at();

create or replace function milanora.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from milanora.admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function milanora.is_admin() from public;
grant execute on function milanora.is_admin() to anon, authenticated, service_role;

alter table milanora.admins enable row level security;
alter table milanora.categories enable row level security;
alter table milanora.stories enable row level security;
alter table milanora.story_images enable row level security;
alter table milanora.site_settings enable row level security;

grant select on milanora.admins to authenticated;
grant select on milanora.categories, milanora.stories, milanora.story_images, milanora.site_settings
  to anon, authenticated;
grant insert, update, delete on milanora.categories, milanora.stories,
  milanora.story_images, milanora.site_settings to authenticated;
grant all on all tables in schema milanora to service_role;

drop policy if exists "MilaNora admins can view own membership" on milanora.admins;
create policy "MilaNora admins can view own membership"
on milanora.admins for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "MilaNora public can read categories" on milanora.categories;
create policy "MilaNora public can read categories"
on milanora.categories for select to anon, authenticated using (true);
drop policy if exists "MilaNora admins can create categories" on milanora.categories;
create policy "MilaNora admins can create categories"
on milanora.categories for insert to authenticated
with check ((select milanora.is_admin()));
drop policy if exists "MilaNora admins can update categories" on milanora.categories;
create policy "MilaNora admins can update categories"
on milanora.categories for update to authenticated
using ((select milanora.is_admin())) with check ((select milanora.is_admin()));
drop policy if exists "MilaNora admins can delete categories" on milanora.categories;
create policy "MilaNora admins can delete categories"
on milanora.categories for delete to authenticated
using ((select milanora.is_admin()));

drop policy if exists "MilaNora public can read published stories" on milanora.stories;
create policy "MilaNora public can read published stories"
on milanora.stories for select to anon, authenticated
using (status = 'published' or (select milanora.is_admin()));
drop policy if exists "MilaNora admins can create stories" on milanora.stories;
create policy "MilaNora admins can create stories"
on milanora.stories for insert to authenticated
with check ((select milanora.is_admin()));
drop policy if exists "MilaNora admins can update stories" on milanora.stories;
create policy "MilaNora admins can update stories"
on milanora.stories for update to authenticated
using ((select milanora.is_admin())) with check ((select milanora.is_admin()));
drop policy if exists "MilaNora admins can delete stories" on milanora.stories;
create policy "MilaNora admins can delete stories"
on milanora.stories for delete to authenticated
using ((select milanora.is_admin()));

drop policy if exists "MilaNora public can read published story images" on milanora.story_images;
create policy "MilaNora public can read published story images"
on milanora.story_images for select to anon, authenticated
using (
  exists (
    select 1
    from milanora.stories
    where milanora.stories.id = milanora.story_images.story_id
      and (milanora.stories.status = 'published' or (select milanora.is_admin()))
  )
);
drop policy if exists "MilaNora admins can create story images" on milanora.story_images;
create policy "MilaNora admins can create story images"
on milanora.story_images for insert to authenticated
with check ((select milanora.is_admin()));
drop policy if exists "MilaNora admins can update story images" on milanora.story_images;
create policy "MilaNora admins can update story images"
on milanora.story_images for update to authenticated
using ((select milanora.is_admin())) with check ((select milanora.is_admin()));
drop policy if exists "MilaNora admins can delete story images" on milanora.story_images;
create policy "MilaNora admins can delete story images"
on milanora.story_images for delete to authenticated
using ((select milanora.is_admin()));

drop policy if exists "MilaNora public can read visible settings" on milanora.site_settings;
create policy "MilaNora public can read visible settings"
on milanora.site_settings for select to anon, authenticated
using (is_public or (select milanora.is_admin()));
drop policy if exists "MilaNora admins can create settings" on milanora.site_settings;
create policy "MilaNora admins can create settings"
on milanora.site_settings for insert to authenticated
with check ((select milanora.is_admin()));
drop policy if exists "MilaNora admins can update settings" on milanora.site_settings;
create policy "MilaNora admins can update settings"
on milanora.site_settings for update to authenticated
using ((select milanora.is_admin())) with check ((select milanora.is_admin()));
drop policy if exists "MilaNora admins can delete settings" on milanora.site_settings;
create policy "MilaNora admins can delete settings"
on milanora.site_settings for delete to authenticated
using ((select milanora.is_admin()));

insert into milanora.admins (user_id)
values ('154f5164-d2e2-408d-a18b-5acb07c2a403')
on conflict (user_id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'milanora-media',
  'milanora-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "MilaNora public can view media" on storage.objects;
create policy "MilaNora public can view media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'milanora-media');
drop policy if exists "MilaNora admins can upload media" on storage.objects;
create policy "MilaNora admins can upload media"
on storage.objects for insert to authenticated
with check (bucket_id = 'milanora-media' and (select milanora.is_admin()));
drop policy if exists "MilaNora admins can update media" on storage.objects;
create policy "MilaNora admins can update media"
on storage.objects for update to authenticated
using (bucket_id = 'milanora-media' and (select milanora.is_admin()))
with check (bucket_id = 'milanora-media' and (select milanora.is_admin()));
drop policy if exists "MilaNora admins can delete media" on storage.objects;
create policy "MilaNora admins can delete media"
on storage.objects for delete to authenticated
using (bucket_id = 'milanora-media' and (select milanora.is_admin()));
