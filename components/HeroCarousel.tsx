"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Play, Star, Calendar } from "lucide-react";
import { Movie } from "./MovieCard";

interface HeroCarouselProps {
    movies: Movie[];
}

export const HeroCarousel = ({ movies }: HeroCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [movies.length]);

    if (!movies || movies.length === 0) return null;

    const currentMovie = movies[currentIndex];
    const isTv = currentMovie.media_type === 'tv' || !!currentMovie.name;
    const title = currentMovie.title || currentMovie.name || "Unknown Title";
    const date = currentMovie.release_date || currentMovie.first_air_date;
    const year = date?.split('-')[0] || "N/A";

    // We don't have detailed info like 'Seasons' in standard list response, so we omit specific pills requiring that unless we fetch details.
    // For now, will use Rating and Year.

    return (
        <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Backdrop */}
                    <Image
                        src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-30 flex h-full items-end pb-24 md:pb-40 px-4 md:px-10 w-full pointer-events-none">
                <div className="max-w-4xl w-full pointer-events-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${currentMovie.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-4"
                        >
                            {/* Meta Pills */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold backdrop-blur-md border border-white/10 text-yellow-400 text-sm">
                                    <Star size={14} fill="currentColor" />
                                    <span>{currentMovie.vote_average?.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium backdrop-blur-md border border-white/10 text-white text-sm">
                                    <Calendar size={14} />
                                    <span>{year}</span>
                                </div>
                                <div className="rounded-full bg-white/10 px-3 py-1 font-medium backdrop-blur-md border border-white/10 text-white uppercase text-[10px] md:text-xs tracking-wider">
                                    {isTv ? 'Series' : 'Movie'}
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-full md:max-w-3xl">
                                {title}
                            </h1>

                            <p className="text-base md:text-lg text-gray-300 line-clamp-3 font-medium max-w-full md:max-w-xl leading-relaxed">
                                {currentMovie.overview}
                            </p>

                            <div className="flex items-center gap-4 pt-4">
                                <Link href={`/watch/${currentMovie.id}${isTv ? '?type=tv' : ''}`}>
                                    <div className="group relative flex items-center gap-3 rounded-full bg-white px-6 py-3 md:px-8 md:py-3.5 font-bold text-black transition-all duration-150 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95">
                                        <div className="relative z-10 flex items-center gap-2">
                                            <Play size={20} fill="currentColor" />
                                            <span>Watch Now</span>
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 to-white opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                                    </div>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-24 md:bottom-36 right-6 md:right-10 z-30 flex gap-2">
                {movies.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
