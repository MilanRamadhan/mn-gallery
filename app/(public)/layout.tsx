import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { getSiteSettings } from "@/lib/queries/stories";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <div className="public-shell" style={{ "--accent": settings.accent_color ?? "#f29abb" } as React.CSSProperties}>
      <PublicNavbar coupleName={settings.person_one + " & " + settings.person_two} />
      {children}
      <PublicFooter personOne={settings.person_one} personTwo={settings.person_two} />
    </div>
  );
}
