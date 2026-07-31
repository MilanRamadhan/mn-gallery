insert into public.categories (id, name, slug, description, icon) values
  ('10000000-0000-4000-8000-000000000001', 'First Moments', 'first-moments', 'The beginnings we never want to forget.', 'Sparkles'),
  ('10000000-0000-4000-8000-000000000002', 'Dates', 'dates', 'Time set aside for us.', 'Heart'),
  ('10000000-0000-4000-8000-000000000003', 'Trips', 'trips', 'Places that became part of our story.', 'Map'),
  ('10000000-0000-4000-8000-000000000004', 'Celebrations', 'celebrations', 'The milestones and little victories.', 'PartyPopper'),
  ('10000000-0000-4000-8000-000000000005', 'Random Days', 'random-days', 'Proof that ordinary can be beautiful.', 'Coffee'),
  ('10000000-0000-4000-8000-000000000006', 'Milestones', 'milestones', 'The chapters that changed us.', 'Flag'),
  ('10000000-0000-4000-8000-000000000007', 'Special Memories', 'special-memories', 'The ones that still make time pause.', 'BookHeart')
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon;

insert into public.site_settings (
  id, site_title, person_one, person_two, relationship_start_date, tagline,
  description, hero_image_url, couple_image_url, about_content, quote,
  accent_color, is_public, seo_title, seo_description
) values (
  '20000000-0000-4000-8000-000000000001',
  'Our Story',
  'Milan',
  '[PARTNER_NAME]',
  '2024-02-14',
  'A collection of moments, memories, and everything between us.',
  'A small corner of the internet where we keep the memories we never want to forget.',
  '/placeholders/hero.webp',
  '/placeholders/couple.webp',
  'We built this archive to remember where we were, what we felt, and how an ordinary day became part of us.',
  'Some moments become memories. Some memories become a home.',
  '#8f6659',
  true,
  'Our Story — Milan & [PARTNER_NAME]',
  'A private relationship journal and memory gallery.'
) on conflict (id) do update set
  site_title = excluded.site_title,
  person_one = excluded.person_one,
  person_two = excluded.person_two,
  relationship_start_date = excluded.relationship_start_date,
  tagline = excluded.tagline,
  description = excluded.description;

insert into public.stories (
  id, title, slug, excerpt, content, event_date, location, quote,
  cover_image_url, cover_storage_path, category_id, status, is_featured, display_order
) values
  (
    '30000000-0000-4000-8000-000000000001',
    'The First Hello',
    'the-first-hello',
    'A simple conversation that looked ordinary until it became the beginning of everything.',
    E'It began with a small hello. Nothing cinematic, nothing carefully planned—just two people finding a reason to keep the conversation going.\n\nLooking back, the details feel brighter than they did that day. We did not know we were opening the first page of a much longer story.',
    '2024-02-14',
    'A tiny chat window',
    'Some beginnings whisper before they become everything.',
    '/placeholders/story-01.webp',
    'demo/story-01.webp',
    '10000000-0000-4000-8000-000000000001',
    'published',
    true,
    1
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'Our First Photo',
    'our-first-photo',
    'Slightly blurred, a little awkward, and still one of the photographs we love most.',
    E'We almost did not take this photograph. The light was imperfect and neither of us knew where to look.\n\nIt holds the version of us that was still learning how to stand together.',
    '2024-04-06',
    '[FIRST PHOTO LOCATION]',
    'Not perfect. Completely ours.',
    '/placeholders/story-02.webp',
    'demo/story-02.webp',
    '10000000-0000-4000-8000-000000000001',
    'published',
    false,
    2
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'The First Date',
    'the-first-date',
    'The food grew cold while the conversation somehow kept getting warmer.',
    E'We arrived with questions and left with plans. The evening ran longer than expected because neither of us wanted to be the first to say it was time to go.\n\nThere are grander dates in the archive now, but this one still carries a particular kind of light.',
    '2024-05-18',
    '[FIRST DATE PLACE]',
    'I wanted the evening to forget how to end.',
    '/placeholders/story-03.webp',
    'demo/story-03.webp',
    '10000000-0000-4000-8000-000000000002',
    'published',
    true,
    3
  )
on conflict (slug) do nothing;

insert into public.story_images (
  id, story_id, image_url, storage_path, caption, alt_text, display_order
) values
  (
    '40000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    '/placeholders/detail-01.webp',
    'demo/detail-01.webp',
    'The first page, before we knew it was a chapter.',
    'Warm abstract placeholder for the first conversation.',
    0
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000003',
    '/placeholders/detail-04.webp',
    'demo/detail-04.webp',
    'The table where time moved differently.',
    'Golden beige editorial image placeholder.',
    0
  )
on conflict (id) do nothing;
