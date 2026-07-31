import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";
import { getCategories, getPublishedStories } from "@/lib/queries/stories";

export const metadata: Metadata = {
  title: "Gallery",
  description: "An editorial gallery of photographs from our shared story.",
};

export default async function GalleryPage() {
  const [stories, categories] = await Promise.all([getPublishedStories(), getCategories()]);
  return (
    <main className="inner-page gallery-page">
      <header className="page-hero">
        <p className="eyebrow">The photo drawer</p>
        <h1>Proof that we<br /><em>were here.</em></h1>
        <p>Every frame holds a little context. Tap a photograph to read what happened around it.</p>
      </header>
      <GalleryExplorer stories={stories} categories={categories} />
    </main>
  );
}
