import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
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
    <html lang="en" suppressHydrationWarning className="dark selection:bg-blue-600/30">
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
