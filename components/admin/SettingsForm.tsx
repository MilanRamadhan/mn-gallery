"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClientId } from "@/lib/client-id";
import { saveSettingsAction } from "@/lib/actions/story-actions";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabase/config";
import type { SiteSettings } from "@/types/story";
import { SettingsImagePicker } from "./SettingsImagePicker";

type BrowserSupabaseClient = NonNullable<ReturnType<typeof createClient>>;

async function uploadSettingsImage(
  supabase: BrowserSupabaseClient,
  file: File,
  kind: "hero" | "couple",
) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-") || "photo";
  const path = `settings/${kind}/${createClientId()}-${safeName}`;
  const { error } = await supabase.storage
    .from(SUPABASE_MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(SUPABASE_MEDIA_BUCKET).getPublicUrl(path);
  return { imageUrl: data.publicUrl, storagePath: path };
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [coupleFile, setCoupleFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState(settings.hero_image_url || "/placeholders/hero.webp");
  const [couplePreview, setCouplePreview] = useState(settings.couple_image_url || "/placeholders/couple.webp");
  const [values, setValues] = useState({
    siteTitle: settings.site_title,
    personOne: settings.person_one,
    personTwo: settings.person_two,
    relationshipStartDate: settings.relationship_start_date,
    tagline: settings.tagline,
    description: settings.description,
    heroImageUrl: settings.hero_image_url ?? "",
    heroStoragePath: settings.hero_storage_path ?? "",
    coupleImageUrl: settings.couple_image_url ?? "",
    coupleStoragePath: settings.couple_storage_path ?? "",
    aboutContent: settings.about_content ?? "",
    quote: settings.quote ?? "",
    accentColor: settings.accent_color ?? "#f29abb",
    isPublic: settings.is_public,
    seoTitle: settings.seo_title ?? "",
    seoDescription: settings.seo_description ?? "",
  });
  const update = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  useEffect(() => () => {
    if (heroPreview.startsWith("blob:")) URL.revokeObjectURL(heroPreview);
  }, [heroPreview]);
  useEffect(() => () => {
    if (couplePreview.startsWith("blob:")) URL.revokeObjectURL(couplePreview);
  }, [couplePreview]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    const uploadedPaths: string[] = [];
    const supabase = heroFile || coupleFile ? createClient() : null;

    if ((heroFile || coupleFile) && !supabase) {
      toast.error("Supabase is not connected. Check the site configuration and try again.");
      setPending(false);
      return;
    }

    try {
      let nextValues = { ...values };
      if (heroFile && supabase) {
        const uploaded = await uploadSettingsImage(supabase, heroFile, "hero");
        uploadedPaths.push(uploaded.storagePath);
        nextValues = { ...nextValues, heroImageUrl: uploaded.imageUrl, heroStoragePath: uploaded.storagePath };
      }
      if (coupleFile && supabase) {
        const uploaded = await uploadSettingsImage(supabase, coupleFile, "couple");
        uploadedPaths.push(uploaded.storagePath);
        nextValues = { ...nextValues, coupleImageUrl: uploaded.imageUrl, coupleStoragePath: uploaded.storagePath };
      }

      const result = await saveSettingsAction({
        id: settings.id === "00000000-0000-0000-0000-000000000000" ? undefined : settings.id,
        ...nextValues,
      });
      if (!result.success) {
        if (uploadedPaths.length > 0 && supabase) {
          await supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove(uploadedPaths);
        }
        toast.error(result.message);
        return;
      }

      const stalePaths = [
        heroFile && values.heroStoragePath.startsWith("settings/") ? values.heroStoragePath : "",
        coupleFile && values.coupleStoragePath.startsWith("settings/") ? values.coupleStoragePath : "",
      ].filter(Boolean);
      if (stalePaths.length > 0 && supabase) {
        await supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove(stalePaths);
      }

      setValues(nextValues);
      setHeroFile(null);
      setCoupleFile(null);
      setHeroPreview(nextValues.heroImageUrl || "/placeholders/hero.webp");
      setCouplePreview(nextValues.coupleImageUrl || "/placeholders/couple.webp");
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      if (uploadedPaths.length > 0 && supabase) {
        await supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove(uploadedPaths);
      }
      const detail = error instanceof Error ? error.message : "Unknown upload error";
      toast.error("Upload failed: " + detail);
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="settings-form" onSubmit={submit}>
      <section className="settings-block">
        <div><span>01</span><h2>Identity</h2><p>The names and dates that appear throughout the public journal.</p></div>
        <div className="settings-fields">
          <label>Site title<input value={values.siteTitle} onChange={(event) => update("siteTitle", event.target.value)} required /></label>
          <label>Relationship start date<input type="date" value={values.relationshipStartDate} onChange={(event) => update("relationshipStartDate", event.target.value)} required /></label>
          <label>Person one<input value={values.personOne} onChange={(event) => update("personOne", event.target.value)} required /></label>
          <label>Person two<input value={values.personTwo} onChange={(event) => update("personTwo", event.target.value)} required /></label>
          <label className="wide">Tagline<input value={values.tagline} onChange={(event) => update("tagline", event.target.value)} required /></label>
          <label className="wide">Site description<textarea rows={4} value={values.description} onChange={(event) => update("description", event.target.value)} required /></label>
        </div>
      </section>
      <section className="settings-block">
        <div><span>02</span><h2>Story & tone</h2><p>Longer copy for About Us and the quote used as an emotional pause.</p></div>
        <div className="settings-fields">
          <label className="wide">About content<textarea rows={8} value={values.aboutContent} onChange={(event) => update("aboutContent", event.target.value)} /></label>
          <label className="wide">Relationship quote<textarea rows={3} value={values.quote} onChange={(event) => update("quote", event.target.value)} /></label>
          <label>Accent color<input type="color" value={values.accentColor} onChange={(event) => update("accentColor", event.target.value)} /></label>
          <label className="check-row"><input type="checkbox" checked={values.isPublic} onChange={(event) => update("isPublic", event.target.checked)} /><span><strong>Public website</strong><small>Visitors can read published stories.</small></span></label>
        </div>
      </section>
      <section className="settings-block">
        <div><span>03</span><h2>Images & search</h2><p>Choose, crop, and zoom the photographs used on the homepage and About Us.</p></div>
        <div className="settings-fields">
          <SettingsImagePicker
            title="Hero photograph"
            description="Shown in the opening and reveal on the homepage."
            preview={heroPreview}
            selectedFileName={heroFile?.name}
            disabled={pending}
            onChange={(file, preview) => {
              setHeroFile(file);
              setHeroPreview(preview);
            }}
          />
          <SettingsImagePicker
            title="Couple photograph"
            description="Shown as the main portrait on About Us."
            preview={couplePreview}
            selectedFileName={coupleFile?.name}
            disabled={pending}
            onChange={(file, preview) => {
              setCoupleFile(file);
              setCouplePreview(preview);
            }}
          />
          <label className="wide">SEO title<input value={values.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} /></label>
          <label className="wide">SEO description<textarea rows={3} value={values.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} /></label>
        </div>
      </section>
      <div className="settings-save"><button className="button primary" type="submit" disabled={pending}>{pending ? <LoaderCircle className="spin" /> : <Save size={16} />}{pending ? "Uploading & saving..." : "Save settings"}</button></div>
    </form>
  );
}
