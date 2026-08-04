"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, CalendarHeart, MousePointer2 } from "lucide-react";
import Link from "next/link";
import type { PointerEvent as ReactPointerEvent } from "react";
import { AppImage } from "@/components/shared/AppImage";
import type { SiteSettings } from "@/types/story";

export function HomeHero({ settings }: { settings: SiteSettings }) {
  const reducedMotion = useReducedMotion();
  const heroImage = settings.hero_image_url || "/placeholders/hero.webp";
  const startDate = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(settings.relationship_start_date + "T00:00:00Z"));

  const moveReveal = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(90, Math.max(10, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(88, Math.max(12, ((event.clientY - bounds.top) / bounds.height) * 100));
    event.currentTarget.style.setProperty("--reveal-x", `${x}%`);
    event.currentTarget.style.setProperty("--reveal-y", `${y}%`);
  };

  const resetReveal = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--reveal-x", "68%");
    event.currentTarget.style.setProperty("--reveal-y", "42%");
  };

  return (
    <section
      className="cinematic-hero love-reveal-hero"
      aria-label="An interactive introduction to Milan and Nora's story"
      onPointerMove={moveReveal}
      onPointerLeave={resetReveal}
    >
      <div className="love-reveal-backdrop" aria-hidden="true">
        <AppImage src={heroImage} alt="" fill priority sizes="100vw" />
      </div>

      <motion.div
        className="love-photo love-photo-base"
        initial={reducedMotion ? false : { opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 1.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="love-photo-frame">
          <AppImage
            src={heroImage}
            alt={`A memory from ${settings.person_one} and ${settings.person_two}'s story`}
            fill
            priority
            sizes="(min-width: 761px) 50vw, 100vw"
          />
        </div>
      </motion.div>

      <motion.div
        className="love-photo love-photo-color"
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reducedMotion ? 0 : 0.65, duration: reducedMotion ? 0 : 1 }}
      >
        <div className="love-photo-frame">
          <AppImage src={heroImage} alt="" fill priority sizes="(min-width: 761px) 50vw, 100vw" />
        </div>
      </motion.div>

      <div className="love-reveal-shade" aria-hidden="true" />
      <div className="love-reveal-grid" aria-hidden="true" />
      <div className="love-reveal-noise" aria-hidden="true" />

      <motion.div
        className="love-reveal-label"
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.35, duration: 0.6 }}
      >
        <MousePointer2 size={13} />
        <span>Move to reveal us</span>
      </motion.div>

      <div className="love-reveal-copy">
        <motion.div
          className="love-reveal-kicker"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.65 }}
        >
          <span>Before there was a story</span>
          <i />
          <span>there was one conversation</span>
        </motion.div>

        <h1>
          <span className="love-line-mask">
            <motion.span
              initial={reducedMotion ? false : { y: "112%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.28, duration: 0.88, ease: [0.22, 1, 0.36, 1] }}
            >
              She texted
            </motion.span>
          </span>
          <span className="love-line-mask love-line-pink">
            <motion.em
              initial={reducedMotion ? false : { y: "112%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.48, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              the wrong person—
            </motion.em>
          </span>
          <span className="love-line-mask love-line-last">
            <motion.strong
              initial={reducedMotion ? false : { y: "112%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.68, duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
            >
              and somehow found
            </motion.strong>
          </span>
          <span className="love-line-mask love-line-blue">
            <motion.strong
              initial={reducedMotion ? false : { y: "112%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.84, duration: 0.94, ease: [0.22, 1, 0.36, 1] }}
            >
              the right one.
            </motion.strong>
          </span>
        </h1>

        <motion.div
          className="love-reveal-details"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          <p>
            The message was an accident. Everything after it became a choice.
            <span>{settings.tagline}</span>
          </p>
          <div className="love-reveal-actions">
            <Link className="button primary" href="/journey">Enter our story <ArrowUpRight size={16} /></Link>
            <Link className="button text" href="/gallery">See the evidence <ArrowUpRight size={16} /></Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="love-reveal-footer"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.25, duration: 0.7 }}
      >
        <div className="love-reveal-date">
          <CalendarHeart size={16} />
          <span>Where It All Began</span>
          <time dateTime={settings.relationship_start_date}>{startDate}</time>
        </div>
        <i className="love-reveal-divider" aria-hidden="true" />
        <Link href="#the-story-begins" className="love-reveal-scroll">
          <span>Scroll into the story</span>
          <motion.i
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={16} />
          </motion.i>
        </Link>
      </motion.div>
    </section>
  );
}
