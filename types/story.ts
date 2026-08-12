export type StoryStatus = "draft" | "published";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type StoryImage = {
  id: string;
  story_id: string;
  image_url: string;
  storage_path: string;
  caption?: string | null;
  alt_text?: string | null;
  display_order: number;
  created_at?: string;
};

export type Story = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  event_date: string;
  location?: string | null;
  quote?: string | null;
  youtube_video_id?: string | null;
  cover_image_url: string;
  cover_storage_path?: string | null;
  category_id?: string | null;
  category?: Category | null;
  status: StoryStatus;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  story_images: StoryImage[];
};

export type PublicStoryImage = Pick<
  StoryImage,
  "id" | "story_id" | "image_url" | "caption" | "alt_text" | "display_order"
>;

export type StoryPreview = Pick<
  Story,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "event_date"
  | "location"
  | "cover_image_url"
  | "category_id"
  | "status"
  | "is_featured"
  | "display_order"
  | "created_at"
  | "updated_at"
> & {
  category?: Category | null;
  story_images: PublicStoryImage[];
};

export type JourneyStory = Omit<StoryPreview, "story_images">;

export type SiteSettings = {
  id: string;
  site_title: string;
  person_one: string;
  person_two: string;
  relationship_start_date: string;
  tagline: string;
  description: string;
  hero_image_url?: string | null;
  hero_storage_path?: string | null;
  couple_image_url?: string | null;
  couple_storage_path?: string | null;
  about_content?: string | null;
  quote?: string | null;
  accent_color?: string | null;
  is_public: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  updated_at?: string;
};

export type StoryInput = {
  id?: string;
  title: string;
  slug: string;
  displayOrder: number;
  excerpt: string;
  content: string;
  eventDate: string;
  location?: string;
  quote?: string;
  youtubeVideoId?: string;
  coverImageUrl: string;
  coverStoragePath?: string;
  categoryId?: string;
  status: StoryStatus;
  isFeatured: boolean;
  additionalImages: Array<{
    id?: string;
    imageUrl: string;
    storagePath: string;
    caption?: string;
    altText?: string;
    displayOrder: number;
  }>;
};

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };
