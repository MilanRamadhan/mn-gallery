"use client";

import { ArrowDown, ArrowUp, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { toast } from "sonner";
import { uploadConfig } from "@/config/site";

export type PendingImage = {
  key: string;
  id?: string;
  preview: string;
  file?: File;
  imageUrl?: string;
  storagePath?: string;
  caption: string;
  altText: string;
};

function validFile(file: File) {
  if (!uploadConfig.acceptedTypes.includes(file.type as (typeof uploadConfig.acceptedTypes)[number])) {
    toast.error(file.name + " is not a supported image format.");
    return false;
  }
  if (file.size > uploadConfig.maxBytes) {
    toast.error(file.name + " is larger than 10 MB.");
    return false;
  }
  return true;
}

export function ImageUploader({
  coverPreview,
  onCoverChange,
  images,
  onImagesChange,
}: {
  coverPreview: string;
  onCoverChange: (file: File, preview: string) => void;
  images: PendingImage[];
  onImagesChange: (images: PendingImage[]) => void;
}) {
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).filter(validFile).slice(0, Math.max(0, 20 - images.length));
    onImagesChange([
      ...images,
      ...incoming.map((file) => ({
        key: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        file,
        caption: "",
        altText: "",
      })),
    ]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onImagesChange(next);
  };

  return (
    <section className="uploader-section">
      <div className="form-section-heading"><span>03</span><div><h2>Photographs</h2><p>Use JPEG, PNG, WebP, or AVIF. Maximum 10 MB per file.</p></div></div>
      <div className="cover-uploader">
        <button type="button" onClick={() => coverInput.current?.click()}>
          {coverPreview ? (
            <Image src={coverPreview} alt="Cover image preview" fill unoptimized={coverPreview.startsWith("blob:")} sizes="(max-width: 760px) 100vw, 48vw" />
          ) : (
            <span><UploadCloud /><strong>Choose a cover image</strong><small>Required · one large editorial photograph</small></span>
          )}
          {coverPreview && <em>Replace cover</em>}
        </button>
        <input
          ref={coverInput}
          type="file"
          accept={uploadConfig.acceptedTypes.join(",")}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file && validFile(file)) onCoverChange(file, URL.createObjectURL(file));
          }}
        />
      </div>
      <div className="gallery-upload-heading">
        <div><h3>Additional photographs</h3><p>Add captions and useful alt text for every image.</p></div>
        <button className="button outline" type="button" onClick={() => galleryInput.current?.click()}><ImagePlus size={16} />Add photos</button>
        <input ref={galleryInput} type="file" multiple accept={uploadConfig.acceptedTypes.join(",")} hidden onChange={(event) => addImages(event.target.files)} />
      </div>
      {images.length > 0 && (
        <div className="sortable-images">
          {images.map((image, index) => (
            <article key={image.key}>
              <div className="sortable-preview"><Image src={image.preview} alt="" fill unoptimized={image.preview.startsWith("blob:")} sizes="120px" /></div>
              <div className="sortable-fields">
                <label>Caption<input value={image.caption} maxLength={240} onChange={(event) => onImagesChange(images.map((item) => item.key === image.key ? { ...item, caption: event.target.value } : item))} placeholder="What was happening here?" /></label>
                <label>Alt text<input value={image.altText} maxLength={240} onChange={(event) => onImagesChange(images.map((item) => item.key === image.key ? { ...item, altText: event.target.value } : item))} placeholder="Describe the photograph" /></label>
              </div>
              <div className="sort-actions">
                <button type="button" aria-label="Move image up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} /></button>
                <button type="button" aria-label="Move image down" disabled={index === images.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} /></button>
                <button type="button" aria-label="Remove image" onClick={() => { if (image.preview.startsWith("blob:")) URL.revokeObjectURL(image.preview); onImagesChange(images.filter((item) => item.key !== image.key)); }}><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
