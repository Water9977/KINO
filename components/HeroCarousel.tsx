"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, Star, Calendar } from "lucide-react";

import { tmdbImage } from "@/lib/tmdb";
import type { Movie } from "./MovieCard";
import { hapticMedium, hapticTick } from "@/lib/haptics";

interface HeroCarouselProps {
    movies: Movie[];
}

const SLIDE_DURATION_MS = 8000;

const KEN_BURNS_VARIANTS = [
    { initial: { scale: 1, x: 0, y: 0 }, animate: { scale: 1.08, x: -20, y: -10 } },
    { initial: { scale: 1.05, x: -15, y: 0 }, animate: { scale: 1, x: 0, y: -15 } },
    { initial: { scale: 1, x: 20, y: 0 }, animate: { scale: 1.08, x: 0, y: -10 } },
    { initial: { scale: 1.08, x: 0, y: -10 }, animate: { scale: 1, x: -20, y: 0 } },
];

export const HeroCarousel = ({ movies }: HeroCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reduceMotion = useReducedMotion();

    const slideCount = movies?.length ?? 0;

    const advanceSlide = useCallback(() => {
        setCurrentIndex((prev) => (slideCount > 0 ? (prev + 1) % slideCount : 0));
    }, [slideCount]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(advanceSlide, SLIDE_DURATION_MS);
    }, [advanceSlide]);

    // Auto-advance, paused on hover/focus and while the tab is in the background.
    useEffect(() => {
        if (reduceMotion || isPaused || slideCount <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        resetTimer();

        const handleVisibility = () => {
            if (document.hidden) {
                if (timerRef.current) clearInterval(timerRef.current);
            } else {
                resetTimer();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [resetTimer, reduceMotion, isPaused, slideCount]);

    // Shrink hero content while the mobile virtual keyboard is open.
    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const handleViewportResize = () => {
            setIsKeyboardOpen(window.innerHeight - vv.height > 150);
        };

        vv.addEventListener("resize", handleViewportResize);
        return () => vv.removeEventListener("resize", handleViewportResize);
    }, []);

    const goToSlide = (idx: number) => {
        hapticTick();
        setCurrentIndex(idx);
        resetTimer();
    };

    if (slideCount === 0) return null;

    const currentMovie = movies[currentIndex];
    const isTv = currentMovie.media_type === "tv" || (!currentMovie.title && !!currentMovie.name);
    const title = currentMovie.title || currentMovie.name || "Untitled";
    const date = currentMovie.release_date || currentMovie.first_air_date;
    const year = date?.split("-")[0] || "N/A";
    const backdropUrl = tmdbImage(currentMovie.backdrop_path, "w1280");

    // Derived from the index rather than read from a ref during render — a ref
    // is not reactive, so React could render a stale variant.
    const kbVariant = KEN_BURNS_VARIANTS[currentIndex % KEN_BURNS_VARIANTS.length];

    return (
        <section
            aria-label="Featured titles"
            aria-roledescription="carousel"
            className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <motion.div
                        initial={reduceMotion ? false : kbVariant.initial}
                        animate={reduceMotion ? undefined : kbVariant.animate}
                        transition={{ duration: 10, ease: "linear" }}
                        style={{ willChange: "transform" }}
                        className="absolute inset-[-5%] w-[110%] h-[110%]"
                    >
                        {backdropUrl && (
                            <Image
                                src={backdropUrl}
                                alt=""
                                fill
                                className="object-cover"
                                priority={currentIndex === 0}
                                sizes="100vw"
                                quality={80}
                            />
                        )}
                    </motion.div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />
                </motion.div>
            </AnimatePresence>

            {/* pt-28 keeps the meta pills clear of the fixed navbar on short viewports. */}
            <div className="relative z-30 flex h-full items-end pt-28 pb-24 md:pb-40 px-4 md:px-10 w-full pointer-events-none">
                <div className="max-w-4xl w-full pointer-events-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${currentMovie.id}`}
                            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="space-y-4"
                        >
                            <motion.div
                                animate={{
                                    opacity: isKeyboardOpen ? 0 : 1,
                                    height: isKeyboardOpen ? 0 : "auto",
                                }}
                                transition={{ duration: 0.25 }}
                                className="flex items-center gap-3 overflow-hidden"
                            >
                                {currentMovie.vote_average > 0 && (
                                    <span className="hero-pill text-yellow-400">
                                        <Star size={12} fill="currentColor" />
                                        {currentMovie.vote_average.toFixed(1)}
                                    </span>
                                )}
                                <span className="hero-pill text-white/80">
                                    <Calendar size={12} />
                                    {year}
                                </span>
                                <span className="hero-pill text-white/80 uppercase text-[9px] md:text-[10px] tracking-wider">
                                    {isTv ? "Series" : "Movie"}
                                </span>
                            </motion.div>

                            <motion.h2
                                animate={{
                                    fontSize: isKeyboardOpen ? "1.5rem" : undefined,
                                    lineHeight: isKeyboardOpen ? "1.2" : undefined,
                                }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-full md:max-w-3xl drop-shadow-2xl"
                            >
                                {title}
                            </motion.h2>

                            <motion.p
                                animate={{
                                    opacity: isKeyboardOpen ? 0 : 1,
                                    height: isKeyboardOpen ? 0 : "auto",
                                }}
                                transition={{ duration: 0.25 }}
                                className="text-sm md:text-base text-gray-400 line-clamp-2 font-medium max-w-full md:max-w-xl leading-relaxed overflow-hidden"
                            >
                                {currentMovie.overview}
                            </motion.p>

                            <motion.div
                                animate={{
                                    scale: isKeyboardOpen ? 0.88 : 1,
                                    opacity: isKeyboardOpen ? 0.75 : 1,
                                }}
                                transition={{ duration: 0.25 }}
                                className="flex items-center gap-4 pt-2 origin-left"
                            >
                                <Link
                                    href={`/watch/${currentMovie.id}${isTv ? "?type=tv" : ""}`}
                                    onClick={hapticMedium}
                                    className="group relative flex items-center gap-2.5 rounded-full bg-white px-6 py-3 md:px-8 md:py-3.5 font-bold text-black transition-transform duration-150 active:scale-95 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                                >
                                    <Play size={18} fill="currentColor" />
                                    <span>Watch Now</span>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="absolute bottom-24 md:bottom-36 right-6 md:right-10 z-30 flex gap-2 items-center">
                {movies.map((movie, idx) => (
                    <button
                        key={movie.id}
                        onClick={() => goToSlide(idx)}
                        aria-label={`Show slide ${idx + 1} of ${slideCount}`}
                        aria-current={idx === currentIndex ? "true" : undefined}
                        // 24px hit area with a smaller visible bar inside, so the
                        // control meets minimum target size without looking chunky.
                        className="group grid h-6 w-6 place-items-center focus-visible:outline-none"
                    >
                        <span
                            className={`h-1.5 rounded-full transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-white ${idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/25 group-hover:bg-white/50"
                                }`}
                        />
                    </button>
                ))}
            </div>
        </section>
    );
};
