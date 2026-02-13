"use server";

import { TMDB } from "@/lib/tmdb";

export async function fetchMovies(category: string, page: number) {
    // Fetch 2 pages to get 40 items (user asked for 30)
    const [page1, page2] = await Promise.all([
        TMDB.getMoviesByCategory(category, page),
        TMDB.getMoviesByCategory(category, page + 1)
    ]);

    return {
        movies: [...(page1.results || []), ...(page2.results || [])],
        nextPage: page + 2
    };
}
