"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Story } from "@/types/story";
import { EmptyState } from "@/components/public/EmptyState";

export function JourneyExplorer({ stories, categories }: { stories: Story[]; categories: Category[] }) {
  const years = Array.from(new Set(stories.map((story) => story.event_date.slice(0, 4)))).sort().reverse();
  const [year, setYear] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    const result = stories.filter(
      (story) =>
        (year === "all" || story.event_date.startsWith(year)) &&
        (category === "all" || story.category?.slug === category),
    );
    return result.sort((a, b) =>
      sort === "newest"
        ? b.event_date.localeCompare(a.event_date)
        : a.event_date.localeCompare(b.event_date),
    );
  }, [category, sort, stories, year]);

  return (
    <>
      <div className="filter-bar" aria-label="Journey filters">
        <label>Year<select value={year} onChange={(event) => setYear(event.target.value)}><option value="all">All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
        <label>Order<select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
        <span>{filtered.length} stories</span>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No stories found" message="Try another year or category. The memory may be waiting in a different chapter." />
      ) : (
        <div className="journey-timeline">
          {filtered.map((story, index) => (
            <article key={story.id} className="timeline-entry">
              <div className="timeline-date">
                <span>{story.event_date.slice(0, 4)}</span>
                <time dateTime={story.event_date}>
                  {new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(story.event_date + "T00:00:00Z"))}
                </time>
              </div>
              <div className="timeline-dot"><span>{String(index + 1).padStart(2, "0")}</span></div>
              <div className="timeline-card">
                <Link href={"/story/" + story.slug} className="timeline-image">
                  <Image src={story.cover_image_url} alt={"Cover for " + story.title} fill sizes="(max-width: 760px) 92vw, 42vw" />
                </Link>
                <div>
                  <p className="eyebrow">{story.category?.name ?? "Memory"}</p>
                  <h2>{story.title}</h2>
                  {story.location && <span className="location"><MapPin size={14} />{story.location}</span>}
                  <p>{story.excerpt}</p>
                  <Link href={"/story/" + story.slug}>Read story <ArrowUpRight size={15} /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
