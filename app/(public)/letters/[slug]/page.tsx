import { notFound } from "next/navigation";
import { AppImage } from "@/components/shared/AppImage";
import { getLetterBySlug } from "@/lib/queries/letters";
import { StorySoundtrack } from "@/components/public/StorySoundtrack";
import { LetterEnvelope } from "@/components/public/LetterEnvelope";

export default async function PublicLetterPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const letter = await getLetterBySlug(params.slug);

  if (!letter) {
    notFound();
  }

  return (
    <main>
      <LetterEnvelope letter={letter} />
      {letter.youtube_video_id && (
        <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 30 }}>
          <StorySoundtrack videoId={letter.youtube_video_id} />
        </div>
      )}
    </main>
  );
}
