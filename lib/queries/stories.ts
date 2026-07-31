import "server-only";

import { siteConfig } from "@/config/site";
import { demoCategories, demoDraft, demoStories } from "@/data/demo";
import type { Category, SiteSettings, Story } from "@/types/story";
import { createClient } from "@/lib/supabase/server";

const defaultSettings: SiteSettings = {
  id: "00000000-0000-0000-0000-000000000000",
  site_title: siteConfig.title,
  person_one: siteConfig.personOne,
  person_two: siteConfig.personTwo,
  relationship_start_date: siteConfig.relationshipStartDate,
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  hero_image_url: siteConfig.heroImage,
  couple_image_url: siteConfig.coupleImage,
  about_content:
    "We built this small archive to remember the details: where we were, what we felt, and how an ordinary day became part of us.",
  quote: siteConfig.quote,
  accent_color: siteConfig.accentColor,
  is_public: true,
  seo_title: siteConfig.title + " — " + siteConfig.personOne + " & " + siteConfig.personTwo,
  seo_description: siteConfig.description,
};

const storySelect = "*, category:categories(*), story_images(*)";

export async function getPublishedStories(): Promise<Story[]> {
  const supabase = await createClient();
  if (!supabase) return demoStories;
  const { data, error } = await supabase
    .from("stories")
    .select(storySelect)
    .eq("status", "published")
    .order("event_date", { ascending: false })
    .order("display_order", { ascending: true });
  if (error || !data) return demoStories;
  return data as unknown as Story[];
}

export async function getFeaturedStories() {
  const stories = await getPublishedStories();
  return stories.filter((story) => story.is_featured).slice(0, 4);
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const supabase = await createClient();
  if (!supabase) return demoStories.find((story) => story.slug === slug) ?? null;
  const { data, error } = await supabase
    .from("stories")
    .select(storySelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) return null;
  return data as unknown as Story | null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) return demoCategories;
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error || !data) return demoCategories;
  return data as unknown as Category[];
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  if (!supabase) return defaultSettings;
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error || !data) return defaultSettings;
  return data as unknown as SiteSettings;
}

export async function getAdminStories(): Promise<Story[]> {
  const supabase = await createClient();
  if (!supabase) return [...demoStories, demoDraft];
  const { data, error } = await supabase
    .from("stories")
    .select(storySelect)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as Story[];
}

export async function getAdminStoryById(id: string): Promise<Story | null> {
  const supabase = await createClient();
  if (!supabase) return [...demoStories, demoDraft].find((story) => story.id === id) ?? null;
  const { data, error } = await supabase
    .from("stories")
    .select(storySelect)
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data as unknown as Story | null;
}

export async function getAdminUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
}
