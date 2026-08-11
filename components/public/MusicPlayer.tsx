"use client";

import { Music2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const tracks = [
  {
    artist: "Stephen Sanchez",
    embedUrl: "https://open.spotify.com/embed/track/6pqkYM1Xpu8n832Pbkfp0Y?utm_source=generator&theme=0",
    title: "Until I Found You",
  },
  {
    artist: "Nadhif Basalamah",
    embedUrl: "https://open.spotify.com/embed/track/0ql6fgz8qk0pAEKrGeSppJ?utm_source=generator&theme=0",
    title: "bergema sampai selamanya",
  },
] as const;

export function MusicPlayer() {
  const pathname = usePathname();
  const [activeTrack, setActiveTrack] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const [open, setOpen] = useState(false);

  const togglePlayer = () => {
    setHasOpened(true);
    setOpen((value) => !value);
  };

  if (pathname.startsWith("/story/")) return null;

  return (
    <aside className={`music-player${open ? " open" : ""}`} aria-label="MilaNora soundtrack">
      <div className="music-player-panel" aria-hidden={!open}>
        <div className="music-player-heading">
          <div>
            <span>Our soundtrack</span>
            <strong>MilaNora Radio</strong>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close music player">
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="music-track-list" aria-label="Choose a song">
          {tracks.map((track, index) => (
            <button
              className={activeTrack === index ? "active" : ""}
              key={track.title}
              type="button"
              onClick={() => setActiveTrack(index)}
              aria-pressed={activeTrack === index}
            >
              <span>0{index + 1}</span>
              <span>
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </span>
            </button>
          ))}
        </div>

        {hasOpened && (
          <iframe
            className="spotify-frame"
            key={tracks[activeTrack].embedUrl}
            src={tracks[activeTrack].embedUrl}
            title={`${tracks[activeTrack].title} by ${tracks[activeTrack].artist}`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        )}
      </div>

      <button
        className="music-player-toggle"
        type="button"
        onClick={togglePlayer}
        aria-label={open ? "Hide MilaNora Radio" : "Open MilaNora Radio"}
        aria-expanded={open}
      >
        <Music2 aria-hidden="true" />
        <span>
          <small>Soundtrack</small>
          MilaNora Radio
        </span>
      </button>
    </aside>
  );
}
