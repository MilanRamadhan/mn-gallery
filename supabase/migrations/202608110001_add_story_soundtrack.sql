-- Adds an optional Spotify soundtrack to each MilaNora story.
alter table milanora.stories
  add column if not exists spotify_track_id text;

comment on column milanora.stories.spotify_track_id is
  'Spotify track ID selected by the MilaNora administrator for this story.';
