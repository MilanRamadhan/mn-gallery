import { StoryForm } from "@/components/admin/StoryForm";
import { getCategories } from "@/lib/queries/stories";

export default async function NewStoryPage() {
  return <StoryForm categories={await getCategories()} />;
}
