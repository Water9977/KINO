import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kino | Premium Streaming Experience",
  description: "Unlimited movies, TV shows, and more. Stream with cinematic quality and premium features.",
  keywords: "movies, streaming, tv shows, kino, cinema",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark selection:bg-blue-600/30">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-[#0a0a0a] text-white custom-scrollbar`}
      >
        {children}
      </body>
    </html>
  );
}

