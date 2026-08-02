"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { AppImage } from "@/components/shared/AppImage";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  storyTitle: string;
  storySlug: string;
  date: string;
  category: string;
};

export default function ImageLightbox({
  item,
  onClose,
  onPrevious,
  onNext,
}: {
  item: GalleryImage | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "Tab") {
        const focusable = document.querySelectorAll<HTMLElement>(".lightbox button, .lightbox a");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [item, onClose, onNext, onPrevious]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={"Photo: " + item.caption}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={(event) => { startX.current = event.clientX; }}
          onPointerUp={(event) => {
            if (startX.current === null) return;
            const distance = event.clientX - startX.current;
            if (Math.abs(distance) > 55) {
              if (distance > 0) onPrevious();
              else onNext();
            }
            startX.current = null;
          }}
        >
          <button ref={closeRef} className="lightbox-close" type="button" aria-label="Close lightbox" onClick={onClose}><X /></button>
          <button className="lightbox-arrow previous" type="button" aria-label="Previous image" onClick={onPrevious}><ArrowLeft /></button>
          <motion.div
            className="lightbox-image"
            key={item.id}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AppImage src={item.url} alt={item.alt} fill sizes="95vw" />
          </motion.div>
          <button className="lightbox-arrow next" type="button" aria-label="Next image" onClick={onNext}><ArrowRight /></button>
          <div className="lightbox-caption">
            <div><small>{item.date} · {item.category}</small><p>{item.caption}</p></div>
            <Link href={"/story/" + item.storySlug}>Read {item.storyTitle} <ExternalLink size={14} /></Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
