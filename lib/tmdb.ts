import type {
    MediaType,
    TmdbDetails,
    TmdbGenreResponse,
    TmdbListItem,
    TmdbListResponse,
    TmdbProviderResponse,
    TmdbSeasonDetails,
} from "./types";

const BASE_URL = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY && process.env.NODE_ENV !== "production") {
    console.warn("[TMDB] TMDB_API_KEY is not set — every request will fail.");
}

// ─── Tunables ─────────────────────────────────────────────────────────────────

export const TMDB_CONFIG = {
    /** Server-side cache lifetime for every TMDB response, in seconds. */
    revalidateSeconds: 300,
    /** Per-attempt request timeout. */
    timeoutMs: 8000,
    /** Total attempts before giving up and returning an empty payload. */
    retries: 3,
    /** Minimum vote count when sorting by rating, so obscure titles don't win. */
    minVotesForTopRated: 1000,
    /** Region used for watch-provider availability. */
    watchRegion: "US",
} as const;

// ─── Image helper ─────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type PosterSize = "w92" | "w154" | "w300" | "w500";
export type BackdropSize = "w300" | "w780" | "w1280" | "original";
export type StillSize = "w300" | "w400";
export type ProfileSize = "w185" | "w300";

/**
 * Builds a TMDB image URL, or returns null when there is no image.
 *
 * Always prefer this over hand-writing image.tmdb.org URLs — callers get a
 * null to branch on instead of silently rendering `.../w500null`.
 */
export function tmdbImage(
    path: string | null | undefined,
    size: PosterSize | BackdropSize | StillSize | ProfileSize
): string | null {
    if (!path) return null;
    return `${IMAGE_BASE}/${size}${path}`;
}

// ─── Resilient fetch with exponential backoff retry ──────────────────────────

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const EMPTY_PAYLOAD = { results: [], genres: [], success: false };

async function tmdbFetch<T>(url: string): Promise<T> {
    for (let attempt = 0; attempt < TMDB_CONFIG.retries; attempt++) {
        try {
            const res = await fetch(url, {
                next: { revalidate: TMDB_CONFIG.revalidateSeconds },
                signal: AbortSignal.timeout(TMDB_CONFIG.timeoutMs),
            });

            if (!res.ok) {
                // TMDB rate limit — respect Retry-After and try again.
                if (res.status === 429) {
                    const retryAfter = Number(res.headers.get("Retry-After") || 2) * 1000;
                    await sleep(retryAfter);
                    continue;
                }
                console.warn(`[TMDB] HTTP ${res.status} for ${redact(url)}`);
                return EMPTY_PAYLOAD as T;
            }

            return (await res.json()) as T;
        } catch (err) {
            const isLast = attempt === TMDB_CONFIG.retries - 1;
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`[TMDB] attempt ${attempt + 1} failed: ${message}`);
            if (!isLast) {
                // Exponential backoff: 500ms, 1000ms, 2000ms
                await sleep(500 * Math.pow(2, attempt));
            }
        }
    }

    console.error(`[TMDB] All retries exhausted for: ${redact(url)}`);
    return EMPTY_PAYLOAD as T;
}

/** Strips the API key before a URL reaches any log. */
function redact(url: string) {
    return url.replace(/api_key=[^&]*/, "api_key=***");
}

function buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
    const search = new URLSearchParams({ api_key: API_KEY ?? "" });
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") search.set(key, String(value));
    }
    return `${BASE_URL}${path}?${search.toString()}`;
}

// ─── Category endpoint maps ───────────────────────────────────────────────────

const MOVIE_CATEGORIES = {
    trending: "/trending/movie/week",
    now_playing: "/movie/now_playing",
    top_rated: "/movie/top_rated",
    popular: "/movie/popular",
    upcoming: "/movie/upcoming",
} as const;

const TV_CATEGORIES = {
    trending: "/trending/tv/week",
    on_the_air: "/tv/on_the_air",
    top_rated: "/tv/top_rated",
    popular: "/tv/popular",
    airing_today: "/tv/airing_today",
} as const;

export type MovieCategory = keyof typeof MOVIE_CATEGORIES;
export type TvCategory = keyof typeof TV_CATEGORIES;

/** True when `slug` is a category this app actually serves. Used to 404 unknown slugs. */
export function isKnownCategory(slug: string, type: MediaType): boolean {
    const map = type === "tv" ? TV_CATEGORIES : MOVIE_CATEGORIES;
    return slug in map;
}

// ─── TMDB API ─────────────────────────────────────────────────────────────────

