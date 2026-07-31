"use client";

import { Edit3, Eye, EyeOff, Search, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteStoryAction, toggleStoryStatusAction } from "@/lib/actions/story-actions";
import type { Category, Story } from "@/types/story";
import { ConfirmDialog } from "./ConfirmDialog";

export function StoryList({ stories, categories }: { stories: Story[]; categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Story | null>(null);
  const [pending, startTransition] = useTransition();
  const filtered = useMemo(
    () =>
      stories.filter(
        (story) =>
          story.title.toLowerCase().includes(search.toLowerCase()) &&
          (status === "all" || story.status === status) &&
          (category === "all" || story.category_id === category),
      ),
    [category, search, status, stories],
  );

  const toggle = (story: Story) => {
    startTransition(async () => {
      const result = await toggleStoryStatusAction(story.id, story.status === "published" ? "draft" : "published");
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const remove = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteStoryAction(deleteTarget.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setDeleteTarget(null);
    });
  };

  return (
    <>
      <div className="admin-filters">
        <label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stories" aria-label="Search stories" /></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <span>{filtered.length} results</span>
      </div>
      <div className="story-admin-list" aria-busy={pending}>
        <div className="story-list-head"><span>Story</span><span>Date</span><span>Status</span><span>Actions</span></div>
        {filtered.map((story) => (
          <article key={story.id}>
            <div className="admin-story-title">
              <div><Image src={story.cover_image_url} alt="" fill sizes="72px" /></div>
              <span><strong>{story.title}</strong><small>{story.category?.name ?? "Uncategorised"}{story.is_featured && <> · <Sparkles size={11} /> Featured</>}</small></span>
            </div>
            <time>{story.event_date}</time>
            <span className={"status-pill " + story.status}>{story.status}</span>
            <div className="story-row-actions">
              {story.status === "published" && <Link href={"/story/" + story.slug} target="_blank" aria-label={"Preview " + story.title}><Eye size={16} /></Link>}
              <Link href={"/admin/stories/" + story.id + "/edit"} aria-label={"Edit " + story.title}><Edit3 size={16} /></Link>
              <button type="button" aria-label={(story.status === "published" ? "Unpublish " : "Publish ") + story.title} onClick={() => toggle(story)}>{story.status === "published" ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              <button type="button" aria-label={"Delete " + story.title} onClick={() => setDeleteTarget(story)}><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="admin-empty"><h2>No stories match.</h2><p>Change a filter or begin a new chapter.</p></div>}
      </div>
      <ConfirmDialog open={Boolean(deleteTarget)} title={"Delete “" + (deleteTarget?.title ?? "") + "”?"} message="The database record will be removed first, then its stored photographs. This cannot be undone." confirmLabel="Delete story" destructive onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </>
  );
}
