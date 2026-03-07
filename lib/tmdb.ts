const BASE_URL = process.env.TMDB_BASE_URL;
const API_KEY = process.env.TMDB_API_KEY;

// ─── Resilient fetch with exponential backoff retry ──────────────────────────
async function tmdbFetch(url: string, retries = 3): Promise<any> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const res = await fetch(url, {
                next: { revalidate: 300 }, // cache for 5 minutes server-side
                signal: AbortSignal.timeout(8000), // 8s timeout per attempt
            });

            if (!res.ok) {
                // TMDB rate limit — back off
                if (res.status === 429) {
                    const retryAfter = Number(res.headers.get("Retry-After") || 2) * 1000;
                    await sleep(retryAfter);
                    continue;
                }
                // Other HTTP errors — return empty to avoid crash
                console.warn(`[TMDB] HTTP ${res.status} for ${url}`);
                return { results: [], genres: [], success: false };
            }

            return res.json();
        } catch (err: any) {
            const isLast = attempt === retries - 1;
            console.warn(`[TMDB] fetch attempt ${attempt + 1} failed:`, err?.message ?? err);
            if (!isLast) {
                // Exponential backoff: 500ms, 1000ms, 2000ms
                await sleep(500 * Math.pow(2, attempt));
            }
        }
    }

    // All retries exhausted — return safe empty payload
    console.error(`[TMDB] All retries exhausted for: ${url}`);
    return { results: [], genres: [], success: false };
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── TMDB API ─────────────────────────────────────────────────────────────────

export const TMDB = {
    getImage: (path: string, size: 'original' | 'w500' = 'original') => {
        return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}/${size}${path}`;
    },

    getTrending: async () => {
        return tmdbFetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    },

    getNowPlaying: async () => {
        return tmdbFetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
    },

    getTopRated: async () => {
        return tmdbFetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
    },

    getPopular: async () => {
        return tmdbFetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    },

    getUpcoming: async () => {
        return tmdbFetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
    },

    getMoviesByCategory: async (category: string, page: number = 1) => {
        const endpointMap: Record<string, string> = {
            trending: '/trending/movie/week',
            now_playing: '/movie/now_playing',
            top_rated: '/movie/top_rated',
            popular: '/movie/popular',
            upcoming: '/movie/upcoming',
        };
        const endpoint = endpointMap[category] ?? '/movie/popular';
        return tmdbFetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${page}`);
    },

    getTvShowsByCategory: async (category: string, page: number = 1) => {
        const endpointMap: Record<string, string> = {
            trending: '/trending/tv/week',
            on_the_air: '/tv/on_the_air',
            top_rated: '/tv/top_rated',
            popular: '/tv/popular',
            airing_today: '/tv/airing_today',
        };
        const endpoint = endpointMap[category] ?? '/tv/popular';
        return tmdbFetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${page}`);
    },

    search: async (query: string) => {
        if (!query.trim()) return { results: [] };

        const encodedQuery = encodeURIComponent(query);

        const [movieData, tvData] = await Promise.all([
            tmdbFetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedQuery}&include_adult=false`),
            tmdbFetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodedQuery}&include_adult=false`),
        ]);

        const movies = (movieData.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
        const tvShows = (tvData.results || []).map((t: any) => ({ ...t, media_type: 'tv' }));

        const combined = [...movies, ...tvShows].sort((a, b) =>
            (b.popularity || 0) - (a.popularity || 0)
        );

        return { results: combined };
    },

    getDetails: async (id: string, type: 'movie' | 'tv' = 'movie') => {
        return tmdbFetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,similar,recommendations`);
    },

    getSeasonDetails: async (tvId: number, seasonNumber: number) => {
        return tmdbFetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    },

    discover: async (
        type: 'movie' | 'tv',
        sort_by: string = 'popularity.desc',
        genre_id?: string,
        page: number = 1,
        provider_id?: string
    ) => {
        let url = `${BASE_URL}/discover/${type}?api_key=${API_KEY}&page=${page}&sort_by=${sort_by}&watch_region=US`;

        // Require minimum votes to avoid obscure results in "Top Rated"
        if (sort_by === 'vote_average.desc') {
            url += `&vote_count.gte=1000`;
        }
        if (genre_id) url += `&with_genres=${genre_id}`;
        if (provider_id) url += `&with_watch_providers=${provider_id}`;

        return tmdbFetch(url);
    },

    getGenres: async (type: 'movie' | 'tv') => {
        return tmdbFetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`);
    },

    getWatchProviders: async (type: 'movie' | 'tv') => {
        return tmdbFetch(`${BASE_URL}/watch/providers/${type}?api_key=${API_KEY}&watch_region=US`);
    },
};
