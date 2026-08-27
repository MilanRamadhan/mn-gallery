create table if not exists milanora.letters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text not null,
  content text not null,
  letter_date date not null,
  cover_image_url text,
  cover_storage_path text,
  signature text,
  youtube_video_id text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists milanora_letters_slug_idx on milanora.letters(slug);
create index if not exists milanora_letters_date_idx on milanora.letters(letter_date desc);
create index if not exists milanora_letters_status_idx on milanora.letters(status);

drop trigger if exists milanora_letters_set_updated_at on milanora.letters;
create trigger milanora_letters_set_updated_at
before update on milanora.letters
for each row execute function milanora.set_updated_at();

alter table milanora.letters enable row level security;

grant select on milanora.letters to anon, authenticated;
grant insert, update, delete on milanora.letters to authenticated;
grant all on milanora.letters to service_role;

drop policy if exists "MilaNora public can read published letters" on milanora.letters;
create policy "MilaNora public can read published letters"
on milanora.letters for select to anon, authenticated
using (status = 'published' or (select milanora.is_admin()));

drop policy if exists "MilaNora admins can create letters" on milanora.letters;
create policy "MilaNora admins can create letters"
on milanora.letters for insert to authenticated
with check ((select milanora.is_admin()));

drop policy if exists "MilaNora admins can update letters" on milanora.letters;
create policy "MilaNora admins can update letters"
on milanora.letters for update to authenticated
using ((select milanora.is_admin())) with check ((select milanora.is_admin()));

drop policy if exists "MilaNora admins can delete letters" on milanora.letters;
create policy "MilaNora admins can delete letters"
on milanora.letters for delete to authenticated
using ((select milanora.is_admin()));
