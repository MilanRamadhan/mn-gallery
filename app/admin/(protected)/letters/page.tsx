import { Plus } from "lucide-react";
import Link from "next/link";
import { LetterList } from "@/components/admin/LetterList";
import { getAdminLetters } from "@/lib/queries/letters";

export default async function AdminLettersPage() {
  const letters = await getAdminLetters();
  return (
    <>
      <header className="admin-page-heading">
        <div><p className="eyebrow">Content library</p><h1>Letters</h1><p>Draft, publish, and edit special letters.</p></div>
        <Link className="button primary" href="/admin/letters/new"><Plus size={16} />New letter</Link>
      </header>
      <LetterList letters={letters} />
    </>
  );
}
