import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Private Archive", template: "%s · Private Archive" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
