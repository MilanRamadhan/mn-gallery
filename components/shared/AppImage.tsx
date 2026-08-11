import Image, { type ImageProps } from "next/image";

function getSupabaseStorageSource(src: ImageProps["src"]) {
  if (typeof src !== "string") return { src, unoptimized: false };

  if (src.includes("/storage/v1/object/")) {
    return { src, unoptimized: true };
  }

  if (src.includes("/storage/v1/render/image/")) {
    try {
      const url = new URL(src);
      url.pathname = url.pathname.replace(
        "/storage/v1/render/image/",
        "/storage/v1/object/",
      );
      url.search = "";
      return { src: url.toString(), unoptimized: true };
    } catch {
      return {
        src: src
          .replace("/storage/v1/render/image/", "/storage/v1/object/")
          .split("?")[0],
        unoptimized: true,
      };
    }
  }

  return { src, unoptimized: false };
}

export function AppImage({
  alt,
  src,
  fill,
  priority,
  unoptimized,
  loading,
  sizes,
  style,
  ...props
}: ImageProps) {
  const normalized = getSupabaseStorageSource(src);

  if ((normalized.unoptimized || unoptimized) && typeof normalized.src === "string") {
    const fillStyle = fill
      ? {
          bottom: 0,
          height: "100%",
          left: 0,
          position: "absolute" as const,
          right: 0,
          top: 0,
          width: "100%",
        }
      : undefined;

    // The Vinext image adapter rewrites remote images to Supabase's paid
    // transformation endpoint. Native images keep public Storage objects usable.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        src={normalized.src}
        alt={alt}
        sizes={sizes}
        loading={loading ?? (priority ? "eager" : "lazy")}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        style={{ ...fillStyle, ...style }}
      />
    );
  }

  return (
    <Image
      {...props}
      src={normalized.src}
      alt={alt}
      fill={fill}
      priority={priority}
      loading={loading}
      sizes={sizes}
      style={style}
    />
  );
}
