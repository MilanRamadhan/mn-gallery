import { notFound } from "next/navigation";
import { StoryForm } from "@/components/admin/StoryForm";
import { getAdminStories, getAdminStoryById, getCategories, orderStoriesByJourney } from "@/lib/queries/stories";

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [story, categories, stories] = await Promise.all([
    getAdminStoryById(id),
    getCategories(),
    getAdminStories(),
  ]);
  if (!story) notFound();
  const storyNumber = orderStoriesByJourney(stories).findIndex((item) => item.id === story.id) + 1;
  return <StoryForm categories={categories} initialStory={story} suggestedStoryNumber={storyNumber} />;
}
