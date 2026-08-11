"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/journey", label: "Our Journey" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Us" },
];

export function PublicNavbar({ coupleName }: { coupleName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollFrameRef = useRef<number | null>(null);
  const scrolledRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isQuietOpening = pathname === "/" && !scrolled;

  useEffect(() => {
    const update = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 24;
        if (nextScrolled !== scrolledRef.current) {
          scrolledRef.current = nextScrolled;
          setScrolled(nextScrolled);
        }
        scrollFrameRef.current = null;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      links.forEach((link) => {
        if (link.href !== pathname) router.prefetch(link.href);
      });
    }, 2_000);
    return () => window.clearTimeout(timer);
  }, [pathname, router]);

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
      {open ? (
        <div className="mobile-nav mobile-nav-enter">
          <nav aria-label="Mobile navigation">
            {links.map((link, index) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                <span>0{index + 1}</span>{link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
