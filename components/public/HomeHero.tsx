"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowDownRight, ArrowUpRight, CalendarHeart, Heart } from "lucide-react";
import Link from "next/link";
import { AppImage } from "@/components/shared/AppImage";
import type { SiteSettings } from "@/types/story";

const littleMoments = [
  { label: "one simple hello", className: "fragment-one" },
  { label: "one more conversation", className: "fragment-two" },
  { label: "a feeling that stayed", className: "fragment-three" },
];

export function HomeHero({ settings }: { settings: SiteSettings }) {
  const reducedMotion = useReducedMotion();
  const revealMotion = reducedMotion
    ? {}
    : { opacity: [0, 1], y: [28, 0], filter: ["blur(8px)", "blur(0px)"] };

  return (
    <section className="cinematic-hero" aria-label="The beginning of Milan and Nora's story">
      <div className="hero-hook-stage">
        <div className="hero-hook-image" aria-hidden="true">
          <AppImage
            src={settings.hero_image_url || "/placeholders/hero.webp"}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-hook-grid" aria-hidden="true" />

        <motion.div
          className="hero-hook-copy"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="hook-kicker"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={revealMotion}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Not every love story begins loudly
          </motion.p>
          <h1>
            <motion.span
              initial={reducedMotion ? false : { opacity: 0, y: 34 }}
              animate={revealMotion}
              transition={{ delay: 0.45, duration: 0.85 }}
            >
              Some stories
            </motion.span>
            <motion.em
              initial={reducedMotion ? false : { opacity: 0, y: 34 }}
              animate={revealMotion}
              transition={{ delay: 0.75, duration: 0.85 }}
            >
              begin quietly.
            </motion.em>
          </h1>
          <motion.p
            className="hook-lede"
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={revealMotion}
            transition={{ delay: 1.1, duration: 0.75 }}
          >
            A late reply. An ordinary day. One small reason to keep the conversation going.
          </motion.p>
        </motion.div>

        <div className="hook-fragments" aria-hidden="true">
          {littleMoments.map((moment, index) => (
            <motion.span
              key={moment.label}
              className={moment.className}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.82 }}
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: [0, -10 - index * 2, 0], rotate: [-2 + index * 2, 1, -2 + index * 2] }
              }
              transition={{
                opacity: { delay: 1.25 + index * 0.16, duration: 0.55 },
                y: { delay: 1.7 + index * 0.2, duration: 4.5 + index, repeat: Infinity, ease: "easeInOut" },
                rotate: { delay: 1.7, duration: 5.5 + index, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {moment.label}
            </motion.span>
          ))}
        </div>

        <div className="hook-edition" aria-hidden="true">
          <span>01</span>
          <small>The quiet beginning</small>
        </div>

        <Link className="hero-scroll-cue" href="#our-story-reveal">
          <span>Follow the little moments</span>
          <motion.i
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={17} />
          </motion.i>
        </Link>
      </div>

      <div className="hero-reveal" id="our-story-reveal">
        <motion.div
          className="reveal-portrait"
          initial={reducedMotion ? false : { opacity: 0, rotate: -3, y: 45 }}
          whileInView={{ opacity: 1, rotate: -1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="reveal-image">
            <AppImage
              src={settings.hero_image_url || "/placeholders/hero.webp"}
              alt={`A memory from ${settings.person_one} and ${settings.person_two}'s story`}
              fill
              sizes="(max-width: 760px) 90vw, 42vw"
            />
          </div>
          <span className="reveal-photo-note">This is where the little moments led.</span>
          <div className="reveal-heart" aria-hidden="true"><Heart size={16} fill="currentColor" /></div>
        </motion.div>

        <motion.div
          className="reveal-copy"
          initial={reducedMotion ? false : { opacity: 0, x: 42 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="reveal-prelude">And somehow, that quiet beginning became...</p>
          <h2 className="reveal-names">
            {settings.person_one}<em>&</em>{settings.person_two}
          </h2>
          <p className="hero-tagline">{settings.tagline}</p>
          <div className="hero-actions">
            <Link className="button primary" href="/journey">
              Enter our story <ArrowDownRight size={17} />
            </Link>
            <Link className="button text" href="/gallery">
              Peek at the photos <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-date">
            <CalendarHeart size={17} />
            <span>The first page</span>
            <time>{settings.relationship_start_date}</time>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
