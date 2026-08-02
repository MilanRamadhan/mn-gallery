"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Category, Story } from "@/types/story";
import type { GalleryImage } from "./ImageLightbox";
import { EmptyState } from "@/components/public/EmptyState";
import { AppImage } from "@/components/shared/AppImage";

const ImageLightbox = dynamic(() => import("./ImageLightbox"), { ssr: false });

function flattenImages(stories: Story[]): GalleryImage[] {
  return stories.flatMap((story) => [
    {
      id: story.id + "-cover",
      url: story.cover_image_url,
      alt: "Cover for " + story.title,
      caption: story.excerpt,
      storyTitle: story.title,
      storySlug: story.slug,
      date: story.event_date,
      category: story.category?.name ?? "Memory",
    },
    ...story.story_images
      .sort((a, b) => a.display_order - b.display_order)
      .map((image) => ({
        id: image.id,
        url: image.image_url,
        alt: image.alt_text || "Photo from " + story.title,
        caption: image.caption || story.title,
        storyTitle: story.title,
        storySlug: story.slug,
        date: story.event_date,
        category: story.category?.name ?? "Memory",
      })),
  ]);
}

export function GalleryExplorer({ stories, categories }: { stories: Story[]; categories: Category[] }) {
  const allImages = useMemo(() => flattenImages(stories), [stories]);
  const years = Array.from(new Set(allImages.map((image) => image.date.slice(0, 4)))).sort().reverse();
  const [year, setYear] = useState("all");
  const [category, setCategory] = useState("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const images = allImages.filter(
    (image) =>
      (year === "all" || image.date.startsWith(year)) &&
      (category === "all" || image.category === category),
  );
  const activeIndex = images.findIndex((image) => image.id === activeId);
  const active = activeIndex >= 0 ? images[activeIndex] : null;
  const previous = () => {
    if (!images.length) return;
    const index = activeIndex <= 0 ? images.length - 1 : activeIndex - 1;
    setActiveId(images[index].id);
  };
  const next = () => {
    if (!images.length) return;
    const index = activeIndex >= images.length - 1 ? 0 : activeIndex + 1;
    setActiveId(images[index].id);
  };

  return (
    <>
      <div className="filter-bar gallery-filters">
        <label>Year<select value={year} onChange={(event) => setYear(event.target.value)}><option value="all">All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
        <span>{images.length} photographs</span>
      </div>
      {images.length === 0 ? (
        <EmptyState title="The gallery is quiet" message="No photographs match these filters yet." />
      ) : (
        <div className="editorial-gallery">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={"gallery-item item-" + (index % 7)}
              onClick={() => setActiveId(image.id)}
              aria-label={"Open " + image.caption}
            >
              <AppImage src={image.url} alt={image.alt} fill sizes="(max-width: 620px) 48vw, (max-width: 1000px) 32vw, 24vw" />
              <span><small>{image.date.slice(0, 4)}</small><strong>{image.storyTitle}</strong></span>
            </button>
          ))}
        </div>
      )}
      <ImageLightbox item={active} onClose={() => setActiveId(null)} onPrevious={previous} onNext={next} />
    </>
  );
}
