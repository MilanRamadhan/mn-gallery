"use server";

import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_LETTERS_TAG } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabase/config";
import { letterInputSchema } from "@/lib/validations/story";
import type { ActionResult, LetterInput } from "@/types/story";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Connect Supabase before saving content." };
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return { supabase: null, error: "Your session has ended. Please sign in again." };
  }
  const userId = typeof data.claims.sub === "string" ? data.claims.sub : null;
  if (!userId) {
    return { supabase: null, error: "This account is not a MilaNora administrator." };
  }
  const { data: membership, error: membershipError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (membershipError || !membership) {
    return { supabase: null, error: "This account is not a MilaNora administrator." };
  }
  return { supabase, error: null };
}

export async function saveLetterAction(
  input: LetterInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = letterInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the highlighted letter details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }

  const value = parsed.data;
  const oldLetter = value.id
    ? await auth.supabase
        .from("letters")
        .select("slug, cover_storage_path")
        .eq("id", value.id)
        .maybeSingle()
    : null;
  const oldStoragePath = oldLetter?.data?.cover_storage_path ?? null;
  const oldSlug = oldLetter?.data?.slug ?? value.slug;

  const record = {
    title: value.title,
    slug: value.slug,
    excerpt: value.excerpt,
    content: value.content,
    letter_date: value.letterDate,
    cover_image_url: value.coverImageUrl || null,
    cover_storage_path: value.coverStoragePath || null,
    signature: value.signature || null,
    youtube_video_id: value.youtubeVideoId || null,
    status: value.status,
    updated_at: new Date().toISOString(),
  };

  const query = value.id
    ? auth.supabase.from("letters").update(record).eq("id", value.id).select("id, slug").single()
    : auth.supabase.from("letters").insert(record).select("id, slug").single();
  const { data: letter, error } = await query;
  if (error || !letter) {
    return {
      success: false,
      message:
        error?.code === "23505"
          ? "That slug is already used by another letter."
          : "The letter could not be saved. Please try again.",
    };
  }

  if (oldStoragePath && value.coverStoragePath && oldStoragePath !== value.coverStoragePath) {
    await auth.supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove([oldStoragePath]);
  }

  revalidatePath("/admin/letters");
  revalidatePath("/letters/" + oldSlug);
  revalidatePath("/letters/" + letter.slug);
  updateTag(PUBLIC_LETTERS_TAG);
  return {
    success: true,
    message: value.id ? "Letter updated." : "Letter created.",
    data: letter as { id: string; slug: string },
  };
}

export async function deleteLetterAction(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }
  const { data } = await auth.supabase
    .from("letters")
    .select("slug, cover_storage_path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await auth.supabase.from("letters").delete().eq("id", id);
  if (error) return { success: false, message: "This letter could not be deleted." };
  if (data?.cover_storage_path) {
    await auth.supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove([data.cover_storage_path]);
  }
  revalidatePath("/admin/letters");
  if (data?.slug) revalidatePath("/letters/" + data.slug);
  updateTag(PUBLIC_LETTERS_TAG);
  return { success: true, message: "Letter deleted." };
}

export async function toggleLetterStatusAction(
  id: string,
  status: "draft" | "published",
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }
  const { data, error } = await auth.supabase
    .from("letters")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { success: false, message: "The letter status could not be changed." };
  revalidatePath("/admin/letters");
  if (data?.slug) revalidatePath("/letters/" + data.slug);
  updateTag(PUBLIC_LETTERS_TAG);
  return { success: true, message: status === "published" ? "Letter published." : "Letter moved to drafts." };
}
