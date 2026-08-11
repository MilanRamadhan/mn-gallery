const SPOTIFY_TRACK_ID = /^[A-Za-z0-9]{22}$/;

export function getSpotifyTrackId(value: string | null | undefined) {
  const input = value?.trim() ?? "";
  if (SPOTIFY_TRACK_ID.test(input)) return input;

  const uriMatch = input.match(/^spotify:track:([A-Za-z0-9]{22})$/i);
  if (uriMatch) return uriMatch[1];

  const urlMatch = input.match(
    /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([A-Za-z0-9]{22})(?:[/?#].*)?$/i,
  );
  return urlMatch?.[1] ?? null;
}

export function getSpotifyTrackUrl(trackId: string) {
  return `https://open.spotify.com/track/${trackId}`;
}

export function getSpotifyEmbedUrl(trackId: string, autoplay = false) {
  const parameters = new URLSearchParams({ theme: "0", utm_source: "generator" });
  if (autoplay) parameters.set("autoplay", "1");
  return `https://open.spotify.com/embed/track/${trackId}?${parameters.toString()}`;
}
