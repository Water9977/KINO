import { Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";

// ─── App-wide UI fonts ────────────────────────────────────────────────────────
// These load on every route, so they stay in the root layout.

export const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
    display: "swap",
});

export const uiFontVariables = `${inter.variable} ${outfit.variable}`;

// ─── Landing-page display faces ───────────────────────────────────────────────
// Each of these draws exactly one genre word in the landing hero and is used
// nowhere else. They are deliberately NOT in the root layout: declaring them
// there made Next preload ~2.5 MB of .otf on every route in the app, including
// pages that render none of them.
//
// `preload: false` keeps them out of the document <head> preload list; they are
// fetched only when the rule that references them actually matches. `display:
// "swap"` shows the fallback immediately rather than leaving the word invisible.

// next/font requires literal option objects at the call site — it reads them at
// build time, so a shared spread constant is rejected. Hence the repetition.

const sweetline = localFont({
    src: "../public/fonts/Sweetline.otf",
    variable: "--font-sweetline",
    preload: false,
    display: "swap",
});

const blackHeat = localFont({
    src: "../public/fonts/BlackHeat.otf",
    variable: "--font-blackheat",
    preload: false,
    display: "swap",
});

const blackTheory = localFont({
    src: "../public/fonts/BlackTheory.otf",
    variable: "--font-blacktheory",
    preload: false,
    display: "swap",
});

const skywalker = localFont({
    src: "../public/fonts/Skywalker.otf",
    variable: "--font-skywalker",
    preload: false,
    display: "swap",
});

const hoodsonScript = localFont({
    src: "../public/fonts/HoodsonScript.otf",
    variable: "--font-hoodsonscript",
    preload: false,
    display: "swap",
});

const humblleCaps = localFont({
    src: "../public/fonts/HumblleRoughCaps.otf",
    variable: "--font-humbllerought",
    preload: false,
    display: "swap",
});

/** Apply to the landing page wrapper only. */
export const displayFontVariables = [
    sweetline.variable,
    blackHeat.variable,
    blackTheory.variable,
    skywalker.variable,
    hoodsonScript.variable,
    humblleCaps.variable,
].join(" ");
