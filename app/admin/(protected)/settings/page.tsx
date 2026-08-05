import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAdminSiteSettings } from "@/lib/queries/stories";

export default async function AdminSettingsPage() {
  const settings = await getAdminSiteSettings();
  return (
    <>
      <header className="admin-page-heading"><div><p className="eyebrow">Website identity</p><h1>Settings</h1><p>Change the names, date, message, imagery, and public visibility.</p></div></header>
      <SettingsForm settings={settings} />
      <ChangePasswordForm />
    </>
  );
}
