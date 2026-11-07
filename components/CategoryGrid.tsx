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

/**
 * Infinite-scroll grid.
 *
 * The inner grid is re-mounted whenever the query changes (category, type or any filter). That
 * is the whole fix for a stale-response race: the FilterBar only changes the URL, so the old
 * grid instance used to survive a filter change, and a request still in flight for the previous
 * filter landed afterwards, appended old-filter titles to the new grid and overwrote its page
 * counter (so the new filter's next pages were skipped). A fresh instance owns fresh state, and
 * the abandoned one can no longer touch what is on screen.
 */
export function CategoryGrid(props: CategoryGridProps) {
    // Object props get a new identity on every parent render; the serialised value only changes
    // when the query really does.
    const queryKey = JSON.stringify({ category: props.category, type: props.type ?? "movie", filters: props.filters });
    return <CategoryGridInner key={queryKey} {...props} />;
}

function CategoryGridInner({ initialMovies, category, type = "movie", filters }: CategoryGridProps) {
    const [movies, setMovies] = useState<TmdbListItem[]>(initialMovies);
    const [page, setPage] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    /** Spoken to screen readers; the visual grid just grows. */
    const [announcement, setAnnouncement] = useState("");

    const { ref, inView } = useInView({ rootMargin: "400px" });

    // Guards the loader against re-entry while a request is in flight, without
    // making `loadMore` depend on the isLoading state (which would re-create it
    // on every toggle and retrigger the effect).
    const loadingRef = useRef(false);

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
            setAnnouncement(result.hasMore ? "More titles loaded." : "You've reached the end of the list.");
        } catch (err) {
            console.error("Failed to load more titles:", err);
            setError("We couldn't load more titles. Check your connection and try again.");
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
        // `filters` is covered by the component's `key` (see CategoryGrid): a different filter set
        // is a different instance, so this callback only ever sees one.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, page, type]);

    useEffect(() => {
        if (inView && hasMore && !error) {
            loadMore();
        }
    }, [inView, hasMore, error, loadMore]);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                {movies.map((movie, idx) => (
                    <MovieCard key={`${movie.id}-${idx}`} movie={movie} index={idx} headingLevel="h2" />
                ))}
            </div>

            {/* One persistent region: its text changing is what makes assistive tech speak. */}
            <p role="status" className="sr-only">
                {announcement}
            </p>

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
                <div ref={ref} className="flex justify-center p-8 w-full mt-8">
                    {isLoading && <KineticDotsLoader label="Loading more titles" />}
                </div>
            )}

            {!hasMore && !error && movies.length > 0 && (
                <p className="py-8 text-center text-gray-400">
                    You&apos;ve reached the end of the list.
                </p>
            )}
        </>
    );
}
