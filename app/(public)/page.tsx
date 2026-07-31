import { ArrowDownRight, ArrowUpRight, CalendarHeart, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RelationshipCounter } from "@/components/public/RelationshipCounter";
import { SectionHeading } from "@/components/public/SectionHeading";
import { StoryCard } from "@/components/public/StoryCard";
import { getFeaturedStories, getPublishedStories, getSiteSettings } from "@/lib/queries/stories";

export default async function HomePage() {
  const [settings, stories, featured] = await Promise.all([
    getSiteSettings(),
    getPublishedStories(),
    getFeaturedStories(),
  ]);
  const now = new Date().toISOString();
  const preview = stories.slice(0, 3);
  const gallery = stories.flatMap((story) => [story.cover_image_url, ...story.story_images.map((image) => image.image_url)]).slice(0, 7);

  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">A personal archive · Est. {settings.relationship_start_date.slice(0, 4)}</p>
          <h1>{settings.person_one} <em>&</em><br />{settings.person_two}</h1>
          <p className="hero-tagline">{settings.tagline}</p>
          <div className="hero-actions">
            <Link className="button primary" href="/journey">Explore our story <ArrowDownRight size={17} /></Link>
            <Link className="button text" href="/gallery">View gallery <ArrowUpRight size={16} /></Link>
          </div>
          <div className="hero-date"><CalendarHeart size={17} /><span>Our story began</span><time>{settings.relationship_start_date}</time></div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrap">
            <Image src={settings.hero_image_url || "/placeholders/hero.webp"} alt={"A placeholder hero portrait for " + settings.person_one + " and " + settings.person_two} fill priority sizes="(max-width: 800px) 100vw, 58vw" />
          </div>
          <div className="hero-sticker"><Heart size={17} fill="currentColor" /><span>Our little universe</span></div>
          <span className="vertical-note">A life in little moments</span>
          <div className="hero-issue"><span>Vol. 01</span><small>Ongoing edition</small></div>
        </div>
      </section>

      <section className="counter-section">
        <p className="eyebrow">Since the day we chose us</p>
        <RelationshipCounter startDate={settings.relationship_start_date} now={now} />
      </section>

      <section className="section featured-section">
        <SectionHeading
          eyebrow="Featured chapters"
          title="The stories we return to."
          action={<Link className="text-link" href="/journey">View all stories <ArrowUpRight size={15} /></Link>}
        />
        <div className="featured-grid">
          {(featured.length ? featured : stories.slice(0, 2)).slice(0, 2).map((story, index) => (
            <StoryCard key={story.id} story={story} priority={index === 0} />
          ))}
        </div>
      </section>

      <section className="section journey-preview">
        <div className="journey-intro">
          <p className="eyebrow">Chronology of us</p>
          <h2>Not just the milestones.<br /><em>The life between them.</em></h2>
          <p>{settings.description}</p>
          <Link className="button outline" href="/journey">Walk through our journey <ArrowUpRight size={15} /></Link>
        </div>
        <div className="journey-preview-list">
          {preview.map((story, index) => (
            <Link key={story.id} href={"/story/" + story.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{story.event_date} · {story.category?.name}</small><strong>{story.title}</strong></div>
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
      </section>

      <section className="section gallery-preview-section">
        <SectionHeading
          eyebrow="The photo drawer"
          title="Fragments of our days."
          action={<Link className="text-link" href="/gallery">Open gallery <ArrowUpRight size={15} /></Link>}
        />
        <div className="gallery-preview">
          {gallery.map((image, index) => (
            <div key={image + index} className={"preview-photo photo-" + index}>
              <Image src={image} alt="Relationship memory placeholder" fill sizes="(max-width: 700px) 48vw, 24vw" />
            </div>
          ))}
        </div>
      </section>

      <section className="personal-quote">
        <span aria-hidden="true">“</span>
        <blockquote>{settings.quote}</blockquote>
        <p>{settings.person_one} & {settings.person_two} · still writing</p>
      </section>
    </main>
  );
}
