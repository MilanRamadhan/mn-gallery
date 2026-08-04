import { StoryForm } from "@/components/admin/StoryForm";
import { getAdminStories, getCategories } from "@/lib/queries/stories";

export default async function NewStoryPage() {
  const [categories, stories] = await Promise.all([getCategories(), getAdminStories()]);
  return <StoryForm categories={categories} suggestedStoryNumber={stories.length + 1} />;
}
