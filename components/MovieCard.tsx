"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    media_type?: string;
}

export const MovieCard = ({ movie, index }: { movie: Movie; index: number }) => {
    const isTv = movie.media_type === 'tv';
    const linkHref = `/watch/${movie.id}${isTv ? '?type=tv' : ''}`;

    return (
        <div className="group flex flex-col gap-3 cursor-pointer p-2 rounded-xl transition-colors duration-300 hover:bg-white/5">
            <Link href={linkHref} className="w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-900 border border-white/5 shadow-lg transition-all duration-200 ease-out group-hover:scale-[1.02] group-hover:border-[#2563eb] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                >
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Subtle Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-110">
                        <div className="rounded-full bg-[#2563eb] p-3 shadow-[0_0_20px_rgba(37,99,235,0.6)] backdrop-blur-sm transform scale-90 transition-transform duration-200 group-hover:scale-100">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </motion.div>
            </Link>

            <div className="flex flex-col gap-1 px-1">
                <Link href={linkHref}>
                    <h3 className="line-clamp-1 text-Base font-medium text-gray-200 transition-colors duration-200 group-hover:text-white">
                        {movie.title}
                    </h3>
                </Link>

                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-medium">{movie.release_date?.split('-')[0] || 'N/A'}</span>
                    <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500" fill="currentColor" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
