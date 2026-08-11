"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, Music2, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { Category, Story, StoryInput } from "@/types/story";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabase/config";
import { uploadMediaResumable } from "@/lib/supabase/resumable-upload";
import { saveStoryAction } from "@/lib/actions/story-actions";
import { slugify, storyFormSchema, type StoryFormValues } from "@/lib/validations/story";
import { getSpotifyEmbedUrl, getSpotifyTrackId, getSpotifyTrackUrl } from "@/lib/spotify";
import { ImageUploader, type PendingImage } from "./ImageUploader";

export function StoryForm({
  categories,
  initialStory,
  suggestedStoryNumber = 1,
}: {
  categories: Category[];
  initialStory?: Story | null;
  suggestedStoryNumber?: number;
}) {
  const router = useRouter();
  const [slugEdited, setSlugEdited] = useState(Boolean(initialStory));
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(initialStory?.cover_image_url ?? "");
  const [images, setImages] = useState<PendingImage[]>(
    initialStory?.story_images.map((image) => ({
      key: image.id,
      id: image.id,
      preview: image.image_url,
      imageUrl: image.image_url,
      storagePath: image.storage_path,
      caption: image.caption ?? "",
      altText: image.alt_text ?? "",
    })) ?? [],
  );
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Preparing photographs");
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: initialStory?.title ?? "",
      slug: initialStory?.slug ?? "",
      displayOrder: suggestedStoryNumber,
      eventDate: initialStory?.event_date ?? "",
      location: initialStory?.location ?? "",
      excerpt: initialStory?.excerpt ?? "",
      content: initialStory?.content ?? "",
      quote: initialStory?.quote ?? "",
      spotifyUrl: initialStory?.spotify_track_id ? getSpotifyTrackUrl(initialStory.spotify_track_id) : "",
      categoryId: initialStory?.category_id ?? "",
      status: initialStory?.status ?? "draft",
      isFeatured: initialStory?.is_featured ?? false,
    },
  });
  const titleField = register("title");
  const spotifyUrl = useWatch({ control, name: "spotifyUrl" }) ?? "";
  const spotifyTrackId = getSpotifyTrackId(spotifyUrl);

  const submit = async (values: StoryFormValues) => {
    if (!coverPreview && !coverFile) {
      toast.error("Choose a cover image before saving.");
      return;
    }
    const uploadedPaths: string[] = [];
    const newFiles = [coverFile, ...images.map((image) => image.file ?? null)].filter(
      (file): file is File => Boolean(file),
    );
    const totalUploadBytes = newFiles.reduce((total, file) => total + file.size, 0);
    let completedBytes = 0;
    const upload = async (file: File, folder: "covers" | "stories") => {
      setProgressLabel(`Uploading ${file.name}`);
      const uploaded = await uploadMediaResumable({
        file,
        folder,
        onProgress: ({ bytesUploaded }) => {
          const percentage = totalUploadBytes > 0
            ? Math.round(((completedBytes + bytesUploaded) / totalUploadBytes) * 95)
            : 95;
          setProgress((current) => Math.max(current, Math.min(95, percentage)));
        },
      });
      completedBytes += file.size;
      uploadedPaths.push(uploaded.storagePath);
      return uploaded;
    };

    try {
      setProgress(newFiles.length ? 1 : 95);
      let cover = {
        imageUrl: initialStory?.cover_image_url ?? "",
        storagePath: initialStory?.cover_storage_path ?? "",
      };
      if (coverFile) {
        cover = await upload(coverFile, "covers");
      }
      const uploadedImages = [];
      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const stored = image.file
          ? await upload(image.file, "stories")
          : { imageUrl: image.imageUrl ?? image.preview, storagePath: image.storagePath ?? "" };
        uploadedImages.push({
          id: image.id,
          ...stored,
          caption: image.caption,
          altText: image.altText,
          displayOrder: index,
        });
      }
      setProgressLabel("Saving story details");
      setProgress(96);
      const { spotifyUrl: submittedSpotifyUrl, ...storyValues } = values;
      const input: StoryInput = {
        id: initialStory?.id,
        ...storyValues,
        spotifyTrackId: getSpotifyTrackId(submittedSpotifyUrl) ?? "",
        coverImageUrl: cover.imageUrl,
        coverStoragePath: cover.storagePath,
        additionalImages: uploadedImages,
      };
      const result = await saveStoryAction(input);
      if (!result.success) {
        const supabase = createClient();
        if (uploadedPaths.length && supabase) {
          await supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove(uploadedPaths);
        }
        toast.error(result.message);
        setProgress(0);
        return;
      }
      setProgress(100);
      toast.success(result.message);
      router.push("/admin/stories");
      router.refresh();
    } catch (error) {
      const supabase = createClient();
      if (uploadedPaths.length && supabase) {
        await supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove(uploadedPaths);
      }
      const detail = error instanceof Error ? error.message : "Unknown upload error";
      toast.error("Upload failed: " + detail);
      setProgress(0);
    }
  };

  return (
    <form className="story-form" onSubmit={handleSubmit(submit)}>
      <div className="admin-page-heading form-page-heading">
        <div><Link href="/admin/stories"><ArrowLeft size={15} />Stories</Link><p className="eyebrow">{initialStory ? "Edit chapter" : "New chapter"}</p><h1>{initialStory ? initialStory.title : "Tell a new story."}</h1></div>
        <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" /> : <Save size={16} />}{isSubmitting ? "Saving…" : "Save story"}</button>
      </div>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><h2>The essentials</h2><p>Give this memory a date, a name, and enough context to find it later.</p></div></div>
        <div className="form-grid">
          <label className="wide">Title<input {...titleField} onChange={(event) => { titleField.onChange(event); if (!slugEdited) setValue("slug", slugify(event.target.value), { shouldValidate: true }); }} placeholder="The day everything felt different" />{errors.title && <small role="alert">{errors.title.message}</small>}</label>
          <label>Slug<input {...register("slug")} onChange={(event) => { setSlugEdited(true); setValue("slug", event.target.value, { shouldValidate: true }); }} placeholder="the-day-everything-changed" />{errors.slug && <small role="alert">{errors.slug.message}</small>}</label>
          <label>Story number<input type="number" min="1" step="1" inputMode="numeric" {...register("displayOrder", { valueAsNumber: true })} />{errors.displayOrder ? <small role="alert">{errors.displayOrder.message}</small> : <small className="field-hint">Choose its position in your journey. The other stories will move automatically.</small>}</label>
          <label>Event date<input type="date" {...register("eventDate")} />{errors.eventDate && <small role="alert">{errors.eventDate.message}</small>}</label>
          <label>Location <em>optional</em><input {...register("location")} placeholder="A place worth remembering" /></label>
          <label>Category<select {...register("categoryId")}><option value="">Uncategorised</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><h2>The story</h2><p>Plain text becomes paragraphs wherever you add an empty line.</p></div></div>
        <div className="form-grid">
          <label className="wide">Short introduction<textarea rows={3} {...register("excerpt")} placeholder="A short sentence that invites someone into the memory." />{errors.excerpt && <small role="alert">{errors.excerpt.message}</small>}</label>
          <label className="wide">Full story<textarea rows={12} {...register("content")} placeholder={"Write the memory here.\n\nStart a new paragraph with an empty line."} />{errors.content && <small role="alert">{errors.content.message}</small>}</label>
          <label className="wide">Favorite line <em>optional</em><input {...register("quote")} placeholder="A sentence you never want to forget" /></label>
        </div>
      </section>

      <ImageUploader
        coverPreview={coverPreview}
        onCoverChange={(file, preview) => { if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview); setCoverFile(file); setCoverPreview(preview); }}
        images={images}
        onImagesChange={setImages}
      />

      <section className="form-section soundtrack-section">
        <div className="form-section-heading"><span>04</span><div><h2>Story soundtrack</h2><p>Paste one Spotify track link. Visitors can listen without leaving this story.</p></div></div>
        <div className="form-grid">
          <label className="wide">Spotify song link <em>optional</em><input {...register("spotifyUrl")} inputMode="url" placeholder="https://open.spotify.com/track/..." />{errors.spotifyUrl ? <small role="alert">{errors.spotifyUrl.message}</small> : <small className="field-hint">In Spotify, choose Share → Copy song link, then paste it here.</small>}</label>
          {spotifyTrackId && (
            <div className="soundtrack-preview wide">
              <div><Music2 size={17} /><span><strong>Soundtrack preview</strong><small>This is what visitors will hear while reading.</small></span></div>
              <iframe src={getSpotifyEmbedUrl(spotifyTrackId)} title="Spotify soundtrack preview" width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
            </div>
          )}
        </div>
      </section>

      <section className="form-section publishing-section">
        <div className="form-section-heading"><span>05</span><div><h2>Publishing</h2><p>Drafts stay private. Published stories appear on the public website.</p></div></div>
        <div className="publish-options">
          <label>Status<select {...register("status")}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label className="check-row"><input type="checkbox" {...register("isFeatured")} /><span><Sparkles size={16} /><strong>Feature this story</strong><small>Show it prominently on the homepage.</small></span></label>
        </div>
      </section>
      {progress > 0 && progress < 100 && <div className="upload-progress" role="status"><span style={{ width: progress + "%" }} /><p>{progressLabel} · {progress}%</p></div>}
      <div className="form-actions"><Link className="button outline" href="/admin/stories">Cancel</Link><button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" /> : <Save size={16} />}{isSubmitting ? "Saving story…" : "Save story"}</button></div>
    </form>
  );
}
