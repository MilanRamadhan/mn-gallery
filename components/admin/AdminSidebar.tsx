"use client";

import { BookOpenText, ExternalLink, FolderHeart, Images, LayoutGrid, LogOut, Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/stories", label: "Stories", icon: BookOpenText },
  { href: "/admin/categories", label: "Categories", icon: FolderHeart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await createClient()?.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      <button className="admin-menu-button" type="button" aria-label="Open admin navigation" onClick={() => setOpen(true)}><Menu /></button>
      <aside className={"admin-sidebar " + (open ? "open" : "")}>
        <button className="admin-close" type="button" aria-label="Close admin navigation" onClick={() => setOpen(false)}><X /></button>
        <Link className="admin-brand" href="/admin"><span>M + N</span><div><strong>Our Story</strong><small>Milan & Nora</small></div></Link>
        <nav aria-label="Admin navigation">
          {links.map((link) => {
            const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""} onClick={() => setOpen(false)}><link.icon size={17} />{link.label}</Link>;
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/gallery" target="_blank"><Images size={17} />View gallery <ExternalLink size={13} /></Link>
          <Link href="/" target="_blank"><ExternalLink size={17} />View website</Link>
          <button type="button" onClick={logout}><LogOut size={17} />Sign out</button>
          <span>{email}</span>
        </div>
      </aside>
      {open && <button className="admin-drawer-scrim" aria-label="Close admin navigation" onClick={() => setOpen(false)} />}
      <nav className="admin-mobile-nav" aria-label="Admin mobile navigation">
        {links.slice(0, 3).map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}><link.icon size={18} /><span>{link.label}</span></Link>)}
      </nav>
    </>
  );
}
