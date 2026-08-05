import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import type { StoryPreview } from "@/types/story";
import { AppImage } from "@/components/shared/AppImage";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value + "T00:00:00Z"));

export function StoryCard({ story, priority = false, variant = "default" }: { story: StoryPreview; priority?: boolean; variant?: "default" | "compact" }) {
  return (
    <article className={"story-card " + variant}>
      <Link href={"/story/" + story.slug} className="story-image">
        <AppImage
          src={story.cover_image_url}
          alt={"Cover for " + story.title}
          fill
          priority={priority}
          sizes={variant === "compact" ? "(max-width: 700px) 86vw, 32vw" : "(max-width: 700px) 92vw, 44vw"}
        />
      </Link>
      <div className="story-card-copy">
        <div className="story-meta">
          <span>{story.category?.name ?? "Memory"}</span>
          <span>{formatDate(story.event_date)}</span>
        </div>
        <h3><Link href={"/story/" + story.slug}>{story.title}</Link></h3>
        <p>{story.excerpt}</p>
        <div className="story-card-footer">
          {story.location && <span><MapPin size={13} /> {story.location}</span>}
          <Link href={"/story/" + story.slug} aria-label={"Read " + story.title}><ArrowUpRight size={18} /></Link>
        </div>
      </div>
    </article>
  );
}
