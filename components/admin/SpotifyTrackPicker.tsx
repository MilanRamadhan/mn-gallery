"use client";

import { Check, ExternalLink, LoaderCircle, Music2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AppImage } from "@/components/shared/AppImage";
import { getSpotifyEmbedUrl, getSpotifyTrackId } from "@/lib/spotify";

type SpotifyTrack = {
  albumName: string;
  artists: string[];
  durationMs: number;
  id: string;
  imageUrl: string | null;
  name: string;
  url: string;
};

function formatDuration(durationMs: number) {
  const seconds = Math.round(durationMs / 1_000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function SpotifyTrackPicker({
  error,
  onChange,
  value,
}: {
  error?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const selectedTrackId = getSpotifyTrackId(value);
  const trimmedQuery = query.trim();
  const activeSelectedTrack = selectedTrack?.id === selectedTrackId ? selectedTrack : null;

  useEffect(() => {
    if (trimmedQuery.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setSearchError("");
      try {
        const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { error?: string; tracks?: SpotifyTrack[] };
        if (!response.ok) throw new Error(data.error ?? "Spotify search failed.");
        setTracks(data.tracks ?? []);
      } catch (searchFailure) {
        if (controller.signal.aborted) return;
        setTracks([]);
        setSearchError(searchFailure instanceof Error ? searchFailure.message : "Spotify search failed.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  const resultLabel = trimmedQuery.length < 2
    ? "Type a song title or artist to begin."
    : loading
      ? "Searching the Spotify catalogue…"
      : searchError
        ? searchError
        : tracks.length === 0
          ? "No matching tracks found."
          : `${tracks.length} tracks found`;

  return (
    <div className="spotify-picker wide">
      <div className="spotify-search-field">
        <Search aria-hidden="true" />
        <input
          aria-label="Search Spotify songs"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (nextQuery.trim().length < 2) {
              setTracks([]);
              setLoading(false);
              setSearchError("");
            }
          }}
          placeholder="Search a song or artist, for example: wedding acoustic"
          autoComplete="off"
        />
        {loading && <LoaderCircle className="spin" aria-hidden="true" />}
      </div>
      <p className={`spotify-search-status${searchError ? " error" : ""}`} role="status">{resultLabel}</p>

      {tracks.length > 0 && (
        <div className="spotify-search-results" aria-label="Spotify search results">
          {tracks.map((track) => {
            const isSelected = track.id === selectedTrackId;
            return (
              <button
                className={isSelected ? "selected" : ""}
                key={track.id}
                type="button"
                onClick={() => {
                  setSelectedTrack(track);
                  onChange(track.url);
                }}
                aria-pressed={isSelected}
              >
                <span className="spotify-result-cover">
                  {track.imageUrl ? (
                    <AppImage src={track.imageUrl} alt="" width={58} height={58} unoptimized />
                  ) : <Music2 aria-hidden="true" />}
                </span>
                <span className="spotify-result-copy">
                  <strong>{track.name}</strong>
                  <small>{track.artists.join(", ")}</small>
                  <em>{track.albumName} · {formatDuration(track.durationMs)}</em>
                </span>
                <span className="spotify-result-check">{isSelected ? <Check aria-hidden="true" /> : "Choose"}</span>
              </button>
            );
          })}
        </div>
      )}

      {selectedTrackId && (
        <div className="soundtrack-preview spotify-selected-track">
          <div>
            <Music2 size={17} />
            <span>
              <strong>{activeSelectedTrack?.name ?? "Selected story soundtrack"}</strong>
              <small>{activeSelectedTrack ? activeSelectedTrack.artists.join(", ") : "Saved Spotify track"}</small>
            </span>
            <button type="button" onClick={() => { onChange(""); setSelectedTrack(null); }} aria-label="Remove soundtrack"><X /></button>
          </div>
          <iframe
            src={getSpotifyEmbedUrl(selectedTrackId)}
            title="Selected Spotify soundtrack"
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}

      <details className="spotify-link-fallback">
        <summary><ExternalLink size={14} />Already have a Spotify link?</summary>
        <label>
          Spotify song link
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            inputMode="url"
            placeholder="https://open.spotify.com/track/..."
          />
        </label>
      </details>
      {error && <small className="spotify-picker-error" role="alert">{error}</small>}
    </div>
  );
}
