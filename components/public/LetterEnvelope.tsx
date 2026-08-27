"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppImage } from "@/components/shared/AppImage";
import type { Letter } from "@/types/story";

export function LetterEnvelope({ letter }: { letter: Letter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    // After flap opens (0.6s) and paper slides up (0.8s), transition to reading mode
    setTimeout(() => {
      setIsReading(true);
    }, 1500);
  };

  const formattedDate = new Date(letter.letter_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <style>{`
        .envelope-scene {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          overflow: hidden;
          background-color: #0f1115; /* Deep aesthetic dark background */
          color: #fff;
        }

        .envelope-background-ambient {
          position: absolute;
          inset: 0;
          opacity: 0.2;
          pointer-events: none;
          z-index: 0;
        }

        .envelope-container {
          position: relative;
          width: 90vw;
          max-width: 400px;
          height: 280px;
          z-index: 10;
        }

        .envelope-back {
          position: absolute;
          inset: 0;
          background: #d6c5b3; /* Darker inside */
          border-radius: 8px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .envelope-paper-preview {
          position: absolute;
          left: 16px;
          right: 16px;
          top: 16px;
          bottom: 16px;
          background: #fdfbf7;
          border-radius: 4px;
          z-index: 2;
          box-shadow: 0 -5px 15px rgba(0,0,0,0.1);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
        }

        .paper-line {
          height: 8px;
          background: #e5e0d8;
          border-radius: 4px;
          width: 100%;
        }
        .paper-line.short {
          width: 60%;
        }

        .envelope-front {
          position: absolute;
          inset: 0;
          background: #e8d8c8;
          clip-path: polygon(0% 0%, 50% 55%, 100% 0%, 100% 100%, 0% 100%);
          z-index: 5;
          border-radius: 8px;
          /* Inner shadow effect for flaps */
          box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
        }

        .envelope-flap {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 65%;
          background: #ebdace;
          clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
          transform-origin: top;
          z-index: 10;
          border-radius: 8px 8px 0 0;
        }

        .wax-seal {
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 48px;
          height: 48px;
          background: #8b2635; /* Deep red wax */
          border-radius: 50%;
          z-index: 11;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: bold;
          font-size: 1.5rem;
          color: #d17a86;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2);
          border: 2px solid #7a1f2b;
        }

        .tap-hint {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.6;
          white-space: nowrap;
        }

        .letter-reading-view {
          position: relative;
          z-index: 20;
          width: 100%;
          max-width: 640px;
          min-height: 80vh;
          background: #fdfbf7;
          color: #2c2825;
          padding: 4rem 3rem;
          border-radius: 8px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
          margin: 4rem auto;
          font-family: var(--font-serif);
        }
          
        @media (max-width: 600px) {
          .letter-reading-view {
            padding: 3rem 1.5rem;
            min-height: 100vh;
            margin: 0;
            border-radius: 0;
          }
        }

        .letter-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .letter-date {
          display: block;
          margin-bottom: 1rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.5;
          font-size: 0.85rem;
          font-family: sans-serif;
        }

        .letter-title {
          font-size: 2.2rem;
          font-weight: normal;
          line-height: 1.3;
          color: #1a1816;
        }

        .letter-body {
          white-space: pre-wrap;
          font-size: 1.15rem;
          line-height: 1.8;
          opacity: 0.9;
        }

        .letter-signature {
          margin-top: 3rem;
          text-align: right;
          font-size: 1.25rem;
          font-style: italic;
          opacity: 0.9;
        }

        .letter-footer {
          margin-top: 5rem;
          display: flex;
          justify-content: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(0,0,0,0.05);
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: inherit;
          text-decoration: none;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          opacity: 0.6;
          font-family: sans-serif;
          transition: opacity 0.3s;
        }
        .nav-link:hover {
          opacity: 1;
        }
      `}</style>

      <div className="envelope-scene">
        {letter.cover_image_url && (
          <div className="envelope-background-ambient">
            <AppImage 
              src={letter.cover_image_url} 
              alt="" 
              fill 
              style={{ objectFit: "cover" }} 
              priority
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #0f1115, transparent, #0f1115)" }} />
          </div>
        )}

        <AnimatePresence>
          {!isReading && (
            <motion.div 
              className="envelope-container"
              onClick={handleOpen}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
              style={{ cursor: isOpen ? "default" : "pointer" }}
              whileHover={!isOpen ? { y: -5 } : {}}
            >
              <div className="envelope-back" />
              
              <motion.div 
                className="envelope-paper-preview"
                initial={{ y: 0 }}
                animate={isOpen ? { y: -180 } : { y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="paper-line" />
                <div className="paper-line" />
                <div className="paper-line short" />
                <div className="paper-line" style={{ marginTop: "12px" }} />
                <div className="paper-line" />
              </motion.div>

              <div className="envelope-front" />

              <motion.div 
                className="envelope-flap"
                initial={{ rotateX: 0 }}
                animate={isOpen ? { rotateX: 180, zIndex: 0 } : { rotateX: 0, zIndex: 10 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              >
                <motion.div 
                  className="wax-seal"
                  animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  M
                </motion.div>
              </motion.div>

              {!isOpen && (
                <motion.div 
                  className="tap-hint"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Tap to open
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isReading && (
            <motion.div 
              className="letter-reading-view"
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="letter-header">
                <span className="letter-date">{formattedDate}</span>
                <h1 className="letter-title">{letter.title}</h1>
              </header>

              {letter.excerpt && (
                <p style={{ fontStyle: "italic", opacity: 0.8, textAlign: "center", fontSize: "1.1rem", marginBottom: "3rem" }}>
                  {letter.excerpt}
                </p>
              )}

              <div className="letter-body">
                {letter.content}
              </div>

              {letter.signature && (
                <div className="letter-signature">
                  {letter.signature}
                </div>
              )}

              <div className="letter-footer">
                <Link href="/" className="nav-link">
                  Walk through our story <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
