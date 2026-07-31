import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedStories, getStoryBySlug } from "@/lib/queries/stories";

type StoryPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: "Story not found" };
  return { title: story.title, description: story.excerpt };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const [story, stories] = await Promise.all([getStoryBySlug(slug), getPublishedStories()]);
  if (!story) notFound();
  const currentIndex = stories.findIndex((item) => item.id === story.id);
  const previous = currentIndex < stories.length - 1 ? stories[currentIndex + 1] : null;
  const next = currentIndex > 0 ? stories[currentIndex - 1] : null;
  const paragraphs = story.content.split(/\n{2,}/).filter(Boolean);

  return (
    <main className="story-page">
      <header className="story-header">
        <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/journey">Journey</Link><span>/</span><span>{story.title}</span></nav>
        <p className="eyebrow">{story.category?.name ?? "Memory"}</p>
        <h1>{story.title}</h1>
        <p className="story-deck">{story.excerpt}</p>
        <div className="story-header-meta">
          <span><CalendarDays size={15} />{new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(story.event_date + "T00:00:00Z"))}</span>
          {story.location && <span><MapPin size={15} />{story.location}</span>}
        </div>
      </header>
      <div className="story-cover">
        <Image src={story.cover_image_url} alt={"Cover for " + story.title} fill priority sizes="100vw" />
        <span>Story no. {String(currentIndex + 1).padStart(2, "0")}</span>
      </div>
      <article className="story-article">
        <aside><span>{story.event_date.slice(0, 4)}</span><p>{story.category?.name}</p></aside>
        <div className="prose">
          {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {story.quote && <blockquote>{story.quote}</blockquote>}
        </div>
      </article>
      {story.story_images.length > 0 && (
        <section className="story-gallery">
          {story.story_images.sort((a, b) => a.display_order - b.display_order).map((image, index) => (
            <figure key={image.id} className={"story-figure figure-" + (index % 3)}>
              <div><Image src={image.image_url} alt={image.alt_text || "Photo from " + story.title} fill sizes="(max-width: 700px) 100vw, 72vw" /></div>
              {image.caption && <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{image.caption}</figcaption>}
            </figure>
          ))}
        </section>
      )}
      <nav className="story-navigation" aria-label="Story navigation">
        {previous ? <Link href={"/story/" + previous.slug}><ArrowLeft /><span><small>Previous chapter</small>{previous.title}</span></Link> : <span />}
        {next && <Link href={"/story/" + next.slug}><span><small>Next chapter</small>{next.title}</span><ArrowRight /></Link>}
      </nav>
      <Link className="back-journey" href="/journey"><ArrowLeft size={15} /> Back to the full journey</Link>
    </main>
  );
}
