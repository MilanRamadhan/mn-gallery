"use client";

import { Music2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SpotifyController = {
  destroy: () => void;
  play: () => void;
};

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { height: number; uri: string; width: string },
    callback: (controller: SpotifyController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
    milanoraSpotifyIframeApi?: SpotifyIframeApi;
  }
}

let spotifyApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyIframeApi() {
  if (window.milanoraSpotifyIframeApi) return Promise.resolve(window.milanoraSpotifyIframeApi);
  if (spotifyApiPromise) return spotifyApiPromise;

  spotifyApiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (api) => {
      window.milanoraSpotifyIframeApi = api;
      resolve(api);
    };

    if (!document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      document.body.appendChild(script);
    }
  });

  return spotifyApiPromise;
}

export function StorySoundtrack({ trackId }: { trackId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let controller: SpotifyController | null = null;

    void loadSpotifyIframeApi().then((api) => {
      if (cancelled || !hostRef.current) return;
      hostRef.current.replaceChildren();
      api.createController(
        hostRef.current,
        { height: 152, uri: `spotify:track:${trackId}`, width: "100%" },
        (createdController) => {
          if (cancelled) {
            createdController.destroy();
            return;
          }
          controller = createdController;
          try {
            createdController.play();
          } catch {
            // Browsers may require the visitor's first interaction before audible playback.
          }
        },
      );
    });

    return () => {
      cancelled = true;
      controller?.destroy();
    };
  }, [trackId]);

  return (
    <aside className={`music-player story-soundtrack${open ? " open" : ""}`} aria-label="Story soundtrack">
      <div className="music-player-panel" aria-hidden={!open}>
        <div className="music-player-heading">
          <div>
            <span>Soundtrack of this moment</span>
            <strong>Listen while you read</strong>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Hide story soundtrack">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="spotify-frame-host" ref={hostRef} />
        <p className="soundtrack-note">Playback starts automatically when the browser allows it.</p>
      </div>

      <button
        className="music-player-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Hide story soundtrack" : "Show story soundtrack"}
        aria-expanded={open}
      >
        <Music2 aria-hidden="true" />
        <span><small>Now playing</small>Story soundtrack</span>
      </button>
    </aside>
  );
}