export const TMDB = {
    getTrending: () => tmdbFetch<TmdbListResponse>(buildUrl(MOVIE_CATEGORIES.trending)),

    getNowPlaying: () => tmdbFetch<TmdbListResponse>(buildUrl(MOVIE_CATEGORIES.now_playing)),

    getTopRated: () => tmdbFetch<TmdbListResponse>(buildUrl(MOVIE_CATEGORIES.top_rated)),

    getPopular: () => tmdbFetch<TmdbListResponse>(buildUrl(MOVIE_CATEGORIES.popular)),

    getUpcoming: () => tmdbFetch<TmdbListResponse>(buildUrl(MOVIE_CATEGORIES.upcoming)),

    getMoviesByCategory: (category: string, page = 1) => {
        const endpoint = MOVIE_CATEGORIES[category as MovieCategory] ?? MOVIE_CATEGORIES.popular;
        return tmdbFetch<TmdbListResponse>(buildUrl(endpoint, { page }));
    },

    getTvShowsByCategory: (category: string, page = 1) => {
        const endpoint = TV_CATEGORIES[category as TvCategory] ?? TV_CATEGORIES.popular;
        return tmdbFetch<TmdbListResponse>(buildUrl(endpoint, { page }));
    },

    search: async (query: string): Promise<TmdbListResponse> => {
        if (!query.trim()) return { results: [] };

        const [movieData, tvData] = await Promise.all([
            tmdbFetch<TmdbListResponse>(
                buildUrl("/search/movie", { query, include_adult: "false" })
            ),
            tmdbFetch<TmdbListResponse>(
                buildUrl("/search/tv", { query, include_adult: "false" })
            ),
        ]);

        const movies: TmdbListItem[] = (movieData.results || []).map((m) => ({
            ...m,
            media_type: "movie",
        }));
        const tvShows: TmdbListItem[] = (tvData.results || []).map((t) => ({
            ...t,
            media_type: "tv",
        }));

        const combined = [...movies, ...tvShows].sort(
            (a, b) => (b.popularity || 0) - (a.popularity || 0)
        );

        return { results: combined };
    },

    getDetails: (id: string, type: MediaType = "movie") =>
        tmdbFetch<TmdbDetails>(
            buildUrl(`/${type}/${id}`, {
                append_to_response: "videos,credits,similar,recommendations",
            })
        ),

    getSeasonDetails: (tvId: number, seasonNumber: number) =>
        tmdbFetch<TmdbSeasonDetails>(buildUrl(`/tv/${tvId}/season/${seasonNumber}`)),

    discover: (
        type: MediaType,
        sort_by = "popularity.desc",
        genre_id?: string,
        page = 1,
        provider_id?: string
    ) =>
        tmdbFetch<TmdbListResponse>(
            buildUrl(`/discover/${type}`, {
                page,
                sort_by,
                watch_region: TMDB_CONFIG.watchRegion,
                // Require a minimum vote count so "Top Rated" isn't won by obscure titles.
                ...(sort_by === "vote_average.desc"
                    ? { "vote_count.gte": TMDB_CONFIG.minVotesForTopRated }
                    : {}),
                with_genres: genre_id,
                with_watch_providers: provider_id,
            })
        ),

    getGenres: (type: MediaType) =>
        tmdbFetch<TmdbGenreResponse>(buildUrl(`/genre/${type}/list`)),

    getWatchProviders: (type: MediaType) =>
        tmdbFetch<TmdbProviderResponse>(
            buildUrl(`/watch/providers/${type}`, { watch_region: TMDB_CONFIG.watchRegion })
        ),
};

/**
 * Trims a TMDB list item down to the fields the UI renders.
 *
 * Every field on a Server Component's props is serialized into the RSC payload
 * that ships with the HTML. A browse page carries ~140 titles, and TMDB returns
 * a dozen fields per title that nothing here reads (adult, genre_ids,
 * original_title, video, vote_count, ...). Projecting first keeps that payload
 * meaningfully smaller.
 */
export function toCardItem(item: TmdbListItem, fallbackType?: MediaType): TmdbListItem {
    return {
        id: item.id,
        title: item.title,
        name: item.name,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        media_type: item.media_type ?? fallbackType,
    };
}

/** Projects a whole list, dropping anything without an id. */
export function toCardItems(
    items: TmdbListItem[] | undefined,
    fallbackType?: MediaType
): TmdbListItem[] {
    return (items ?? []).map((item) => toCardItem(item, fallbackType));
}
