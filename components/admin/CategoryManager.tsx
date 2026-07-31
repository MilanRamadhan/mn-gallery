"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/actions/story-actions";
import { slugify } from "@/lib/validations/story";
import type { Category } from "@/types/story";
import { ConfirmDialog } from "./ConfirmDialog";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => { setEditing(null); setName(""); setSlug(""); setDescription(""); };
  const edit = (category: Category) => { setEditing(category); setName(category.name); setSlug(category.slug); setDescription(category.description ?? ""); };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveCategoryAction({ id: editing?.id, name, slug, description, icon: editing?.icon ?? "" });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      if (result.success) reset();
    });
  };
  const remove = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(deleteTarget.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setDeleteTarget(null);
    });
  };

  return (
    <div className="category-layout">
      <div className="category-list">
        {categories.map((category, index) => (
          <article key={category.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{category.name}</strong><small>/{category.slug}</small><p>{category.description}</p></div>
            <div><button type="button" aria-label={"Edit " + category.name} onClick={() => edit(category)}><Pencil size={15} /></button><button type="button" aria-label={"Delete " + category.name} onClick={() => setDeleteTarget(category)}><Trash2 size={15} /></button></div>
          </article>
        ))}
      </div>
      <form className="category-form" onSubmit={save}>
        <p className="eyebrow">{editing ? "Editing category" : "New category"}</p>
        <h2>{editing ? editing.name : "Organise a chapter."}</h2>
        <label>Name<input value={name} onChange={(event) => { setName(event.target.value); if (!editing) setSlug(slugify(event.target.value)); }} required /></label>
        <label>Slug<input value={slug} onChange={(event) => setSlug(event.target.value)} required /></label>
        <label>Description<textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <div>{editing && <button className="button outline" type="button" onClick={reset}>Cancel</button>}<button className="button primary" type="submit" disabled={pending}><Plus size={16} />{editing ? "Save changes" : "Add category"}</button></div>
      </form>
      <ConfirmDialog open={Boolean(deleteTarget)} title={"Delete " + (deleteTarget?.name ?? "") + "?"} message="A category can only be deleted when no stories use it." confirmLabel="Delete category" destructive onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </div>
  );
}
