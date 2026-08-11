"use client";

import { ArrowDown, ArrowUpRight, CalendarHeart, MousePointer2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { AppImage } from "@/components/shared/AppImage";
import type { SiteSettings } from "@/types/story";

export function HomeHero({ settings }: { settings: SiteSettings }) {
  const heroRef = useRef<HTMLElement>(null);
  const revealFrameRef = useRef<number | null>(null);
  const heroImage = settings.hero_image_url || "/placeholders/hero.webp";
  const startDate = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(settings.relationship_start_date + "T00:00:00Z"));

  const moveReveal = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(90, Math.max(10, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(88, Math.max(12, ((event.clientY - bounds.top) / bounds.height) * 100));
    const target = event.currentTarget;
    if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
    revealFrameRef.current = requestAnimationFrame(() => {
      target.style.setProperty("--reveal-x", `${x}%`);
      target.style.setProperty("--reveal-y", `${y}%`);
      revealFrameRef.current = null;
    });
  };

  const resetReveal = (event: ReactPointerEvent<HTMLElement>) => {
    if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
    revealFrameRef.current = null;
    event.currentTarget.style.setProperty("--reveal-x", "68%");
    event.currentTarget.style.setProperty("--reveal-y", "42%");
  };

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => hero.classList.toggle("is-in-view", entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(hero);
    return () => {
      observer.disconnect();
      if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="cinematic-hero love-reveal-hero"
      aria-label="An interactive introduction to Milan and Nora's story"
      onPointerMove={moveReveal}
      onPointerLeave={resetReveal}
    >
      <div className="love-reveal-backdrop" aria-hidden="true">
        <AppImage src={heroImage} alt="" fill priority sizes="100vw" />
      </div>

      <div className="love-photo love-photo-base hero-photo-enter">
        <div className="love-photo-frame">
          <AppImage
            src={heroImage}
            alt={`A memory from ${settings.person_one} and ${settings.person_two}'s story`}
            fill
            priority
            sizes="(min-width: 761px) 50vw, 100vw"
          />
        </div>
      </div>

      <div className="love-photo love-photo-color hero-color-enter" aria-hidden="true">
        <div className="love-photo-frame">
          <AppImage src={heroImage} alt="" fill sizes="(min-width: 761px) 50vw, 100vw" />
        </div>
      </div>

      <div className="love-reveal-shade" aria-hidden="true" />
      <div className="love-reveal-grid" aria-hidden="true" />
      <div className="love-reveal-noise" aria-hidden="true" />

      <div className="love-reveal-label hero-fade-enter hero-delay-4" aria-hidden="true">
        <MousePointer2 size={13} />
        <span>Move to reveal us</span>
      </div>

      <div className="love-reveal-copy">
        <div className="love-reveal-kicker hero-rise-enter hero-delay-1">
          <span>Before there was a story</span>
          <i />
          <span>there was one conversation</span>
        </div>

        <h1>
          <span className="love-line-mask">
            <span className="hero-line-enter hero-line-1">She texted</span>
          </span>
          <span className="love-line-mask love-line-pink">
            <em className="hero-line-enter hero-line-2">the wrong person—</em>
          </span>
          <span className="love-line-mask love-line-last">
            <strong className="hero-line-enter hero-line-3">and somehow found</strong>
          </span>
          <span className="love-line-mask love-line-blue">
            <strong className="hero-line-enter hero-line-4">the right one.</strong>
          </span>
        </h1>

        <div className="love-reveal-details hero-rise-enter hero-delay-3">
          <p>
            The message was an accident. Everything after it became a choice.
            <span>{settings.tagline}</span>
          </p>
          <div className="love-reveal-actions">
            <Link className="button primary" href="/journey">Enter our story <ArrowUpRight size={16} /></Link>
            <Link className="button text" href="/gallery">See the evidence <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </div>

      <div className="love-reveal-footer hero-fade-enter hero-delay-4">
        <div className="love-reveal-date">
          <CalendarHeart size={16} />
          <span>Where It All Began</span>
          <time dateTime={settings.relationship_start_date}>{startDate}</time>
        </div>
        <i className="love-reveal-divider" aria-hidden="true" />
        <Link href="#the-story-begins" className="love-reveal-scroll">
          <span>Scroll into the story</span>
          <i className="love-scroll-bob" aria-hidden="true"><ArrowDown size={16} /></i>
        </Link>
      </div>
    </section>
  );
}
