"use client";

import { motion } from "framer-motion";
import { Star, Play, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface Movie {
    id: number;
    title?: string;
    name?: string; // For TV shows
    poster_path: string;
    backdrop_path?: string; // Added for Hero
    vote_average: number;
    overview?: string; // Added for Hero
    release_date?: string;
    first_air_date?: string; // For TV shows
    media_type?: string;
}

export const MovieCard = ({ movie, index }: { movie: Movie; index: number }) => {
    const isTv = movie.media_type === 'tv' || !!movie.name; // Fallback check
    const linkHref = `/watch/${movie.id}${isTv ? '?type=tv' : ''}`;

    // Title fallback
    const title = movie.title || movie.name || 'Unknown Title';

    // Year fallback
    const date = movie.release_date || movie.first_air_date;
    const year = date?.split('-')[0] || 'N/A';

    const rating = movie.vote_average?.toFixed(1) || '0.0';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 6) * 0.1, duration: 0.5 }}
            className="group relative flex flex-col gap-3 rounded-2xl p-2 transition-all duration-500 hover:bg-white/5"
        >
            <Link href={linkHref} className="relative block w-full">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-kino-surface ring-1 ring-white/5 transition-all duration-500 group-hover:ring-[#2563eb]/50 group-hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)]">
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title || 'Movie Poster'}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                        loading="lazy"
                    />

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                    {/* Hover Content */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
                        <div className="translate-y-4 rounded-full bg-[#2563eb] p-4 shadow-2xl transition-all duration-500 group-hover:translate-y-0 group-hover:scale-110">
                            <Play size={24} fill="currentColor" className="text-white translate-x-0.5" />
                        </div>
                    </div>

                    {/* Quick Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <Star size={10} className="text-yellow-500" fill="currentColor" />
                        {rating}
                    </div>
                </div>
            </Link>

            <div className="flex flex-col gap-1.5 px-1 py-1">
                <Link href={linkHref}>
                    <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-white/90 transition-colors group-hover:text-white font-outfit">
                        {title}
                    </h3>
                </Link>

                <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{year}</span>
                    </div>
                    <span className="h-1 w-1 rounded-full bg-gray-700" />
                    <span className="uppercase tracking-wider text-gray-600">{movie.media_type || (isTv ? 'TV' : 'Movie')}</span>
                </div>
            </div>

            {/* Subtle bottom accent line on hover */}
            <div className="absolute bottom-1 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/20 to-transparent scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
        </motion.div>
    );
};

