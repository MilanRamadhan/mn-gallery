import { createClient } from "@/lib/supabase/server";

type YouTubeSearchResponse = {
  error?: { message?: string };
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      channelTitle?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
      title?: string;
    };
  }>;
};

type CachedSearch = { expiresAt: number; results: ReturnType<typeof mapResults> };
const searchCache = new Map<string, CachedSearch>();
const CACHE_DURATION_MS = 30 * 60 * 1_000;

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data: membership } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  return Boolean(membership);
}

function mapResults(data: YouTubeSearchResponse) {
  return (data.items ?? []).flatMap((item) => {
    const videoId = item.id?.videoId;
    const title = item.snippet?.title;
    if (!videoId || !title) return [];
    return [{
      channelTitle: item.snippet?.channelTitle ?? "YouTube",
      description: item.snippet?.description ?? "",
      publishedAt: item.snippet?.publishedAt ?? "",
      thumbnailUrl:
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      title,
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    }];
  });
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Your admin session has ended." }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return Response.json({ videos: [] });

  const cacheKey = query.toLocaleLowerCase("en");
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return Response.json({ videos: cached.results }, { headers: { "Cache-Control": "private, max-age=300" } });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json(
      { code: "youtube_not_configured", error: "YouTube search needs an API key in the server settings." },
      { status: 503 },
    );
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.search = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "8",
    order: "relevance",
    regionCode: "ID",
    relevanceLanguage: "id",
    safeSearch: "moderate",
    videoEmbeddable: "true",
    videoSyndicated: "true",
  }).toString();

  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = (await response.json()) as YouTubeSearchResponse;
    if (!response.ok) {
      throw new Error(data.error?.message ?? `YouTube search failed with ${response.status}.`);
    }
    const videos = mapResults(data);
    searchCache.set(cacheKey, { expiresAt: Date.now() + CACHE_DURATION_MS, results: videos });
    if (searchCache.size > 50) {
      const oldestKey = searchCache.keys().next().value;
      if (oldestKey) searchCache.delete(oldestKey);
    }
    return Response.json({ videos }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    console.error("[milanora:youtube-search] request failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { error: "YouTube could not be reached or its daily search quota is exhausted." },
      { status: 502 },
    );
  }
}
