-- Bring earlier installations onto the brighter pink used by the dark theme.
alter table public.site_settings
  alter column accent_color set default '#f29abb';

update public.site_settings
set accent_color = '#f29abb', updated_at = timezone('utc', now())
where accent_color is null or lower(accent_color) in ('#8f6659', '#b85f7e');
