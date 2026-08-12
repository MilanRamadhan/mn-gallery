-- Adds an optional YouTube soundtrack to each MilaNora story.
alter table milanora.stories
  add column if not exists youtube_video_id text;

comment on column milanora.stories.youtube_video_id is
  'YouTube video ID selected by the MilaNora administrator for this story.';
