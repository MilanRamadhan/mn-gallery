"use client";

import { Music2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type YouTubePlayer = {
  destroy: () => void;
  getPlayerState: () => number;
  mute: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
};

type YouTubePlayerEvent = { target: YouTubePlayer };
type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    events: {
      onAutoplayBlocked?: (event: YouTubePlayerEvent) => void;
      onReady: (event: YouTubePlayerEvent) => void;
      onStateChange: (event: YouTubePlayerEvent & { data: number }) => void;
    };
    height: string;
    playerVars: Record<string, number | string>;
    videoId: string;
    width: string;
  },
) => YouTubePlayer;

declare global {
  interface Window {
    YT?: { Player: YouTubePlayerConstructor; PlayerState: { PLAYING: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<NonNullable<Window["YT"]>> | null = null;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

export function StorySoundtrack({ videoId }: { videoId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const hasFadedInRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let playbackUnlocked = false;

    const clearFade = () => {
      if (fadeTimerRef.current !== null) window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    };

    const fadeIn = (player: YouTubePlayer) => {
      if (hasFadedInRef.current) return;
      hasFadedInRef.current = true;
      clearFade();
      player.setVolume(2);
      let volume = 2;
      fadeTimerRef.current = window.setInterval(() => {
        volume = Math.min(55, volume + 3);
        player.setVolume(volume);
        if (volume >= 55) clearFade();
      }, 120);
    };

    const requestPlayback = () => {
      if (playbackUnlocked) return;
      const player = playerRef.current;
      if (!player) return;
      try {
        player.unMute();
        setMuted(false);
        player.playVideo();
        fadeIn(player);
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    };

    const removeUnlockListeners = () => {
      window.removeEventListener("pointerdown", requestPlayback, { capture: true });
      window.removeEventListener("keydown", requestPlayback, { capture: true });
    };

    window.addEventListener("pointerdown", requestPlayback, { capture: true });
    window.addEventListener("keydown", requestPlayback, { capture: true });

    void loadYouTubeIframeApi().then((api) => {
      if (cancelled || !hostRef.current) return;
      hostRef.current.replaceChildren();
      playerRef.current = new api.Player(hostRef.current, {
        height: "200",
        width: "100%",
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          enablejsapi: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: ({ target }) => {
            target.setVolume(2);
            target.playVideo();
          },
          onStateChange: ({ data, target }) => {
            const isPlaying = data === api.PlayerState.PLAYING;
            setPlaying(isPlaying);
            if (isPlaying) {
              playbackUnlocked = true;
              removeUnlockListeners();
              fadeIn(target);
            }
          },
          onAutoplayBlocked: () => setAutoplayBlocked(true),
        },
      });
    });

    return () => {
      cancelled = true;
      clearFade();
      removeUnlockListeners();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (muted) {
      player.unMute();
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  };

  return (
    <aside className={`music-player story-soundtrack${open ? " open" : ""}`} aria-label="Story soundtrack">
      <div className="music-player-panel" aria-hidden={!open}>
        <div className="music-player-heading">
          <div><span>Soundtrack of this moment</span><strong>Listen while you read</strong></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Hide story soundtrack"><X aria-hidden="true" /></button>
        </div>
        <div className="youtube-frame-host" ref={hostRef} />
        <div className="story-soundtrack-controls">
          <button type="button" onClick={togglePlayback}>{playing ? <Pause /> : <Play />}{playing ? "Pause" : "Play"}</button>
          <button type="button" onClick={toggleMute}>{muted ? <VolumeX /> : <Volume2 />}{muted ? "Unmute" : "Mute"}</button>
        </div>
        {autoplayBlocked ? <p className="soundtrack-note">Your browser blocked autoplay. Touch anywhere once to continue the soundtrack.</p> : null}
      </div>

      <button
        className="music-player-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Hide story soundtrack" : "Show story soundtrack"}
        aria-expanded={open}
      >
        <Music2 aria-hidden="true" />
        <span><small>{playing ? "Now playing" : "Soundtrack"}</small>Story soundtrack</span>
      </button>
    </aside>
  );
}
