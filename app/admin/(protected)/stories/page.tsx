import { Plus } from "lucide-react";
import Link from "next/link";
import { StoryList } from "@/components/admin/StoryList";
import { getAdminStories, getCategories } from "@/lib/queries/stories";

export default async function AdminStoriesPage() {
  const [stories, categories] = await Promise.all([getAdminStories(), getCategories()]);
  return (
    <>
      <header className="admin-page-heading">
        <div><p className="eyebrow">Content library</p><h1>Stories</h1><p>Draft, publish, feature, and edit every chapter from one place.</p></div>
        <Link className="button primary" href="/admin/stories/new"><Plus size={16} />New story</Link>
      </header>
      <StoryList stories={stories} categories={categories} />
    </>
  );
}
