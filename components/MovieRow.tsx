"use client";

import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Movie, MovieCard } from "./MovieCard";
import { motion } from "framer-motion";

interface MovieRowProps {
    title: string;
    movies: Movie[];
    viewAllLink?: string;
}

export const MovieRow = ({ title, movies, viewAllLink }: MovieRowProps) => {
    const rowRef = useRef<HTMLDivElement>(null);

    if (!movies || movies.length === 0) return null;

    return (
        <div className="space-y-4 py-8">
            <div className="flex items-center justify-between px-6 md:px-10">
                <h2 className="text-2xl font-bold text-white font-outfit tracking-tight flex items-center gap-2">
                    {title}
                </h2>
                {viewAllLink && (
                    <Link
                        href={viewAllLink}
                        className="group flex items-center gap-1 text-sm font-medium text-white/60 transition-colors hover:text-[#2563eb]"
                    >
                        View All
                        <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                )}
            </div>

            <div className="relative">
                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-8 pt-2 no-scrollbar scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie, index) => (
                        <div key={movie.id} className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] flex-shrink-0">
                            <MovieCard movie={movie} index={index} />
                        </div>
                    ))}
                </div>

                {/* Fade edges */}
                <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
                <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
            </div>
        </div>
    );
};
