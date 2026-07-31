import { notFound } from "next/navigation";
import { StoryForm } from "@/components/admin/StoryForm";
import { getAdminStoryById, getCategories } from "@/lib/queries/stories";

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [story, categories] = await Promise.all([getAdminStoryById(id), getCategories()]);
  if (!story) notFound();
  return <StoryForm categories={categories} initialStory={story} />;
}
