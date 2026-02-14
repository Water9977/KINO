"use server";

import { TMDB } from "@/lib/tmdb";

export async function fetchMovies(category: string, page: number, type: 'movie' | 'tv' = 'movie', filters?: { sort_by: string; genre_id?: string; provider_id?: string }) {
    let page1, page2;

    if (category === 'discover') {
        // Use discover API
        const sort = filters?.sort_by || 'popularity.desc';
        const genre = filters?.genre_id;
        const provider = filters?.provider_id;

        [page1, page2] = await Promise.all([
            TMDB.discover(type, sort, genre, page, provider),
            TMDB.discover(type, sort, genre, page + 1, provider)
        ]);
    } else {
        // Standard categories
        [page1, page2] = await Promise.all([
            type === 'tv'
                ? TMDB.getTvShowsByCategory(category, page)
                : TMDB.getMoviesByCategory(category, page),
            type === 'tv'
                ? TMDB.getTvShowsByCategory(category, page + 1)
                : TMDB.getMoviesByCategory(category, page + 1)
        ]);
    }

    return {
        movies: [...(page1.results || []), ...(page2.results || [])],
        nextPage: page + 2
    };
}
