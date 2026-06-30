import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// ─── Dirtyline Studio fonts — next/font/local auto-injects <link rel="preload">
// so the browser fetches them before first paint. display:"block" means the
// text stays invisible for a short burst period rather than flashing the
// fallback font first (FOUT). Combined with preload, the window is imperceptible.
const sweetline = localFont({
  src: "../public/fonts/Sweetline.otf",
  variable: "--font-sweetline",
  display: "block",
});

const blackHeat = localFont({
  src: "../public/fonts/BlackHeat.otf",
  variable: "--font-blackheat",
  display: "block",
});

const blackTheory = localFont({
  src: "../public/fonts/BlackTheory.otf",
  variable: "--font-blacktheory",
  display: "block",
});

const skywalker = localFont({
  src: "../public/fonts/Skywalker.otf",
  variable: "--font-skywalker",
  display: "block",
});

const neueMetana = localFont({
  src: "../public/fonts/NeueMetana.otf",
  variable: "--font-neuemetana",
  display: "block",
});

const hoodsonScript = localFont({
  src: "../public/fonts/HoodsonScript.otf",
  variable: "--font-hoodsonscript",
  display: "block",
});

// Humblle Rought Caps — all-caps rough-texture display face, unmistakably
// different from any system font. Used for sci-fi (gritty industrial future).
const humblleCaps = localFont({
  src: "../public/fonts/HumblleRoughCaps.otf",
  variable: "--font-humbllerought",
  display: "block",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Kino | Premium Streaming Experience",
  description: "Unlimited movies, TV shows, and more. Stream with cinematic quality and premium features.",
  keywords: "movies, streaming, tv shows, kino, cinema",

  // PWA / App identity
  applicationName: "Kino",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kino",
  },
  formatDetection: {
    telephone: false,
  },

  // Open Graph
  openGraph: {
    type: "website",
    siteName: "Kino",
    title: "Kino | Premium Streaming Experience",
    description: "Unlimited movies, TV shows, and more.",
  },

  // Icons
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark selection:bg-blue-600/30 ${sweetline.variable} ${blackHeat.variable} ${blackTheory.variable} ${skywalker.variable} ${neueMetana.variable} ${hoodsonScript.variable} ${humblleCaps.variable}`}
    >
      <head>
        {/* PWA install prompt support for mobile browsers */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kino" />
        {/* Splash screen color on Android */}
        <meta name="msapplication-navbutton-color" content="#0a0a0a" />
        <meta name="msapplication-starturl" content="/browse" />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} antialiased bg-[#0a0a0a] text-white custom-scrollbar`}
      >
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
