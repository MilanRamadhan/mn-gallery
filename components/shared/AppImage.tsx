import Image, { type ImageProps } from "next/image";

export function AppImage({ alt, ...props }: ImageProps) {
  return <Image {...props} alt={alt} />;
}
