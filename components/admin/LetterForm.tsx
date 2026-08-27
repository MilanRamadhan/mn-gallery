"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { Letter, LetterInput } from "@/types/story";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabase/config";
import { uploadMediaResumable } from "@/lib/supabase/resumable-upload";
import { saveLetterAction } from "@/lib/actions/letter-actions";
import { slugify, letterFormSchema, type LetterFormValues } from "@/lib/validations/story";
import { getYouTubeVideoId, getYouTubeVideoUrl } from "@/lib/youtube";
import { ImageUploader } from "./ImageUploader";
import { YouTubeTrackPicker } from "./YouTubeTrackPicker";

export function LetterForm({
  initialLetter,
}: {
  initialLetter?: Letter | null;
}) {
  const router = useRouter();
  const [slugEdited, setSlugEdited] = useState(Boolean(initialLetter));
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(initialLetter?.cover_image_url ?? "");
  
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Preparing photograph");
  
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LetterFormValues>({
    resolver: zodResolver(letterFormSchema),
    defaultValues: {
      title: initialLetter?.title ?? "",
      slug: initialLetter?.slug ?? "",
      letterDate: initialLetter?.letter_date ?? "",
      excerpt: initialLetter?.excerpt ?? "",
      content: initialLetter?.content ?? "",
      signature: initialLetter?.signature ?? "",
      youtubeUrl: initialLetter?.youtube_video_id ? getYouTubeVideoUrl(initialLetter.youtube_video_id) : "",
      status: initialLetter?.status ?? "draft",
    },
  });
  
  const titleField = register("title");
  const youtubeUrl = useWatch({ control, name: "youtubeUrl" }) ?? "";

  const submit = async (values: LetterFormValues) => {
    let uploadedPath = "";
    
    try {
      let cover = {
        imageUrl: initialLetter?.cover_image_url ?? "",
        storagePath: initialLetter?.cover_storage_path ?? "",
      };
      
      if (coverFile) {
        setProgressLabel(`Uploading ${coverFile.name}`);
        setProgress(10);
        cover = await uploadMediaResumable({
          file: coverFile,
          folder: "covers",
          onProgress: ({ bytesUploaded }) => {
            const percentage = Math.round((bytesUploaded / coverFile.size) * 85) + 10;
            setProgress((current) => Math.max(current, Math.min(95, percentage)));
          },
        });
        uploadedPath = cover.storagePath;
      }
      
      setProgressLabel("Saving letter details");
      setProgress(96);
      
      const { youtubeUrl: submittedYouTubeUrl, excerpt, ...letterValues } = values;
      const input: LetterInput = {
        id: initialLetter?.id,
        ...letterValues,
        excerpt: excerpt ?? "",
        youtubeVideoId: getYouTubeVideoId(submittedYouTubeUrl) ?? "",
        coverImageUrl: cover.imageUrl,
        coverStoragePath: cover.storagePath,
      };
      
      const result = await saveLetterAction(input);
      
      if (!result.success) {
        const supabase = createClient();
        if (uploadedPath && supabase) {
          await supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove([uploadedPath]);
        }
        toast.error(result.message);
        setProgress(0);
        return;
      }
      
      setProgress(100);
      toast.success(result.message);
      router.push("/admin/letters");
      router.refresh();
    } catch (error) {
      const supabase = createClient();
      if (uploadedPath && supabase) {
        await supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove([uploadedPath]);
      }
      const detail = error instanceof Error ? error.message : "Unknown upload error";
      toast.error("Upload failed: " + detail);
      setProgress(0);
    }
  };

  return (
    <form className="story-form" onSubmit={handleSubmit(submit)}>
      <div className="admin-page-heading form-page-heading">
        <div><Link href="/admin/letters"><ArrowLeft size={15} />Letters</Link><p className="eyebrow">{initialLetter ? "Edit letter" : "New letter"}</p><h1>{initialLetter ? initialLetter.title : "Write a new letter."}</h1></div>
        <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" /> : <Save size={16} />}{isSubmitting ? "Saving…" : "Save letter"}</button>
      </div>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><h2>The essentials</h2><p>Give this letter a title, a date, and a slug.</p></div></div>
        <div className="form-grid">
          <label className="wide">Title<input {...titleField} onChange={(event) => { titleField.onChange(event); if (!slugEdited) setValue("slug", slugify(event.target.value), { shouldValidate: true }); }} placeholder="A little note for you" />{errors.title && <small role="alert">{errors.title.message}</small>}</label>
          <label>Slug<input {...register("slug")} onChange={(event) => { setSlugEdited(true); setValue("slug", event.target.value, { shouldValidate: true }); }} placeholder="a-little-note" />{errors.slug && <small role="alert">{errors.slug.message}</small>}</label>
          <label>Date<input type="date" {...register("letterDate")} />{errors.letterDate && <small role="alert">{errors.letterDate.message}</small>}</label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><h2>The letter</h2><p>Write your message here.</p></div></div>
        <div className="form-grid">
          <label className="wide">Short introduction<textarea rows={2} {...register("excerpt")} placeholder="A short introduction or subtitle for the letter." />{errors.excerpt && <small role="alert">{errors.excerpt.message}</small>}</label>
          <label className="wide">Letter content<textarea rows={16} {...register("content")} placeholder={"Dear Nora,\n\nI just wanted to say..."} />{errors.content && <small role="alert">{errors.content.message}</small>}</label>
          <label className="wide">Signature <em>optional</em><input {...register("signature")} placeholder="Love, Milan" />{errors.signature && <small role="alert">{errors.signature.message}</small>}</label>
        </div>
      </section>

      <ImageUploader
        hideGallery
        coverPreview={coverPreview}
        onCoverChange={(file, preview) => { if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview); setCoverFile(file); setCoverPreview(preview); }}
        images={[]}
        onImagesChange={() => {}}
      />

      <section className="form-section soundtrack-section">
        <div className="form-section-heading"><span>04</span><div><h2>Soundtrack</h2><p>Search YouTube to add a background song.</p></div></div>
        <div className="form-grid">
          <input type="hidden" {...register("youtubeUrl")} />
          <YouTubeTrackPicker
            value={youtubeUrl}
            error={errors.youtubeUrl?.message}
            onChange={(value) => setValue("youtubeUrl", value, { shouldDirty: true, shouldValidate: true })}
          />
        </div>
      </section>

      <section className="form-section publishing-section">
        <div className="form-section-heading"><span>05</span><div><h2>Publishing</h2><p>Drafts stay private. Published letters can be read via their special link.</p></div></div>
        <div className="publish-options">
          <label>Status<select {...register("status")}><option value="draft">Draft</option><option value="published">Published</option></select></label>
        </div>
      </section>
      
      {progress > 0 && progress < 100 && <div className="upload-progress" role="status"><span style={{ width: progress + "%" }} /><p>{progressLabel} · {progress}%</p></div>}
      <div className="form-actions"><Link className="button outline" href="/admin/letters">Cancel</Link><button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" /> : <Save size={16} />}{isSubmitting ? "Saving letter…" : "Save letter"}</button></div>
    </form>
  );
}
