-- Replace the original setup placeholder without overwriting a custom partner name.
alter table public.site_settings
  alter column person_two set default 'Nora';

update public.site_settings
set
  person_two = 'Nora',
  seo_title = case
    when seo_title is null or seo_title like '%[PARTNER_NAME]%'
      then 'Our Story — Milan & Nora'
    else seo_title
  end,
  updated_at = timezone('utc', now())
where person_two = '[PARTNER_NAME]';
