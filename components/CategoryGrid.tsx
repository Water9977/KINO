"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { MovieCard } from "./MovieCard";
import { fetchMovies } from "@/app/actions";
import { Loader2 } from "lucide-react";

interface CategoryGridProps {
    initialMovies: any[];
    category: string;
}

export function CategoryGrid({ initialMovies, category }: CategoryGridProps) {
    const [movies, setMovies] = useState(initialMovies);
    const [page, setPage] = useState(2); // Start fetching from page 2 (as page 1 is initial)
    const { ref, inView } = useInView();
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMoreMovies = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            // Fetch next 2 pages (40 items)
            const { movies: newMovies, nextPage } = await fetchMovies(category, page);

            if (!newMovies || newMovies.length === 0) {
                setHasMore(false);
            } else {
                setMovies((prev: any[]) => {
                    // Filter duplicates
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueNewMovies = newMovies.filter((m: any) => !existingIds.has(m.id));
                    return [...prev, ...uniqueNewMovies];
                });
                setPage(nextPage);
            }
        } catch (error) {
            console.error("Failed to load more movies:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (inView) {
            loadMoreMovies();
        }
    }, [inView]);



    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {movies.map((movie, idx) => (
                    <MovieCard key={`${movie.id}-${idx}`} movie={movie} index={idx} />
                ))}
            </div>

            {hasMore && (
                <div ref={ref} className="flex justify-center p-8 w-full mt-8">
                    <Loader2 className="animate-spin text-[#2563eb]" size={32} />
                </div>
            )}

            {!hasMore && movies.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                    You've reached the end of the list.
                </div>
            )}
        </>
    );
}
