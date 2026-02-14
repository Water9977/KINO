"use client";

import { motion } from "framer-motion";
import { Star, Play, Info, TrendingUp } from "lucide-react";
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
        <div className="relative h-[90vh] w-full overflow-hidden">
            {/* Background Image with Cinematic Masking */}
            <div className="absolute inset-0">
                <Image
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover object-top scale-105"
                    priority
                />
                {/* Multi-layered gradients for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex h-full max-w-7xl mx-auto flex-col justify-end px-6 lg:px-10 pb-40 md:pb-48">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="max-w-3xl"
                >
                    {/* Badge Row */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 rounded-full bg-[#2563eb]/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2563eb] border border-[#2563eb]/30 backdrop-blur-xl">
                            <TrendingUp size={12} />
                            Trending Now
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-white border border-white/10 backdrop-blur-xl">
                            <Star size={12} className="text-yellow-400" fill="currentColor" />
                            {movie.vote_average.toFixed(1)} / 10
                        </div>
                    </div>

                    {/* Title with Gradient Text */}
                    <h1 className="mb-6 font-outfit text-5xl font-black leading-[1.1] md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-2xl">
                        {movie.title}
                    </h1>

                    {/* Overview */}
                    <p className="mb-10 line-clamp-2 md:line-clamp-3 text-base md:text-xl text-gray-300 leading-relaxed max-w-2xl font-medium drop-shadow-md">
                        {movie.overview}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href={`/watch/${movie.id}`}>
                            <button className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-black tracking-wide text-black transition-all duration-500 hover:shadow-[0_0_40px_rgba(96,165,250,0.8)] active:scale-95">
                                <Play size={18} fill="currentColor" />
                                <span className="relative z-10">WATCH NOW</span>
                            </button>
                        </Link>

                        <button className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 active:scale-95">
                            <Info size={18} />
                            <span>MORE INFO</span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Cinematic bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>
    );
};

