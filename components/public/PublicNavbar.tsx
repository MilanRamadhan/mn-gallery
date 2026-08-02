"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/journey", label: "Our Journey" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Us" },
];

export function PublicNavbar({ coupleName }: { coupleName: string }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isQuietOpening = pathname === "/" && !scrolled;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <header className={"public-nav " + (scrolled || pathname !== "/" ? "solid" : "")}>
        <Link href="/" className="wordmark">
          <span>{isQuietOpening ? "A little beginning" : coupleName}</span>
          <small>{isQuietOpening ? "Scroll slowly" : "Our Story"}</small>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-nav"
            initial={reducedMotion ? false : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
          >
            <nav aria-label="Mobile navigation">
              {links.map((link, index) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  <span>0{index + 1}</span>{link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
