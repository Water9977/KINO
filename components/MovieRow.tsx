"use client";

import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Movie, MovieCard } from "./MovieCard";
import { motion } from "framer-motion";
import { MovieCardSkeleton } from "./ui/skeleton";

interface MovieRowProps {
    title: string;
    movies: Movie[];
    viewAllLink?: string;
    isLoading?: boolean;
}

export const MovieRow = ({ title, movies, viewAllLink, isLoading }: MovieRowProps) => {
    const rowRef = useRef<HTMLDivElement>(null);

    // Show skeleton inline if explicitly loading or if no movies yet
    const showSkeleton = isLoading || (!movies || movies.length === 0);

    if (!isLoading && (!movies || movies.length === 0)) return null;

    return (
        <div className="space-y-4 py-8">
            <div className="flex items-center justify-between px-6 md:px-10 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white font-outfit tracking-tight truncate">
                    {title}
                </h2>
                {viewAllLink && !showSkeleton && (
                    <Link
                        href={viewAllLink}
                        className="group flex items-center gap-1 text-sm font-medium text-white/60 transition-colors hover:text-[#2563eb] shrink-0"
                    >
                        View All
                        <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
                    </Link>
                )}
                {showSkeleton && (
                    <div className="h-4 w-16 rounded-md bg-white/5 animate-pulse" />
                )}
            </div>

            <div className="relative">
                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-8 pt-2 no-scrollbar scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {showSkeleton
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] flex-shrink-0"
                            >
                                <MovieCardSkeleton />
                            </div>
                        ))
                        : movies.map((movie, index) => (
                            <div key={movie.id} className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] flex-shrink-0">
                                <MovieCard movie={movie} index={index} />
                            </div>
                        ))
                    }
                </div>

                {/* Fade edges */}
                <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
                <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
            </div>
        </div>
    );
};
