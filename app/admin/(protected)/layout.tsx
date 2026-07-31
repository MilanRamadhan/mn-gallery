import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminUser } from "@/lib/queries/stories";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return (
    <div className="admin-shell">
      <AdminSidebar email={typeof user.email === "string" ? user.email : "Site owner"} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
