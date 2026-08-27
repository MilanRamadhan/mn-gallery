"use client";

import { Copy, Edit3, Eye, EyeOff, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteLetterAction, toggleLetterStatusAction } from "@/lib/actions/letter-actions";
import type { Letter } from "@/types/story";
import { AppImage } from "@/components/shared/AppImage";
import { ConfirmDialog } from "./ConfirmDialog";

export function LetterList({ letters }: { letters: Letter[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Letter | null>(null);
  const [pending, startTransition] = useTransition();
  const filtered = useMemo(
    () =>
      letters.filter(
        (letter) =>
          letter.title.toLowerCase().includes(search.toLowerCase()) &&
          (status === "all" || letter.status === status)
      ),
    [search, status, letters],
  );

  const toggle = (letter: Letter) => {
    startTransition(async () => {
      const result = await toggleLetterStatusAction(letter.id, letter.status === "published" ? "draft" : "published");
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const remove = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteLetterAction(deleteTarget.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setDeleteTarget(null);
    });
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/letters/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link.");
    });
  };

  return (
    <>
      <div className="admin-filters">
        <label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search letters" aria-label="Search letters" /></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select></label>
        <span>{filtered.length} results</span>
      </div>
      <div className="story-admin-list" aria-busy={pending}>
        <div className="story-list-head" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}><span>Letter</span><span>Date</span><span>Status</span><span>Actions</span></div>
        {filtered.map((letter) => (
          <article key={letter.id} style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
            <div className="admin-story-title">
              <div>{letter.cover_image_url && <AppImage src={letter.cover_image_url} alt="" fill sizes="72px" />}</div>
              <span><strong>{letter.title}</strong></span>
            </div>
            <time>{letter.letter_date}</time>
            <span className={"status-pill " + letter.status}>{letter.status}</span>
            <div className="story-row-actions">
              {letter.status === "published" && (
                <>
                  <Link href={"/letters/" + letter.slug} target="_blank" aria-label={"Preview " + letter.title}><Eye size={16} /></Link>
                  <button type="button" aria-label="Copy link" onClick={() => copyLink(letter.slug)}><Copy size={16} /></button>
                </>
              )}
              <Link href={"/admin/letters/" + letter.id + "/edit"} aria-label={"Edit " + letter.title}><Edit3 size={16} /></Link>
              <button type="button" aria-label={(letter.status === "published" ? "Unpublish " : "Publish ") + letter.title} onClick={() => toggle(letter)}>{letter.status === "published" ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              <button type="button" aria-label={"Delete " + letter.title} onClick={() => setDeleteTarget(letter)}><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="admin-empty"><h2>No letters match.</h2><p>Change a filter or write a new letter.</p></div>}
      </div>
      <ConfirmDialog open={Boolean(deleteTarget)} title={"Delete “" + (deleteTarget?.title ?? "") + "”?"} message="The database record will be removed first, then its stored photograph. This cannot be undone." confirmLabel="Delete letter" destructive onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </>
  );
}
