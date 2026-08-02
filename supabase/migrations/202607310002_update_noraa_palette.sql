-- Keep existing installations aligned with Noraa's blue, milk-brown, and pink palette.
alter table milanora.site_settings
  alter column accent_color set default '#f29abb';

update milanora.site_settings
set accent_color = '#f29abb', updated_at = timezone('utc', now())
where accent_color is null or lower(accent_color) = '#8f6659';
