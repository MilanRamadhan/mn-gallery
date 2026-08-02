"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

function originalSourceLoader({ src }: ImageLoaderProps) {
  return src;
}

function isSupabaseObjectUrl(src: ImageProps["src"]) {
  return typeof src === "string" && src.includes("/storage/v1/object/public/");
}

export function AppImage({ alt, ...props }: ImageProps) {
  if (isSupabaseObjectUrl(props.src)) {
    return <Image {...props} alt={alt} loader={originalSourceLoader} unoptimized />;
  }

  return <Image {...props} alt={alt} />;
}
