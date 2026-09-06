"use client";

import { motion } from "framer-motion";
import { Star, Play, Calendar, Film } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb";
import type { TmdbListItem } from "@/lib/types";
import { hapticLight } from "@/lib/haptics";

export type Movie = TmdbListItem;

export const MovieCard = ({ movie, index }: { movie: Movie; index: number }) => {
    const isTv = movie.media_type === "tv" || (!movie.title && !!movie.name);
    const title = movie.title || movie.name || "Untitled";
    const linkHref = `/watch/${movie.id}${isTv ? "?type=tv" : ""}`;

    const date = movie.release_date || movie.first_air_date;
    const year = date?.split("-")[0] || "N/A";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
    const posterUrl = tmdbImage(movie.poster_path, "w500");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 6) * 0.1, duration: 0.5 }}
            className="group relative flex flex-col gap-3 rounded-2xl p-2 transition-all duration-500 hover:bg-white/5 active:scale-95"
        >
            <Link
                href={linkHref}
                className="relative block w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                onClick={hapticLight}
            >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-kino-surface ring-1 ring-white/5 transition-all duration-500 group-hover:ring-[#2563eb]/50 group-hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)]">
                    {posterUrl ? (
                        <Image
                            src={posterUrl}
                            alt={`${title} poster`}
                            fill
                            sizes="(max-width: 768px) 45vw, 200px"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                            loading="lazy"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/[0.03] text-gray-700">
                            <Film size={28} />
                            <span className="px-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
                                No poster
                            </span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
                        <div className="translate-y-4 rounded-full bg-[#2563eb] p-4 shadow-2xl transition-all duration-500 group-hover:translate-y-0 group-hover:scale-110">
                            <Play size={24} fill="currentColor" className="text-white translate-x-0.5" />
                        </div>
                    </div>

                    {rating && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10 opacity-100 lg:opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100">
                            <Star size={10} className="text-yellow-500" fill="currentColor" />
                            {rating}
                        </div>
                    )}
                </div>
            </Link>

            <div className="flex flex-col gap-1.5 px-1 py-1">
                <Link href={linkHref} tabIndex={-1}>
                    <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-white/90 transition-colors group-hover:text-white font-outfit">
                        {title}
                    </h3>
                </Link>

                <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500">
                    <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {year}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-700" aria-hidden="true" />
                    <span className="uppercase tracking-wider text-gray-600">
                        {isTv ? "TV" : "Movie"}
                    </span>
                </div>
            </div>

            <div
                className="absolute bottom-1 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/20 to-transparent scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden="true"
            />
        </motion.div>
    );
};
