"use client";

import { ArrowDown, ArrowUp, Crop, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadConfig } from "@/config/site";
import { AppImage } from "@/components/shared/AppImage";
import { createClientId } from "@/lib/client-id";
import { ImageCropDialog } from "./ImageCropDialog";

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

type QueuedCrop = {
  key: string;
  fileName: string;
  source: string;
  ownsSource: boolean;
  replaceImageKey?: string;
  target: "cover" | "gallery";
  title: string;
  aspectRatio: number;
  outputWidth: number;
  outputHeight: number;
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
  hideGallery,
}: {
  coverPreview: string;
  onCoverChange: (file: File, preview: string) => void;
  images: PendingImage[];
  onImagesChange: (images: PendingImage[]) => void;
  hideGallery?: boolean;
}) {
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const replaceGalleryInput = useRef<HTMLInputElement>(null);
  const replaceImageKeyRef = useRef<string | null>(null);
  const cropQueueRef = useRef<QueuedCrop[]>([]);
  const [cropQueue, setCropQueue] = useState<QueuedCrop[]>([]);

  useEffect(() => {
    cropQueueRef.current = cropQueue;
  }, [cropQueue]);
  useEffect(() => () => {
    cropQueueRef.current.forEach((item) => URL.revokeObjectURL(item.source));
  }, []);

  const queueCrop = (file: File, target: QueuedCrop["target"], replaceImageKey?: string) => {
    const isCover = target === "cover";
    setCropQueue((current) => [
      ...current,
      {
        key: createClientId(),
        fileName: file.name,
        source: URL.createObjectURL(file),
        ownsSource: true,
        replaceImageKey,
        target,
        title: isCover ? "Story cover" : "Gallery photograph",
        aspectRatio: isCover ? 16 / 9 : 4 / 5,
        outputWidth: isCover ? 1600 : 1440,
        outputHeight: isCover ? 900 : 1800,
      },
    ]);
  };

  const queueExistingCrop = (
    source: string,
    target: QueuedCrop["target"],
    fileName: string,
    replaceImageKey?: string,
  ) => {
    const isCover = target === "cover";
    setCropQueue((current) => [
      ...current,
      {
        key: createClientId(),
        fileName,
        source,
        ownsSource: false,
        replaceImageKey,
        target,
        title: isCover ? "Story cover" : "Gallery photograph",
        aspectRatio: isCover ? 16 / 9 : 4 / 5,
        outputWidth: isCover ? 1600 : 1440,
        outputHeight: isCover ? 900 : 1800,
      },
    ]);
  };

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const queuedGallery = cropQueue.filter((item) => item.target === "gallery" && !item.replaceImageKey).length;
    const incoming = Array.from(files).filter(validFile).slice(0, Math.max(0, 20 - images.length - queuedGallery));
    incoming.forEach((file) => queueCrop(file, "gallery"));
  };

  const activeCrop = cropQueue[0];

  const removeActiveCrop = () => {
    if (!activeCrop) return;
    if (activeCrop.ownsSource) URL.revokeObjectURL(activeCrop.source);
    setCropQueue((current) => current.slice(1));
  };

  const finishActiveCrop = (file: File) => {
    if (!activeCrop) return;
    const preview = URL.createObjectURL(file);
    if (activeCrop.target === "cover") {
      onCoverChange(file, preview);
    } else if (activeCrop.replaceImageKey) {
      onImagesChange(images.map((image) => {
        if (image.key !== activeCrop.replaceImageKey) return image;
        if (image.preview.startsWith("blob:")) URL.revokeObjectURL(image.preview);
        return { ...image, preview, file };
      }));
    } else {
      onImagesChange([
        ...images,
        { key: createClientId(), preview, file, caption: "", altText: "" },
      ]);
    }
    removeActiveCrop();
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
        <button
          className="cover-preview-button"
          type="button"
          onClick={() => coverPreview
            ? queueExistingCrop(coverPreview, "cover", "story-cover.webp")
            : coverInput.current?.click()}
        >
          {coverPreview ? (
            <AppImage src={coverPreview} alt="Cover image preview" fill unoptimized={coverPreview.startsWith("blob:")} sizes="(max-width: 760px) 100vw, 48vw" />
          ) : (
            <span><UploadCloud /><strong>Choose a cover image</strong><small>Required · one large editorial photograph</small></span>
          )}
          {coverPreview && <em><Crop size={14} />Edit crop</em>}
        </button>
        {coverPreview && <button className="button outline cover-replace-button" type="button" onClick={() => coverInput.current?.click()}><UploadCloud size={15} />Replace photo</button>}
        <input
          ref={coverInput}
          type="file"
          accept={uploadConfig.acceptedTypes.join(",")}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file && validFile(file)) queueCrop(file, "cover");
            event.currentTarget.value = "";
          }}
        />
      </div>
      {!hideGallery && (
        <div className="gallery-upload-heading">
          <div><h3>Additional photographs</h3><p>Each selected photo opens in the crop editor before captions are added.</p></div>
          <button className="button outline" type="button" onClick={() => galleryInput.current?.click()}><ImagePlus size={16} />Add photos</button>
          <input ref={galleryInput} type="file" multiple accept={uploadConfig.acceptedTypes.join(",")} hidden onChange={(event) => { addImages(event.target.files); event.currentTarget.value = ""; }} />
          <input
            ref={replaceGalleryInput}
            type="file"
            accept={uploadConfig.acceptedTypes.join(",")}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              const replaceImageKey = replaceImageKeyRef.current;
              if (file && replaceImageKey && validFile(file)) queueCrop(file, "gallery", replaceImageKey);
              replaceImageKeyRef.current = null;
              event.currentTarget.value = "";
            }}
          />
        </div>
      )}
      {images.length > 0 && !hideGallery && (
        <div className="sortable-images">
          {images.map((image, index) => (
            <article key={image.key}>
              <div className="sortable-preview"><AppImage src={image.preview} alt="" fill unoptimized={image.preview.startsWith("blob:")} sizes="120px" /></div>
              <div className="sortable-fields">
                <label>Caption<input value={image.caption} maxLength={240} onChange={(event) => onImagesChange(images.map((item) => item.key === image.key ? { ...item, caption: event.target.value } : item))} placeholder="What was happening here?" /></label>
                <label>Alt text<input value={image.altText} maxLength={240} onChange={(event) => onImagesChange(images.map((item) => item.key === image.key ? { ...item, altText: event.target.value } : item))} placeholder="Describe the photograph" /></label>
              </div>
              <div className="sort-actions">
                <button
                  type="button"
                  aria-label="Replace image"
                  title="Replace photo"
                  onClick={() => {
                    replaceImageKeyRef.current = image.key;
                    replaceGalleryInput.current?.click();
                  }}
                ><UploadCloud size={15} /></button>
                <button type="button" aria-label="Edit image crop" onClick={() => queueExistingCrop(image.preview, "gallery", image.file?.name ?? "gallery-photo.webp", image.key)}><Crop size={15} /></button>
                <button type="button" aria-label="Move image up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} /></button>
                <button type="button" aria-label="Move image down" disabled={index === images.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} /></button>
                <button type="button" aria-label="Remove image" onClick={() => { if (image.preview.startsWith("blob:")) URL.revokeObjectURL(image.preview); onImagesChange(images.filter((item) => item.key !== image.key)); }}><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      {activeCrop && (
        <ImageCropDialog
          key={activeCrop.key}
          source={activeCrop.source}
          fileName={activeCrop.fileName}
          title={activeCrop.title}
          aspectRatio={activeCrop.aspectRatio}
          outputWidth={activeCrop.outputWidth}
          outputHeight={activeCrop.outputHeight}
          onCancel={removeActiveCrop}
          onComplete={finishActiveCrop}
        />
      )}
    </section>
  );
}
