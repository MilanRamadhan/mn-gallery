import { ArrowUpRight, BookOpenText, FilePenLine, FolderHeart, Images, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DashboardStat } from "@/components/admin/DashboardStat";
import { getAdminStories, getCategories } from "@/lib/queries/stories";

export default async function AdminDashboard() {
  const [stories, categories] = await Promise.all([getAdminStories(), getCategories()]);
  const published = stories.filter((story) => story.status === "published");
  const drafts = stories.filter((story) => story.status === "draft");
  const photos = stories.reduce((total, story) => total + story.story_images.length + 1, 0);
  const featured = stories.filter((story) => story.is_featured);
  return (
    <>
      <header className="admin-page-heading">
        <div><p className="eyebrow">Private archive</p><h1>Good to have you back.</h1><p>Here is what your story looks like today.</p></div>
        <Link className="button primary" href="/admin/stories/new"><Plus size={16} />Add new story</Link>
      </header>
      <section className="dashboard-stats">
        <DashboardStat label="Published" value={published.length} detail="Visible chapters" icon={BookOpenText} />
        <DashboardStat label="Drafts" value={drafts.length} detail="Still being written" icon={FilePenLine} />
        <DashboardStat label="Photographs" value={photos} detail="Across every story" icon={Images} />
        <DashboardStat label="Categories" value={categories.length} detail="Ways to remember" icon={FolderHeart} />
      </section>
      <section className="admin-dashboard-grid">
        <div className="recent-stories">
          <div className="admin-section-heading"><div><p className="eyebrow">Recently touched</p><h2>Latest stories</h2></div><Link href="/admin/stories">Manage all <ArrowUpRight size={14} /></Link></div>
          {stories.slice(0, 5).map((story) => (
            <Link key={story.id} href={"/admin/stories/" + story.id + "/edit"}>
              <div><Image src={story.cover_image_url} alt="" fill sizes="64px" /></div>
              <span><strong>{story.title}</strong><small>{story.event_date} · {story.status}</small></span>
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
        <aside className="featured-admin">
          <div className="admin-section-heading"><div><p className="eyebrow">Homepage curation</p><h2>Featured</h2></div><Sparkles size={17} /></div>
          {featured.length ? featured.slice(0, 3).map((story) => (
            <Link key={story.id} href={"/admin/stories/" + story.id + "/edit"}><strong>{story.title}</strong><span>{story.category?.name ?? "Memory"}</span></Link>
          )) : <p>No featured stories yet. Choose one from the story editor.</p>}
          <Link className="button outline" href="/" target="_blank">View public website <ArrowUpRight size={14} /></Link>
        </aside>
      </section>
    </>
  );
}
