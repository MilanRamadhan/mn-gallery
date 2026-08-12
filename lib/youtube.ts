const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value: string | null | undefined) {
  const input = value?.trim() ?? "";
  if (YOUTUBE_VIDEO_ID.test(input)) return input;

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    let candidate: string | null = null;

    if (host === "youtu.be") candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname === "/watch") candidate = url.searchParams.get("v");
      else candidate = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] ?? null;
    }

    return candidate && YOUTUBE_VIDEO_ID.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function getYouTubeVideoUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}
