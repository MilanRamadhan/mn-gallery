import { notFound } from "next/navigation";
import { LetterForm } from "@/components/admin/LetterForm";
import { getAdminLetterById } from "@/lib/queries/letters";

export default async function AdminEditLetterPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const letter = await getAdminLetterById(params.id);
  
  if (!letter) {
    notFound();
  }
  
  return (
    <>
      <LetterForm initialLetter={letter} />
    </>
  );
}
