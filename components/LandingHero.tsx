"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";

import CinemaFlipWords from "@/components/CinemaFlipWords";

const EvilEye = dynamic(() => import("@/components/EvilEye"), { ssr: false });
const PosterTrail = dynamic(() => import("@/components/PosterTrail"), { ssr: false });

export function LandingHero() {
    const reduceMotion = useReducedMotion();

    // `min-h-screen` + vertical padding rather than a hard `h-screen` crop:
    // on short viewports (landscape phones, small laptops) the fixed height was
    // clipping the tagline and the call to action with no way to scroll to them.
    return (
        <main
            className="relative flex min-h-screen w-full flex-col items-center justify-center gap-5 overflow-x-hidden px-6 py-16 text-center"
            style={{ background: "#0a0a0a" }}
        >
            {!reduceMotion && <PosterTrail />}

            <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.0, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-[2] shrink-0"
                style={{ width: "min(300px, 44vw)", height: "min(200px, 29vw)" }}
            >
                <EvilEye
                    eyeColor="#FF6F37"
                    backgroundColor="#0a0a0a"
                    intensity={1.3}
                    scale={0.75}
                    glowIntensity={0.4}
                    pupilFollow={0}
                    flameSpeed={0.9}
                />
            </motion.div>

            <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: -36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-20 font-black tracking-tight leading-none select-none"
                style={{ fontSize: "clamp(3.5rem, 18vw, 14rem)" }}
            >
                <span className="text-white">KIN</span>
                <span
                    style={{ color: "#2563eb", filter: "drop-shadow(0 0 48px rgba(37,99,235,0.6))" }}
                >
                    O
                </span>
            </motion.h1>

            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.55 }}
                className="relative z-20"
            >
                <CinemaFlipWords />
            </motion.div>

            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-20"
            >
                <Link
                    href="/browse"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#2563eb] px-8 py-[14px] font-semibold text-white tracking-wide transition-all duration-300 hover:shadow-[0_0_48px_rgba(37,99,235,0.5)] active:scale-95 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                    style={{ fontSize: "0.95rem", fontFamily: "var(--font-outfit)" }}
                >
                    <span
                        className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)",
                        }}
                        aria-hidden="true"
                    />
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        className="relative w-[18px] h-[18px] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                    >
                        <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                    <span className="relative">Start Streaming</span>
                </Link>
            </motion.div>
        </main>
    );
}
