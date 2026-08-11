import { z } from "zod";
import { getSpotifyTrackId } from "@/lib/spotify";

export const storyInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Title must contain at least 3 characters.").max(120),
  slug: z.string().trim().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  displayOrder: z.number().int("Story number must be a whole number.").min(1, "Story number starts at 1.").max(999),
  excerpt: z.string().trim().min(12, "Write a slightly longer introduction.").max(320),
  content: z.string().trim().min(30, "The story needs at least 30 characters."),
  eventDate: z.string().date("Choose a valid event date."),
  location: z.string().trim().max(120).optional(),
  quote: z.string().trim().max(300).optional(),
  spotifyTrackId: z.string().regex(/^[A-Za-z0-9]{22}$/).optional().or(z.literal("")),
  coverImageUrl: z.string().min(1, "A cover image is required."),
  coverStoragePath: z.string().optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  isFeatured: z.boolean(),
  additionalImages: z.array(
    z.object({
      id: z.string().uuid().optional(),
      imageUrl: z.string().min(1),
      storagePath: z.string().min(1),
      caption: z.string().max(240).optional(),
      altText: z.string().max(240).optional(),
      displayOrder: z.number().int().nonnegative(),
    }),
  ).max(20),
});

export const storyFormSchema = storyInputSchema.pick({
  title: true,
  slug: true,
  displayOrder: true,
  excerpt: true,
  content: true,
  eventDate: true,
  location: true,
  quote: true,
  categoryId: true,
  status: true,
  isFeatured: true,
}).extend({
  spotifyUrl: z.string().trim().max(300).refine(
    (value) => !value || Boolean(getSpotifyTrackId(value)),
    "Paste a valid Spotify track link.",
  ),
});

export type StoryFormValues = z.infer<typeof storyFormSchema>;

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(70).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(240).optional(),
  icon: z.string().trim().max(40).optional(),
});

export const settingsSchema = z.object({
  id: z.string().uuid().optional(),
  siteTitle: z.string().trim().min(2).max(80),
  personOne: z.string().trim().min(1).max(60),
  personTwo: z.string().trim().min(1).max(60),
  relationshipStartDate: z.string().date(),
  tagline: z.string().trim().min(8).max(180),
  description: z.string().trim().min(12).max(400),
  heroImageUrl: z.string().optional(),
  heroStoragePath: z.string().optional(),
  coupleImageUrl: z.string().optional(),
  coupleStoragePath: z.string().optional(),
  aboutContent: z.string().trim().max(4000).optional(),
  quote: z.string().trim().max(300).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  isPublic: z.boolean(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
});

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
