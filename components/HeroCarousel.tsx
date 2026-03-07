"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Info, Play, Star, Calendar } from "lucide-react";
import { Movie } from "./MovieCard";
import { hapticMedium, hapticTick } from "@/lib/haptics";

interface HeroCarouselProps {
    movies: Movie[];
}

const KEN_BURNS_VARIANTS = [
    { initial: { scale: 1, x: 0, y: 0 }, animate: { scale: 1.08, x: -20, y: -10 } },
    { initial: { scale: 1.05, x: -15, y: 0 }, animate: { scale: 1, x: 0, y: -15 } },
    { initial: { scale: 1, x: 20, y: 0 }, animate: { scale: 1.08, x: 0, y: -10 } },
    { initial: { scale: 1.08, x: 0, y: -10 }, animate: { scale: 1, x: -20, y: 0 } },
];

export const HeroCarousel = ({ movies }: HeroCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const kennVariantRef = useRef(0);

    const advanceSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
        kennVariantRef.current = (kennVariantRef.current + 1) % KEN_BURNS_VARIANTS.length;
    }, [movies.length]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(advanceSlide, 8000);
    }, [advanceSlide]);

    // Auto-advance with pause on interaction
    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [resetTimer]);

    // Detect mobile virtual keyboard
    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const handleViewportResize = () => {
            const diff = window.innerHeight - vv.height;
            setIsKeyboardOpen(diff > 150);
        };

        vv.addEventListener("resize", handleViewportResize);
        return () => vv.removeEventListener("resize", handleViewportResize);
    }, []);

    const goToSlide = (idx: number) => {
        hapticTick();
        setCurrentIndex(idx);
        kennVariantRef.current = idx % KEN_BURNS_VARIANTS.length;
        resetTimer();
    };

    if (!movies || movies.length === 0) return null;

    const currentMovie = movies[currentIndex];
    const isTv = currentMovie.media_type === 'tv' || !!currentMovie.name;
    const title = currentMovie.title || currentMovie.name || "Unknown Title";
    const date = currentMovie.release_date || currentMovie.first_air_date;
    const year = date?.split('-')[0] || "N/A";
    const kbVariant = KEN_BURNS_VARIANTS[kennVariantRef.current];

    return (
        <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* Ken Burns Effect — uses will-change for GPU compositing, avoids layout thrash */}
                    <motion.div
                        key={`kb-${currentMovie.id}`}
                        initial={kbVariant.initial}
                        animate={kbVariant.animate}
                        transition={{
                            duration: 10,
                            ease: "linear",
                        }}
                        style={{ willChange: "transform" }}
                        className="absolute inset-[-5%] w-[110%] h-[110%]"
                    >
                        <Image
                            src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                            quality={85}
                        />
                    </motion.div>

                    {/* Cinematic Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                    {/* Subtle vignette for cinematic feel */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-30 flex h-full items-end pb-24 md:pb-40 px-4 md:px-10 w-full pointer-events-none">
                <div className="max-w-4xl w-full pointer-events-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${currentMovie.id}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="space-y-4"
                        >
                            {/* Meta Pills */}
                            <motion.div
                                animate={{
                                    opacity: isKeyboardOpen ? 0 : 1,
                                    height: isKeyboardOpen ? 0 : "auto",
                                    marginBottom: isKeyboardOpen ? 0 : undefined,
                                }}
                                transition={{ duration: 0.25 }}
                                className="flex items-center gap-3 overflow-hidden"
                            >
                                <div className="hero-pill text-yellow-400">
                                    <Star size={12} fill="currentColor" />
                                    <span>{currentMovie.vote_average?.toFixed(1)}</span>
                                </div>
                                <div className="hero-pill text-white/80">
                                    <Calendar size={12} />
                                    <span>{year}</span>
                                </div>
                                <div className="hero-pill text-white/80 uppercase text-[9px] md:text-[10px] tracking-wider">
                                    {isTv ? 'Series' : 'Movie'}
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h1
                                animate={{
                                    fontSize: isKeyboardOpen ? "1.5rem" : undefined,
                                    lineHeight: isKeyboardOpen ? "1.2" : undefined,
                                }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-full md:max-w-3xl drop-shadow-2xl"
                            >
                                {title}
                            </motion.h1>

                            {/* Overview */}
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

                            {/* Watch Now Button */}
                            <motion.div
                                animate={{
                                    scale: isKeyboardOpen ? 0.88 : 1,
                                    opacity: isKeyboardOpen ? 0.75 : 1,
                                }}
                                transition={{ duration: 0.25 }}
                                className="flex items-center gap-4 pt-2 origin-left"
                            >
                                <Link
                                    href={`/watch/${currentMovie.id}${isTv ? '?type=tv' : ''}`}
                                    onClick={hapticMedium}
                                    className="group relative flex items-center gap-2.5 rounded-full bg-white px-6 py-3 md:px-8 md:py-3.5 font-bold text-black transition-transform duration-150 active:scale-95 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]"
                                >
                                    <Play size={18} fill="currentColor" />
                                    <span>Watch Now</span>
                                    {/* Shimmer sweep on hover */}
                                    <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[100%] transition-all duration-700" />
                                    </div>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-24 md:bottom-36 right-6 md:right-10 z-30 flex gap-2 items-center">
                {movies.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/25 hover:bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
