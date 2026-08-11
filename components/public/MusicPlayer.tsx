"use client";

import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type OpeningState = "finished" | "muted" | "playing" | "waiting";

const OPENING_SOUND_DURATION_SECONDS = 10.8;
const OPENING_SOUND_VOLUME = 0.34;
const OPENING_FADE_IN_SECONDS = 2.2;

function scheduleNote({
  context,
  destination,
  duration,
  frequency,
  start,
  type = "sine",
  volume,
}: {
  context: AudioContext;
  destination: AudioNode;
  duration: number;
  frequency: number;
  start: number;
  type?: OscillatorType;
  volume: number;
}) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.type = type;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function scheduleOpeningSound(context: AudioContext, master: GainNode) {
  const start = context.currentTime + 0.08;
  const chords = [
    [293.66, 369.99, 440.0, 587.33],
    [220.0, 277.18, 329.63, 440.0],
    [246.94, 293.66, 369.99, 493.88],
    [196.0, 246.94, 293.66, 392.0],
  ];

  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(OPENING_SOUND_VOLUME, start + OPENING_FADE_IN_SECONDS);
  master.gain.setValueAtTime(OPENING_SOUND_VOLUME, start + 8.7);
  master.gain.exponentialRampToValueAtTime(0.0001, start + OPENING_SOUND_DURATION_SECONDS);

  chords.forEach((chord, chordIndex) => {
    const chordStart = start + chordIndex * 2.2;
    chord.slice(0, 3).forEach((frequency) => {
      scheduleNote({
        context,
        destination: master,
        duration: 2.75,
        frequency,
        start: chordStart,
        type: "sine",
        volume: 0.045,
      });
    });

    chord.forEach((frequency, noteIndex) => {
      const noteStart = chordStart + noteIndex * 0.34;
      scheduleNote({
        context,
        destination: master,
        duration: 1.55,
        frequency: frequency * 2,
        start: noteStart,
        type: "triangle",
        volume: 0.08,
      });
      scheduleNote({
        context,
        destination: master,
        duration: 1.9,
        frequency: frequency * 4,
        start: noteStart + 0.015,
        volume: 0.018,
      });
    });
  });

  scheduleNote({
    context,
    destination: master,
    duration: 2.1,
    frequency: 1_174.66,
    start: start + 8.65,
    type: "triangle",
    volume: 0.075,
  });
}

export function MusicPlayer() {
  const pathname = usePathname();
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const scheduledRef = useRef(false);
  const completionTimerRef = useRef<number | null>(null);
  const [state, setState] = useState<OpeningState>("waiting");
  const isStory = pathname.startsWith("/story/");

  const stopOpening = useCallback(() => {
    if (completionTimerRef.current) window.clearTimeout(completionTimerRef.current);
    completionTimerRef.current = null;
    scheduledRef.current = true;
    void contextRef.current?.close();
    contextRef.current = null;
    masterRef.current = null;
  }, []);

  const playOpening = useCallback(async (replay = false) => {
    if (isStory) return;
    if (scheduledRef.current && !replay) {
      if (contextRef.current?.state === "suspended") await contextRef.current.resume();
      return;
    }

    if (replay && contextRef.current) {
      await contextRef.current.close();
      contextRef.current = null;
      masterRef.current = null;
      scheduledRef.current = false;
    }

    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;
    try {
      await context.resume();
    } catch {
      setState("waiting");
      return;
    }
    if (context.state !== "running") {
      setState("waiting");
      return;
    }

    const master = context.createGain();
    master.connect(context.destination);
    masterRef.current = master;
    scheduledRef.current = true;
    scheduleOpeningSound(context, master);
    setState("playing");
    if (completionTimerRef.current) window.clearTimeout(completionTimerRef.current);
    completionTimerRef.current = window.setTimeout(() => {
      setState("finished");
    }, OPENING_SOUND_DURATION_SECONDS * 1_000);
  }, [isStory]);

  useEffect(() => {
    if (isStory) {
      stopOpening();
      return;
    }

    const initialTimer = window.setTimeout(() => void playOpening(), 0);
    const unlock = () => void playOpening();
    window.addEventListener("pointerdown", unlock, { capture: true, once: true });
    window.addEventListener("keydown", unlock, { capture: true, once: true });
    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
    };
  }, [isStory, playOpening, stopOpening]);

  useEffect(() => () => stopOpening(), [stopOpening]);

  if (isStory) return null;

  const status = state === "waiting"
    ? "Opening sound will play automatically"
    : state === "playing"
      ? "Mute opening sound"
      : state === "muted"
        ? "Unmute opening sound"
        : "Replay opening sound";

  const toggle = () => {
    if (state === "playing" && masterRef.current && contextRef.current) {
      masterRef.current.gain.setTargetAtTime(0.0001, contextRef.current.currentTime, 0.2);
      setState("muted");
      return;
    }
    if (state === "muted" && masterRef.current && contextRef.current) {
      masterRef.current.gain.setTargetAtTime(OPENING_SOUND_VOLUME, contextRef.current.currentTime, 0.35);
      setState("playing");
      return;
    }
    void playOpening(true);
  };

  return (
    <aside className={`opening-sound opening-sound-${state}`} aria-label="MilaNora opening sound">
      <button type="button" onClick={toggle} aria-label={status}>
        <span className="opening-sound-icon">
          {state === "muted" ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          <Sparkles aria-hidden="true" />
        </span>
        <span className="opening-sound-notes" aria-hidden="true"><i /><i /><i /><i /></span>
      </button>
    </aside>
  );
}
