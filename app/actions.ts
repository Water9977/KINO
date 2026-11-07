"use server";

import { TMDB, isKnownCategory } from "@/lib/tmdb";
import {
    DISCOVER_SORTS,
    isIdLike,
    isMediaType,
    isNumericString,
} from "@/lib/validate";
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
    // Server Action arguments arrive from the network untyped, so TypeScript's types prove
    // nothing here: reject anything that could change which TMDB URL the server requests.
    if (!isMediaType(type)) throw new Error("Invalid media type");
    if (category !== "discover" && !isKnownCategory(category, type)) {
        throw new Error("Invalid category");
    }
    if (filters !== undefined) {
        if (filters === null || typeof filters !== "object") throw new Error("Invalid filters");
        if (filters.sort_by && !DISCOVER_SORTS.includes(filters.sort_by)) {
            throw new Error("Invalid sort order");
        }
        if (filters.genre_id && !isNumericString(filters.genre_id)) throw new Error("Invalid genre");
        if (filters.provider_id && !isNumericString(filters.provider_id)) {
            throw new Error("Invalid provider");
        }
    }

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

    const [firstResult, secondResult] = await Promise.allSettled([
        loadPage(safePage),
        loadPage(secondPage),
    ]);

    // A failed first page throws, so the grid shows its error + "Try again" state instead of the
    // end-of-list message. `nextPage` is not advanced on a throw, so a retry fetches the same pages.
    if (firstResult.status === "rejected") throw firstResult.reason;
    const first = firstResult.value;

    // TMDB reports total_pages on every list response. Trust it when present,
    // and otherwise fall back to "an empty batch means we're done".
    const totalPages = Math.min(first.total_pages ?? MAX_TMDB_PAGE, MAX_TMDB_PAGE);

    // The second page legitimately may not exist (past the last page); any other failure must not
    // be mistaken for the end of the list or silently drop 20 titles.
    if (secondResult.status === "rejected" && secondPage <= totalPages) throw secondResult.reason;
    const second = secondResult.status === "fulfilled" ? secondResult.value : { results: [] };

    const movies = [...(first.results || []), ...(second.results || [])];
    const hasMore = movies.length > 0 && secondPage < totalPages;

    return { movies, nextPage: secondPage + 1, hasMore };
}

export async function getSeasonDetails(
    tvId: number,
    seasonNumber: number
): Promise<TmdbSeasonDetails> {
    // Interpolated straight into the TMDB path, so a value like "../credits" would make the
    // server request an arbitrary TMDB URL with the site's API key.
    if (!isIdLike(tvId) || !isIdLike(seasonNumber, 1000)) throw new Error("Invalid id");
    return TMDB.getSeasonDetails(tvId, seasonNumber);
}
