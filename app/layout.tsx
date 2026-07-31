import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { siteConfig } from "@/config/site";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600"],
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://our-story.example"),
  title: {
    default: `${siteConfig.title} — ${siteConfig.personOne} & ${siteConfig.personTwo}`,
    template: `%s · ${siteConfig.title}`,
  },
  description: siteConfig.tagline,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${siteConfig.title} — ${siteConfig.personOne} & ${siteConfig.personTwo}`,
    description: siteConfig.tagline,
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Our Story relationship journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title} — ${siteConfig.personOne} & ${siteConfig.personTwo}`,
    description: siteConfig.tagline,
    images: ["/og.png"],
  },
  robots: { index: !siteConfig.noIndex, follow: !siteConfig.noIndex },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={heading.variable + " " + body.variable}>
      <body>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
