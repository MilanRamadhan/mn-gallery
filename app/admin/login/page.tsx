import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminUser } from "@/lib/queries/stories";

export default async function AdminLoginPage() {
  const user = await getAdminUser();
  if (user) redirect("/admin");
  return (
    <main className="login-page">
      <Link href="/"><ArrowLeft size={15} />Return to Our Story</Link>
      <div className="login-art" aria-hidden="true"><span>Private<br />collection</span><small>For the keepers of the archive</small></div>
      <LoginForm />
    </main>
  );
}
