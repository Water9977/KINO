"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { AlertTriangle } from "lucide-react";

import { MovieCard } from "./MovieCard";
import { fetchMovies, type DiscoverFilters } from "@/app/actions";
import type { MediaType, TmdbListItem } from "@/lib/types";
import KineticDotsLoader from "@/components/ui/kinetic-dots-loader";

interface CategoryGridProps {
    initialMovies: TmdbListItem[];
    category: string;
    type?: MediaType;
    filters?: DiscoverFilters;
}

export function CategoryGrid({
    initialMovies,
    category,
    type = "movie",
    filters,
}: CategoryGridProps) {
    const [movies, setMovies] = useState<TmdbListItem[]>(initialMovies);
    const [page, setPage] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { ref, inView } = useInView({ rootMargin: "400px" });

    // Guards the loader against re-entry while a request is in flight, without
    // making `loadMore` depend on the isLoading state (which would re-create it
    // on every toggle and retrigger the effect).
    const loadingRef = useRef(false);

    // A stable key for the current query. Object props get a new identity on
    // every parent render, so comparing serialized values avoids resetting the
    // grid for a filter set that hasn't actually changed.
    const queryKey = JSON.stringify({ category, type, filters });

    const loadMore = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchMovies(category, page, type, filters);

            setMovies((prev) => {
                const seen = new Set(prev.map((m) => m.id));
                return [...prev, ...result.movies.filter((m) => !seen.has(m.id))];
            });
            setPage(result.nextPage);
            setHasMore(result.hasMore);
        } catch (err) {
            console.error("Failed to load more titles:", err);
            setError("We couldn't load more titles. Check your connection and try again.");
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
        // `filters` is compared via queryKey; including the object itself would
        // re-create this callback on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, page, type, queryKey]);

    useEffect(() => {
        if (inView && hasMore && !error) {
            loadMore();
        }
    }, [inView, hasMore, error, loadMore]);

    // Reset the grid whenever the underlying query changes.
    useEffect(() => {
        setMovies(initialMovies);
        setPage(2);
        setHasMore(true);
        setError(null);
        // initialMovies is re-fetched by the server for each queryKey.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey]);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                {movies.map((movie, idx) => (
                    <MovieCard key={`${movie.id}-${idx}`} movie={movie} index={idx} />
                ))}
            </div>

            {error && (
                <div
                    role="alert"
                    className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] py-10 text-center"
                >
                    <div className="rounded-full bg-amber-500/10 p-4 text-amber-400">
                        <AlertTriangle size={28} />
                    </div>
                    <p className="max-w-sm text-sm text-gray-400">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            loadMore();
                        }}
                        className="rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95"
                    >
                        Try again
                    </button>
                </div>
            )}

            {hasMore && !error && (
                <div ref={ref} className="flex justify-center p-8 w-full mt-8" aria-live="polite">
                    {isLoading && <KineticDotsLoader />}
                </div>
            )}

            {!hasMore && !error && movies.length > 0 && (
                <p className="py-8 text-center text-gray-500">
                    You&apos;ve reached the end of the list.
                </p>
            )}
        </>
    );
}
