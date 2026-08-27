import "server-only";

import { unstable_cache } from "next/cache";
import { PUBLIC_LETTERS_TAG } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Letter } from "@/types/story";

const letterSelect = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "letter_date",
  "cover_image_url",
  "cover_storage_path",
  "signature",
  "youtube_video_id",
  "status",
  "created_at",
  "updated_at",
].join(",");

function orderLetters(letters: Letter[]) {
  return [...letters].sort(
    (first, second) =>
      second.letter_date.localeCompare(first.letter_date) ||
      second.created_at.localeCompare(first.created_at),
  );
}

const getCachedPublishedLetters = unstable_cache(
  async (): Promise<Letter[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("letters")
      .select(letterSelect)
      .eq("status", "published");
    if (error || !data) return [];
    return orderLetters(data as unknown as Letter[]);
  },
  ["milanora-published-letters-v1"],
  { revalidate: 300, tags: [PUBLIC_LETTERS_TAG] },
);

const getCachedLetterBySlug = unstable_cache(
  async (slug: string): Promise<Letter | null> => {
    const supabase = createPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("letters")
      .select(letterSelect)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return null;
    return data as unknown as Letter | null;
  },
  ["milanora-letter-by-slug-v1"],
  { revalidate: 300, tags: [PUBLIC_LETTERS_TAG] },
);

export function getPublishedLetters() {
  return getCachedPublishedLetters();
}

export function getLetterBySlug(slug: string) {
  return getCachedLetterBySlug(slug);
}

export async function getAdminLetters(): Promise<Letter[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("letters")
    .select(letterSelect)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as Letter[];
}

export async function getAdminLetterById(id: string): Promise<Letter | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("letters")
    .select(letterSelect)
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data as unknown as Letter | null;
}
