import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // No template here: the public and admin layouts each define their own, so the homepage title is not suffixed twice.
  title: "Ahem Corporation — Construction, Civil Engineering & Infrastructure Contractor",
  description:
    "Ahem Corporation is a construction company and civil engineering contractor delivering infrastructure development, commercial construction and project management for government tenders and private clients.",
  applicationName: "Ahem Corporation",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#10243A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
