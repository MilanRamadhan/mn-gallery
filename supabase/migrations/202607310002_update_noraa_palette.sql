-- Keep existing installations aligned with Noraa's blue, milk-brown, and pink palette.
alter table public.site_settings
  alter column accent_color set default '#b85f7e';

update public.site_settings
set accent_color = '#b85f7e', updated_at = timezone('utc', now())
where accent_color is null or lower(accent_color) = '#8f6659';
