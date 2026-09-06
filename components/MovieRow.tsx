import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { MovieCard, type Movie } from "./MovieCard";

interface MovieRowProps {
    title: string;
    movies: Movie[];
    viewAllLink?: string;
}

export const MovieRow = ({ title, movies, viewAllLink }: MovieRowProps) => {
    if (!movies || movies.length === 0) return null;

    return (
        <section className="space-y-4 py-8" aria-labelledby={toId(title)}>
            <div className="flex items-center justify-between px-6 md:px-10 gap-4">
                <h2
                    id={toId(title)}
                    className="text-xl md:text-2xl font-bold text-white font-outfit tracking-tight truncate"
                >
                    {title}
                </h2>
                {viewAllLink && (
                    <Link
                        href={viewAllLink}
                        className="group flex items-center gap-1 text-sm font-medium text-white/60 transition-colors hover:text-[#2563eb] shrink-0"
                    >
                        View All
                        <ChevronRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1 shrink-0"
                        />
                    </Link>
                )}
            </div>

            <div className="relative">
                <div className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-8 pt-2 no-scrollbar scroll-smooth">
                    {movies.map((movie, index) => (
                        <div
                            key={movie.id}
                            className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] flex-shrink-0"
                        >
                            <MovieCard movie={movie} index={index} />
                        </div>
                    ))}
                </div>

                {/* Fade edges */}
                <div
                    className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10"
                    aria-hidden="true"
                />
                <div
                    className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10"
                    aria-hidden="true"
                />
            </div>
        </section>
    );
};

function toId(title: string) {
    return `row-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}
