"use client";

import { ImagePlus, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppImage } from "@/components/shared/AppImage";
import { uploadConfig } from "@/config/site";
import { ImageCropDialog } from "./ImageCropDialog";

function validateImage(file: File) {
  if (!uploadConfig.acceptedTypes.includes(file.type as (typeof uploadConfig.acceptedTypes)[number])) {
    toast.error("Use a JPEG, PNG, WebP, or AVIF image.");
    return false;
  }
  if (file.size > uploadConfig.maxBytes) {
    toast.error("The image is larger than 10 MB.");
    return false;
  }
  return true;
}

export function SettingsImagePicker({
  title,
  description,
  preview,
  selectedFileName,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  preview: string;
  selectedFileName?: string;
  disabled?: boolean;
  onChange: (file: File, preview: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editor, setEditor] = useState<{ file: File; source: string } | null>(null);

  useEffect(() => () => {
    if (editor) URL.revokeObjectURL(editor.source);
  }, [editor]);

  return (
    <div className="settings-image-picker">
      <div className="settings-image-heading">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <button
        type="button"
        aria-label={`${preview ? "Replace" : "Choose"} ${title.toLowerCase()}`}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <AppImage
            src={preview}
            alt={`${title} preview`}
            fill
            unoptimized={preview.startsWith("blob:")}
            sizes="(max-width: 760px) 100vw, 32vw"
          />
        ) : (
          <span className="settings-image-empty"><ImagePlus /><em>Choose a photograph</em></span>
        )}
        <span className="settings-image-action"><UploadCloud size={17} />{preview ? "Replace photo" : "Choose photo"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={uploadConfig.acceptedTypes.join(",")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && validateImage(file)) setEditor({ file, source: URL.createObjectURL(file) });
          event.currentTarget.value = "";
        }}
      />
      <small>{selectedFileName ? `${selectedFileName} is cropped and ready to save.` : "JPEG, PNG, WebP, or AVIF - maximum 10 MB."}</small>
      {editor && (
        <ImageCropDialog
          source={editor.source}
          fileName={editor.file.name}
          title={title}
          onCancel={() => setEditor(null)}
          onComplete={(croppedFile) => {
            onChange(croppedFile, URL.createObjectURL(croppedFile));
            setEditor(null);
          }}
        />
      )}
    </div>
  );
}
