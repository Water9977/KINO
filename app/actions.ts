"use server";

import { TMDB } from "@/lib/tmdb";
import type { MediaType, TmdbListItem, TmdbListResponse, TmdbSeasonDetails } from "@/lib/types";

/** TMDB refuses `page` above 500. Clamp so a crafted request can't spin. */
const MAX_TMDB_PAGE = 500;

export interface FetchMoviesResult {
    movies: TmdbListItem[];
    nextPage: number;
    hasMore: boolean;
}

export interface DiscoverFilters {
    sort_by: string;
    genre_id?: string;
    provider_id?: string;
}

/**
 * Loads two TMDB pages at once (40 items) for the infinite-scroll grid.
 * Returns `hasMore: false` once TMDB reports there are no further pages,
 * so the caller never spins on an exhausted list.
 */
export async function fetchMovies(
    category: string,
    page: number,
    type: MediaType = "movie",
    filters?: DiscoverFilters
): Promise<FetchMoviesResult> {
    const safePage = Math.min(Math.max(Math.trunc(page) || 1, 1), MAX_TMDB_PAGE);
    const secondPage = safePage + 1;

    const loadPage = (p: number): Promise<TmdbListResponse> => {
        if (p > MAX_TMDB_PAGE) return Promise.resolve({ results: [] });

        if (category === "discover") {
            return TMDB.discover(
                type,
                filters?.sort_by || "popularity.desc",
                filters?.genre_id,
                p,
                filters?.provider_id
            );
        }
        return type === "tv"
            ? TMDB.getTvShowsByCategory(category, p)
            : TMDB.getMoviesByCategory(category, p);
    };

    const [first, second] = await Promise.all([loadPage(safePage), loadPage(secondPage)]);

    const movies = [...(first.results || []), ...(second.results || [])];

    // TMDB reports total_pages on every list response. Trust it when present,
    // and otherwise fall back to "an empty batch means we're done".
    const totalPages = Math.min(first.total_pages ?? MAX_TMDB_PAGE, MAX_TMDB_PAGE);
    const hasMore = movies.length > 0 && secondPage < totalPages;

    return { movies, nextPage: secondPage + 1, hasMore };
}

export async function getSeasonDetails(
    tvId: number,
    seasonNumber: number
): Promise<TmdbSeasonDetails> {
    return TMDB.getSeasonDetails(tvId, seasonNumber);
}
