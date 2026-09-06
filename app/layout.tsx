import type { Metadata, Viewport } from "next";
import "./globals.css";
import { uiFontVariables } from "@/lib/fonts";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kino-web-neon.vercel.app";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays enabled: blocking it fails WCAG 1.4.4 and locks out
  // low-vision users for a purely cosmetic "app-like" feel.
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kino | Premium Streaming Experience",
    template: "%s | Kino",
  },
  description:
    "Unlimited movies, TV shows, and more. Stream with cinematic quality and premium features.",
  keywords: ["movies", "streaming", "tv shows", "kino", "cinema"],
  alternates: { canonical: "/" },

  applicationName: "Kino",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kino",
  },
  formatDetection: { telephone: false },

  openGraph: {
    type: "website",
    siteName: "Kino",
    url: siteUrl,
    title: "Kino | Premium Streaming Experience",
    description: "Unlimited movies, TV shows, and more.",
  },

  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${uiFontVariables} antialiased bg-[#0a0a0a] text-white custom-scrollbar selection:bg-blue-600/30`}
      >
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
