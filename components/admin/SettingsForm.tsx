"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSettingsAction } from "@/lib/actions/story-actions";
import type { SiteSettings } from "@/types/story";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [pending, startTransition] = useTransition();
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
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveSettingsAction({
        id: settings.id === "00000000-0000-0000-0000-000000000000" ? undefined : settings.id,
        ...values,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
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
        <div><span>03</span><h2>Images & search</h2><p>Use Storage public URLs here, or keep the local placeholders until your photographs are ready.</p></div>
        <div className="settings-fields">
          <label className="wide">Hero image URL<input value={values.heroImageUrl} onChange={(event) => update("heroImageUrl", event.target.value)} /></label>
          <label className="wide">Couple image URL<input value={values.coupleImageUrl} onChange={(event) => update("coupleImageUrl", event.target.value)} /></label>
          <label className="wide">SEO title<input value={values.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} /></label>
          <label className="wide">SEO description<textarea rows={3} value={values.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} /></label>
        </div>
      </section>
      <div className="settings-save"><button className="button primary" type="submit" disabled={pending}>{pending ? <LoaderCircle className="spin" /> : <Save size={16} />}{pending ? "Saving…" : "Save settings"}</button></div>
    </form>
  );
}
