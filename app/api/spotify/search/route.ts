import { createClient } from "@/lib/supabase/server";

type SpotifyTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type SpotifySearchResponse = {
  tracks?: {
    items?: Array<{
      album?: { images?: Array<{ height?: number; url?: string; width?: number }>; name?: string };
      artists?: Array<{ name?: string }>;
      duration_ms?: number;
      external_urls?: { spotify?: string };
      id?: string;
      name?: string;
    }>;
  };
};

let cachedToken: { expiresAt: number; value: string } | null = null;

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

async function getSpotifyToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}.`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  if (!data.access_token) throw new Error("Spotify did not return an access token.");

  cachedToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in ?? 3_600) * 1_000,
  };
  return cachedToken.value;
}

async function searchSpotify(query: string, forceRefresh = false) {
  const token = await getSpotifyToken(forceRefresh);
  if (!token) return null;

  const url = new URL("https://api.spotify.com/v1/search");
  url.search = new URLSearchParams({
    q: query,
    type: "track",
    market: "ID",
    limit: "8",
  }).toString();

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401 && !forceRefresh) {
    cachedToken = null;
    return searchSpotify(query, true);
  }
  if (!response.ok) {
    throw new Error(`Spotify search failed with ${response.status}.`);
  }
  return (await response.json()) as SpotifySearchResponse;
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Your admin session has ended." }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return Response.json({ tracks: [] });

  try {
    const data = await searchSpotify(query);
    if (!data) {
      return Response.json(
        {
          code: "spotify_not_configured",
          error: "Spotify search needs a Client ID and Client Secret in the server settings.",
        },
        { status: 503 },
      );
    }

    const tracks = (data.tracks?.items ?? []).flatMap((track) => {
      if (!track.id || !track.name) return [];
      const image = track.album?.images?.find((item) => item.url)?.url ?? null;
      return [{
        id: track.id,
        name: track.name,
        artists: (track.artists ?? []).flatMap((artist) => artist.name ? [artist.name] : []),
        albumName: track.album?.name ?? "",
        imageUrl: image,
        durationMs: track.duration_ms ?? 0,
        url: track.external_urls?.spotify ?? `https://open.spotify.com/track/${track.id}`,
      }];
    });

    return Response.json(
      { tracks },
      { headers: { "Cache-Control": "private, max-age=30" } },
    );
  } catch (error) {
    console.error("[milanora:spotify-search] request failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { error: "Spotify could not be reached. Please try the search again." },
      { status: 502 },
    );
  }
}
