import { notFound } from "next/navigation";
import { AppImage } from "@/components/shared/AppImage";
import { getLetterBySlug } from "@/lib/queries/letters";
import { StorySoundtrack } from "@/components/public/StorySoundtrack";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function PublicLetterPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const letter = await getLetterBySlug(params.slug);

  if (!letter) {
    notFound();
  }

  // Use the excerpt as an intro text if available.
  // Use the content as the main letter body.
  // Style with a dark, intimate vibe.

  return (
    <main className="public-letter-page" style={{ 
      backgroundColor: "#111", 
      color: "#fff", 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center"
    }}>
      {letter.cover_image_url && (
        <div className="letter-cover-ambient" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.15,
          zIndex: 0,
          pointerEvents: "none",
        }}>
          <AppImage 
            src={letter.cover_image_url} 
            alt="" 
            fill 
            style={{ objectFit: "cover" }} 
            priority
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent, #111 80%)"
          }} />
        </div>
      )}

      <div className="letter-content-wrapper" style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "600px",
        width: "100%",
        padding: "4rem 2rem",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "3rem",
      }}>
        <header className="letter-header" style={{ textAlign: "center" }}>
          <small style={{ 
            display: "block", 
            marginBottom: "1rem", 
            letterSpacing: "0.1em", 
            textTransform: "uppercase", 
            opacity: 0.6,
            fontSize: "0.85rem"
          }}>
            {new Date(letter.letter_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </small>
          <h1 style={{ 
            fontFamily: "var(--font-serif)", 
            fontSize: "2.5rem", 
            fontWeight: "normal",
            lineHeight: 1.2
          }}>{letter.title}</h1>
        </header>

        {letter.excerpt && (
          <p style={{
            fontStyle: "italic",
            opacity: 0.8,
            textAlign: "center",
            fontSize: "1.1rem"
          }}>
            {letter.excerpt}
          </p>
        )}

        <div className="letter-body" style={{
          whiteSpace: "pre-wrap",
          fontSize: "1.1rem",
          lineHeight: 1.8,
          opacity: 0.9,
          fontFamily: "var(--font-serif)"
        }}>
          {letter.content}
        </div>

        {letter.signature && (
          <div className="letter-signature" style={{
            marginTop: "2rem",
            textAlign: "right",
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem",
            fontStyle: "italic",
            opacity: 0.9
          }}>
            {letter.signature}
          </div>
        )}

        <div className="letter-footer" style={{
          marginTop: "4rem",
          display: "flex",
          justifyContent: "center",
          opacity: 0.7,
          transition: "opacity 0.3s"
        }}>
          <Link href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "inherit",
            textDecoration: "none",
            fontSize: "0.9rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "0.7")}
          >
            Walk through our story <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {letter.youtube_video_id && (
        <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 10 }}>
          <StorySoundtrack videoId={letter.youtube_video_id} />
        </div>
      )}
    </main>
  );
}
