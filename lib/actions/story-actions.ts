"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabase/config";
import { categorySchema, settingsSchema, storyInputSchema } from "@/lib/validations/story";
import type { ActionResult, StoryInput } from "@/types/story";

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

export async function saveStoryAction(
  input: StoryInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = storyInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the highlighted story details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }

  const value = parsed.data;
  const record = {
    title: value.title,
    slug: value.slug,
    excerpt: value.excerpt,
    content: value.content,
    event_date: value.eventDate,
    location: value.location || null,
    quote: value.quote || null,
    cover_image_url: value.coverImageUrl,
    cover_storage_path: value.coverStoragePath || null,
    category_id: value.categoryId || null,
    status: value.status,
    is_featured: value.isFeatured,
    updated_at: new Date().toISOString(),
  };

  const oldPaths: string[] = [];
  if (value.id) {
    const { data: oldImages } = await auth.supabase
      .from("story_images")
      .select("storage_path")
      .eq("story_id", value.id);
    oldPaths.push(
      ...((oldImages ?? []) as Array<{ storage_path: string }>).map(
        (item) => item.storage_path,
      ),
    );
  }

  const query = value.id
    ? auth.supabase
        .from("stories")
        .update(record)
        .eq("id", value.id)
        .select("id, slug")
        .single()
    : auth.supabase.from("stories").insert(record).select("id, slug").single();
  const { data: story, error } = await query;
  if (error || !story) {
    return {
      success: false,
      message:
        error?.code === "23505"
          ? "That slug is already used by another story."
          : "The story could not be saved. Please try again.",
    };
  }

  if (value.id) {
    const { error: imageDeleteError } = await auth.supabase
      .from("story_images")
      .delete()
      .eq("story_id", story.id);
    if (imageDeleteError) {
      return {
        success: false,
        message: "The story was saved, but its gallery could not be updated.",
      };
    }
  }

  if (value.additionalImages.length) {
    const { error: imageError } = await auth.supabase.from("story_images").insert(
      value.additionalImages.map((image) => ({
        story_id: story.id,
        image_url: image.imageUrl,
        storage_path: image.storagePath,
        caption: image.caption || null,
        alt_text: image.altText || null,
        display_order: image.displayOrder,
      })),
    );
    if (imageError) {
      return {
        success: false,
        message: "The story was saved, but one or more gallery images could not be attached.",
      };
    }
  }

  const retained = new Set(value.additionalImages.map((image) => image.storagePath));
  const removedPaths = oldPaths.filter((path) => !retained.has(path));
  if (removedPaths.length) {
    await auth.supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove(removedPaths);
  }

  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/stories");
  return {
    success: true,
    message: value.id ? "Story updated." : "Story created.",
    data: story as { id: string; slug: string },
  };
}

export async function deleteStoryAction(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }
  const { data } = await auth.supabase
    .from("stories")
    .select("cover_storage_path, story_images(storage_path)")
    .eq("id", id)
    .single();
  const paths = data
    ? [
        data.cover_storage_path,
        ...((data.story_images ?? []) as Array<{ storage_path: string }>).map(
          (item) => item.storage_path,
        ),
      ].filter((path): path is string => Boolean(path))
    : [];
  const { error } = await auth.supabase.from("stories").delete().eq("id", id);
  if (error) return { success: false, message: "This story could not be deleted." };
  const storageResult = paths.length
    ? await auth.supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove(paths)
    : { error: null };
  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/gallery");
  revalidatePath("/admin/stories");
  return {
    success: true,
    message: storageResult.error
      ? "Story deleted. A storage file still needs manual cleanup."
      : "Story and its images were deleted.",
  };
}

export async function toggleStoryStatusAction(
  id: string,
  status: "draft" | "published",
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }
  const { error } = await auth.supabase
    .from("stories")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    return { success: false, message: "The story status could not be changed." };
  }
  revalidatePath("/");
  revalidatePath("/journey");
  revalidatePath("/admin/stories");
  return {
    success: true,
    message: status === "published" ? "Story published." : "Story moved to drafts.",
  };
}

export async function saveCategoryAction(input: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Please complete the category details." };
  }
  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }
  const value = parsed.data;
  const record = {
    name: value.name,
    slug: value.slug,
    description: value.description || null,
    icon: value.icon || null,
    updated_at: new Date().toISOString(),
  };
  const query = value.id
    ? auth.supabase.from("categories").update(record).eq("id", value.id)
    : auth.supabase.from("categories").insert(record);
  const { error } = await query;
  if (error) {
    return {
      success: false,
      message:
        error.code === "23505"
          ? "That category slug already exists."
          : "Category could not be saved.",
    };
  }
  revalidatePath("/admin/categories");
  return { success: true, message: "Category saved." };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }
  const { count } = await auth.supabase
    .from("stories")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if ((count ?? 0) > 0) {
    return {
      success: false,
      message: "Move the stories in this category before deleting it.",
    };
  }
  const { error } = await auth.supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, message: "Category could not be deleted." };
  revalidatePath("/admin/categories");
  return { success: true, message: "Category deleted." };
}

export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Please review the site settings." };
  }
  const auth = await requireAdmin();
  if (!auth.supabase) {
    return { success: false, message: auth.error ?? "Authentication required." };
  }
  const value = parsed.data;
  const record = {
    site_title: value.siteTitle,
    person_one: value.personOne,
    person_two: value.personTwo,
    relationship_start_date: value.relationshipStartDate,
    tagline: value.tagline,
    description: value.description,
    hero_image_url: value.heroImageUrl || null,
    hero_storage_path: value.heroStoragePath || null,
    couple_image_url: value.coupleImageUrl || null,
    couple_storage_path: value.coupleStoragePath || null,
    about_content: value.aboutContent || null,
    quote: value.quote || null,
    accent_color: value.accentColor,
    is_public: value.isPublic,
    seo_title: value.seoTitle || null,
    seo_description: value.seoDescription || null,
    updated_at: new Date().toISOString(),
  };
  const query = value.id
    ? auth.supabase.from("site_settings").update(record).eq("id", value.id)
    : auth.supabase.from("site_settings").insert(record);
  const { error } = await query;
  if (error) {
    return { success: false, message: "Site settings could not be saved." };
  }
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/settings");
  return { success: true, message: "Site settings saved." };
}
