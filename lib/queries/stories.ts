import "server-only";

import { siteConfig } from "@/config/site";
import { demoCategories, demoDraft, demoStories } from "@/data/demo";
import type { Category, JourneyStory, SiteSettings, Story, StoryPreview } from "@/types/story";
import { unstable_cache } from "next/cache";
import {
  PUBLIC_CATEGORIES_TAG,
  PUBLIC_SETTINGS_TAG,
  PUBLIC_STORIES_TAG,
} from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
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
const storyPreviewSelect = [
  "id",
  "title",
  "slug",
  "excerpt",
  "event_date",
  "location",
  "cover_image_url",
  "category_id",
  "status",
  "is_featured",
  "display_order",
  "created_at",
  "updated_at",
  "category:categories(id,name,slug,description,icon)",
  "story_images(id,story_id,image_url,caption,alt_text,display_order)",
].join(",");
const journeyStorySelect = [
  "id",
  "title",
  "slug",
  "excerpt",
  "event_date",
  "location",
  "cover_image_url",
  "category_id",
  "status",
  "is_featured",
  "display_order",
  "created_at",
  "updated_at",
  "category:categories(id,name,slug,description,icon)",
].join(",");

type JourneyOrderFields = Pick<Story, "display_order" | "event_date" | "created_at">;

function byJourneyOrder(first: JourneyOrderFields, second: JourneyOrderFields) {
  const firstOrder = first.display_order > 0 ? first.display_order : Number.MAX_SAFE_INTEGER;
  const secondOrder = second.display_order > 0 ? second.display_order : Number.MAX_SAFE_INTEGER;
  return (
    firstOrder - secondOrder ||
    first.event_date.localeCompare(second.event_date) ||
    first.created_at.localeCompare(second.created_at)
  );
}

export function orderStoriesByJourney<T extends JourneyOrderFields>(stories: T[]) {
  return [...stories].sort(byJourneyOrder);
}

function withoutStoryImages({ story_images, ...story }: Story): JourneyStory {
  void story_images;
  return story;
}

const getCachedPublishedStories = unstable_cache(
  async (): Promise<StoryPreview[]> => {
    const supabase = createPublicClient();
    if (!supabase) return orderStoriesByJourney(demoStories) as StoryPreview[];
    const { data, error } = await supabase
      .from("stories")
      .select(storyPreviewSelect)
      .eq("status", "published");
    if (error || !data) return orderStoriesByJourney(demoStories) as StoryPreview[];
    return orderStoriesByJourney(data as unknown as StoryPreview[]);
  },
  ["milanora-published-stories-v3"],
  { revalidate: 300, tags: [PUBLIC_STORIES_TAG] },
);

const getCachedJourneyStories = unstable_cache(
  async (): Promise<JourneyStory[]> => {
    const supabase = createPublicClient();
    if (!supabase) {
      return orderStoriesByJourney(demoStories).map(withoutStoryImages);
    }
    const { data, error } = await supabase
      .from("stories")
      .select(journeyStorySelect)
      .eq("status", "published");
    if (error || !data) {
      return orderStoriesByJourney(demoStories).map(withoutStoryImages);
    }
    return orderStoriesByJourney(data as unknown as JourneyStory[]);
  },
  ["milanora-journey-stories-v1"],
  { revalidate: 300, tags: [PUBLIC_STORIES_TAG] },
);

const getCachedStoryBySlug = unstable_cache(
  async (slug: string): Promise<Story | null> => {
    const supabase = createPublicClient();
    if (!supabase) return demoStories.find((story) => story.slug === slug) ?? null;
    const { data, error } = await supabase
      .from("stories")
      .select(storySelect)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return null;
    return data as unknown as Story | null;
  },
  ["milanora-story-by-slug-v2"],
  { revalidate: 300, tags: [PUBLIC_STORIES_TAG] },
);

const getCachedCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    if (!supabase) return demoCategories;
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error || !data) return demoCategories;
    return data as unknown as Category[];
  },
  ["milanora-categories-v2"],
  { revalidate: 300, tags: [PUBLIC_CATEGORIES_TAG] },
);

const getCachedSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createPublicClient();
    if (!supabase) return defaultSettings;
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (error || !data) return defaultSettings;
    return data as unknown as SiteSettings;
  },
  ["milanora-site-settings-v2"],
  { revalidate: 300, tags: [PUBLIC_SETTINGS_TAG] },
);

const getCachedStoryStats = unstable_cache(
  async () => {
    const fallback = {
      memories: demoStories.reduce((total, story) => total + story.story_images.length + 1, 0),
      places: new Set(demoStories.map((story) => story.location).filter(Boolean)).size,
      stories: demoStories.length,
    };
    const supabase = createPublicClient();
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from("stories")
      .select("id,location,story_images(id)")
      .eq("status", "published");
    if (error || !data) return fallback;
    return {
      memories: data.reduce((total, story) => total + story.story_images.length + 1, 0),
      places: new Set(data.map((story) => story.location).filter(Boolean)).size,
      stories: data.length,
    };
  },
  ["milanora-story-stats-v1"],
  { revalidate: 300, tags: [PUBLIC_STORIES_TAG] },
);

export function getPublishedStories() {
  return getCachedPublishedStories();
}

export function getJourneyStories() {
  return getCachedJourneyStories();
}

export function getStoryBySlug(slug: string) {
  return getCachedStoryBySlug(slug);
}

export function getCategories() {
  return getCachedCategories();
}

export function getSiteSettings() {
  return getCachedSiteSettings();
}

export function getPublicStoryStats() {
  return getCachedStoryStats();
}

export async function getAdminSiteSettings(): Promise<SiteSettings> {
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
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !data?.claims || !userId) return null;
  const { data: membership, error: membershipError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (membershipError || !membership) return null;
  return data.claims;
}
