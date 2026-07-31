import type { Metadata } from "next";
import { JourneyExplorer } from "@/components/timeline/JourneyExplorer";
import { getCategories, getPublishedStories } from "@/lib/queries/stories";

export const metadata: Metadata = {
  title: "Our Journey",
  description: "Every chapter of our relationship, arranged by time.",
};

export default async function JourneyPage() {
  const [stories, categories] = await Promise.all([getPublishedStories(), getCategories()]);
  return (
    <main className="inner-page">
      <header className="page-hero split">
        <div><p className="eyebrow">Our journey</p><h1>Every chapter<br /><em>led us here.</em></h1></div>
        <p>A chronological journal of the firsts, the detours, the celebrations, and the wonderfully ordinary days.</p>
      </header>
      <JourneyExplorer stories={stories} categories={categories} />
    </main>
  );
}
