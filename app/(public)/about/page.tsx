import { CalendarHeart, Images, MapPinned, NotebookText } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { RelationshipCounter } from "@/components/public/RelationshipCounter";
import { getPublishedStories, getSiteSettings } from "@/lib/queries/stories";

export const metadata: Metadata = {
  title: "About Us",
  description: "The people and intention behind Our Story.",
};

export default async function AboutPage() {
  const [settings, stories] = await Promise.all([getSiteSettings(), getPublishedStories()]);
  const memories = stories.reduce((total, story) => total + story.story_images.length + 1, 0);
  const places = new Set(stories.map((story) => story.location).filter(Boolean)).size;
  return (
    <main className="about-page">
      <header className="about-hero">
        <div className="about-title"><p className="eyebrow">About us</p><h1>Two people,<br /><em>one growing archive.</em></h1></div>
        <div className="about-portrait"><Image src={settings.couple_image_url || "/placeholders/couple.webp"} alt={"Portrait placeholder for " + settings.person_one + " and " + settings.person_two} fill priority sizes="(max-width: 800px) 92vw, 50vw" /></div>
        <p className="about-intro">{settings.about_content}</p>
      </header>
      <section className="about-stats">
        <div><CalendarHeart /><strong><RelationshipCounter startDate={settings.relationship_start_date} now={new Date().toISOString()} compact /></strong><span>Since {settings.relationship_start_date}</span></div>
        <div><Images /><strong>{memories}</strong><span>Memories saved</span></div>
        <div><MapPinned /><strong>{places}</strong><span>Places remembered</span></div>
        <div><NotebookText /><strong>{stories.length}</strong><span>Stories written</span></div>
      </section>
      <section className="about-letter">
        <div><p className="eyebrow">A note for future us</p><h2>May we keep noticing the little things.</h2></div>
        <div className="letter-copy">
          <p>We made this place because memory is tender. Dates blur, details soften, and the exact sound of a laugh can be difficult to hold.</p>
          <p>So this is our attempt to keep the context—not only where we went, but how the day felt. Not only the anniversaries, but the coffee runs and quiet Sundays that made a life around them.</p>
          <blockquote>“{settings.quote}”</blockquote>
          <p className="signature">{settings.person_one} & {settings.person_two}</p>
        </div>
      </section>
    </main>
  );
}
