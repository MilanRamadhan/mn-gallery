"use client";

import { Check, ExternalLink, LoaderCircle, Music2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AppImage } from "@/components/shared/AppImage";
import { getYouTubeThumbnailUrl, getYouTubeVideoId } from "@/lib/youtube";

type YouTubeVideo = {
  channelTitle: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  title: string;
  url: string;
  videoId: string;
};

export function YouTubeTrackPicker({
  error,
  onChange,
  value,
}: {
  error?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const selectedVideoId = getYouTubeVideoId(value);
  const trimmedQuery = query.trim();
  const activeSelectedVideo = selectedVideo?.videoId === selectedVideoId ? selectedVideo : null;

  useEffect(() => {
    if (trimmedQuery.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setSearchError("");
      try {
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { error?: string; videos?: YouTubeVideo[] };
        if (!response.ok) throw new Error(data.error ?? "YouTube search failed.");
        setVideos(data.videos ?? []);
      } catch (searchFailure) {
        if (controller.signal.aborted) return;
        setVideos([]);
        setSearchError(searchFailure instanceof Error ? searchFailure.message : "YouTube search failed.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  const resultLabel = trimmedQuery.length < 2
    ? "Type a song title or artist to begin."
    : loading
      ? "Searching YouTube…"
      : searchError
        ? searchError
        : videos.length === 0
          ? "No embeddable videos found."
          : `${videos.length} videos found`;

  return (
    <div className="youtube-picker wide">
      <div className="youtube-search-field">
        <Search aria-hidden="true" />
        <input
          aria-label="Search YouTube songs"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (nextQuery.trim().length < 2) {
              setVideos([]);
              setLoading(false);
              setSearchError("");
            }
          }}
          placeholder="Search a song or artist, for example: romantic acoustic"
          autoComplete="off"
        />
        {loading ? <LoaderCircle className="spin" aria-hidden="true" /> : null}
      </div>
      <p className={`youtube-search-status${searchError ? " error" : ""}`} role="status">{resultLabel}</p>

      {videos.length > 0 ? (
        <div className="youtube-search-results" aria-label="YouTube search results">
          {videos.map((video) => {
            const isSelected = video.videoId === selectedVideoId;
            return (
              <button
                className={isSelected ? "selected" : ""}
                key={video.videoId}
                type="button"
                onClick={() => {
                  setSelectedVideo(video);
                  onChange(video.url);
                }}
                aria-pressed={isSelected}
              >
                <span className="youtube-result-cover">
                  <AppImage src={video.thumbnailUrl} alt="" width={128} height={72} unoptimized />
                </span>
                <span className="youtube-result-copy">
                  <strong>{video.title}</strong>
                  <small>{video.channelTitle}</small>
                  <em>{video.description || "YouTube video"}</em>
                </span>
                <span className="youtube-result-check">{isSelected ? <Check aria-hidden="true" /> : "Choose"}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedVideoId ? (
        <div className="soundtrack-preview youtube-selected-track">
          <div>
            <AppImage
              src={activeSelectedVideo?.thumbnailUrl ?? getYouTubeThumbnailUrl(selectedVideoId)}
              alt=""
              width={96}
              height={54}
              unoptimized
            />
            <span>
              <strong>{activeSelectedVideo?.title ?? "Selected story soundtrack"}</strong>
              <small>{activeSelectedVideo?.channelTitle ?? "Saved YouTube video"}</small>
            </span>
            <button type="button" onClick={() => { onChange(""); setSelectedVideo(null); }} aria-label="Remove soundtrack"><X /></button>
          </div>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${selectedVideoId}?controls=1&rel=0`}
            title="Selected YouTube soundtrack"
            width="100%"
            height="240"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
          />
        </div>
      ) : null}

      <details className="youtube-link-fallback">
        <summary><ExternalLink size={14} />Already have a YouTube link?</summary>
        <label>
          YouTube video link
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </label>
      </details>
      {error ? <small className="youtube-picker-error" role="alert">{error}</small> : null}
      <p className="youtube-quota-note"><Music2 size={13} /> Search uses the project&apos;s free YouTube API quota. Repeated searches are cached.</p>
    </div>
  );
}
