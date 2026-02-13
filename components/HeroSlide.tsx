"use client";

import { motion } from "framer-motion";
import { Star, PlayCircle, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Movie {
    id: number;
    title: string;
    overview: string;
    backdrop_path: string;
    vote_average: number;
}

export const HeroSlide = ({ movie }: { movie: Movie }) => {
    if (!movie) return null;

    return (
        <div className="relative h-[85vh] w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-kino-dark via-kino-dark/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-kino-dark via-kino-dark/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full max-w-7xl mx-auto flex-col justify-end px-6 pb-48">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <span className="rounded-full bg-[#2563eb]/20 px-3 py-1 text-xs font-bold text-[#2563eb] border border-[#2563eb]/20 backdrop-blur-md">
                            Featured
                        </span>
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" fill="currentColor" />
                            <span className="text-sm font-medium text-gray-200">{movie.vote_average.toFixed(1)}</span>
                        </div>
                    </div>

                    <h1 className="mb-4 text-5xl font-black leading-tight text-white md:text-7xl">
                        {movie.title}
                    </h1>

                    <p className="mb-8 line-clamp-3 text-lg text-gray-300">
                        {movie.overview}
                    </p>

                    <div className="flex items-center gap-4">
                        <Link href={`/watch/${movie.id}`}>
                            <button className="group flex items-center gap-2 rounded-xl bg-[#2563eb] px-8 py-4 font-bold text-white transition-all hover:bg-white hover:text-[#2563eb] hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                <PlayCircle size={24} fill="currentColor" />
                                <span>Watch Now</span>
                            </button>
                        </Link>
                        <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-105 active:scale-95">
                            <Info size={24} />
                            <span>More Info</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
